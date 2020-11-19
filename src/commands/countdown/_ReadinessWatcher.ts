import dedent from 'dedent'
import type Discord from 'discord.js'
import {
  ok,
  cancel,
  hasJongSeong,
  roundTo,
  userIdToMention,
  userToMention,
} from '../../helpers'
import logger from '../../devtools/logger'
import { startCounting } from './_counter'
import { updateCache } from './_store'
import {
  CountdownState,
  ReadinessWatcherInterface,
  UserCollection,
} from './_types'

/**
 * @constructor
 *
 * This class creates an object holding information related to countdown members
 * and collect their reactions to make sure they are ready for the countdown.
 */
export default class ReadinessWatcher implements ReadinessWatcherInterface {
  readonly channel:
    | Discord.TextChannel
    | Discord.DMChannel
    | Discord.NewsChannel
  readonly members: UserCollection
  readonly requestor: Discord.User
  readonly invitees: UserCollection
  readonly mentioned: UserCollection | undefined
  readonly unreadyMembers: Set<Discord.Snowflake>
  readonly requestLasts: number
  readonly repromptAfter: number
  isWatching: boolean
  repromptID: NodeJS.Timeout | null

  /**
   * @constructs ReadinessWatcher
   * @param {object} query
   * @param {Discord.Message} query.message - The commanding message.
   * @param {Discord.Collection} query.members - The members taking part in.
   * @param {Discord.Collection} query.mentioned - The members that have already been
   *  mentioned in the request message.
   * @param {number} query.requestLasts - Time after which the request expires.
   * @param {number} query.repromptAfter - Time to wait before reprompting members that did not respond.
   *  regardless of success or failure of the countdown.
   */
  constructor({
    message,
    members,
    mentioned,
    requestLasts,
    repromptAfter,
  }: {
    message: Discord.Message
    members: UserCollection
    mentioned?: UserCollection
    requestLasts: number
    repromptAfter: number
  }) {
    const { author, channel } = message
    const invitees =
      members.size === 1
        ? members
        : members.filter(member => member.id !== author.id)
    // Create a map that the keys representing member ids, values their readiness
    this.channel = channel
    // All members taking part in
    this.members = members
    // The countdown requestor
    this.requestor = author
    // Those who are invited by the requestor
    this.invitees = invitees
    // List of invitees that already have been mentioned in the request message
    this.mentioned = mentioned
    // List of unready users
    this.unreadyMembers = new Set([...invitees.keys()])
    // Time to wait before the requst is being auto cancelled (in ms)
    this.requestLasts = requestLasts
    // Time to wait before reprompting members that did not respond
    this.repromptAfter = repromptAfter
    // Watch state
    this.isWatching = false
    // NodeJS.setTimeout ID for reprompting responseless users
    this.repromptID = null
  }

  // Start collecting reactions from members
  async watch(): Promise<void> {
    const {
      channel,
      members,
      mentioned,
      requestor,
      requestLasts,
      repromptAfter,
    } = this

    // Set watching flag
    this.isWatching = true

    // Notify invitees
    const mentions = members.map((member, memberID) => {
      // Don't mention again if the member
      // 1. is the requestor
      // 2. already has been mentioned
      if (
        member.id === requestor.id ||
        (mentioned && mentioned.has(memberID))
      ) {
        return member.username
      }
      // Otherwise, wake the user up
      return userToMention(member)
    })
    const requestLastsInMinute = roundTo(requestLasts / 1000 / 60, 0.1)
    const messageText = dedent`
      ${mentions.join(', ')}, 카운트다운을 시작하려고 해.
      아래 보이는 ${cancel} / ${ok} 버튼, 아니면 \`/ㅇㅋ\`나 \`/ㄴㄴ\`를 입력해서 준비됐는지 알려줘.
      ${requestLastsInMinute}분 안에 모든 멤버가 준비되지 않는다면 내가 취소할께.`
    const notification = await this.channel.send(messageText)

    // Add emoji to the notification message
    // We need to await to keep their order the same every time
    await notification.react(cancel)
    await notification.react(ok)

    // Listen to reactions from invitees
    const filter = this.handleReaction.bind(this)
    const options = { time: requestLasts, errors: ['time'] }
    notification.awaitReactions(filter, options).catch(() => {
      // Some members still did noot responded after the time limit
      if (this.isWatching) {
        // clear the channel's watch state
        this.unwatch()
        // Notify users
        this.channel.send(
          '멤버들이 준비되지 않은 것 같아. 카운트다운을 멈추도록 할께.',
        )
        // Update states
        updateCache(channel.id, { state: CountdownState.Done, watcher: null })
      }
    })

    // Schedule a re-prompt for members that do not respond
    this.repromptID = setTimeout(this.reprompt.bind(this), repromptAfter)
  }

  // Reset side effects during the `watch()` process
  unwatch(): void {
    const { repromptID } = this
    // Flip the state
    this.isWatching = false
    // Cancel re-prompt
    if (repromptID) {
      clearTimeout(repromptID)
      this.repromptID = null
    }
  }

  // Re-prompt users that has not responded to the message.
  reprompt(): void {
    const { channel, unreadyMembers } = this
    // For safety
    if (!unreadyMembers.size) {
      return
    }
    const mentions = [...unreadyMembers].map(memberID =>
      userIdToMention(memberID),
    )
    const messageText = dedent`
      ${mentions.join(
        ', ',
      )}, 카운트다운에 초대됐어. 준비됐다면 \`/ㅇㅋ\`를 입력해주겠어?`
    channel.send(messageText)
  }

  /**
   * Handler for reactions from members; this follows the API of
   *
   * @api Discord.Message.awaitReactions
   * @param {Discord.MessageReaction} reaction - The reaction detected.
   * @param {string} reaction.emoji - The emoji reaction detected.
   * @param {Discord.User} user - The user that provided the reaction.
   */
  handleReaction(
    { emoji }: Discord.MessageReaction,
    user: Discord.User,
  ): boolean {
    const { members } = this
    if (this.isWatching) {
      // Requestor or a member wants to cancel
      if (emoji.name === cancel && members.has(user.id)) {
        this.handleCancel()
        return true
      }
      // A previously unready member said `ok`
      if (emoji.name === ok) {
        this.handleReady(user)
        return true
      }
    }
    return false
  }

  /**
   * Set a member as ready.
   *
   * @param {Discord.User} user - The user that just readied up.
   */
  handleReady(user: Discord.User): void {
    const { channel, members, unreadyMembers } = this
    // Ignore if the user is not a member or a ready member
    if (!unreadyMembers.has(user.id)) {
      return
    }
    // Set the user ready
    unreadyMembers.delete(user.id)
    // If there is an unready member
    if (this.unreadyMembers.size) {
      // Notify the user that we understood the request
      channel.send(
        `${user.username}${
          hasJongSeong(user.username) ? '이' : '가'
        } 준비된 모양이야.`,
      )
    } else {
      // Otherwise, start countdown
      const mentions = members.map(member => userToMention(member))
      // Wake all members up again
      this.channel.send(
        `${mentions.join(', ')} 모두들 준비된 모양이야. 카운트다운을 시작할께.`,
      )
      // Start counting
      this.startCounting()
    }
  }

  // Cancel the countdown request
  handleCancel(): void {
    const { channel } = this
    // Clear data
    this.unwatch()
    // Update states
    updateCache(channel.id, { state: CountdownState.Done, watcher: null })
    // Send answer message
    channel.send('취소하고 싶단 말이지? 좋아, 카운트를 멈출께.')
    // Log
    logger.info(`countdown cancelled | channel: ${channel.id}`)
  }

  // Notify users and start the countdown
  startCounting(): void {
    const { channel } = this
    // Clear data
    this.unwatch()
    // Log
    logger.info(`countdown success | channel: ${channel.id}`)
    // Start counting
    startCounting(channel)
  }
}
