import type Discord from 'discord.js'
import { getMembersByName, getMentionedUsers, isMention } from '../../helpers'
import logger from '../../devtools/logger'
import { startCounting } from './_counter'
import ReadinessWatcher from './_ReadinessWatcher'
import { cacheLasts, getCache, setCache } from './_store'
import { CountdownState } from './_types'

// The time (in milliseconds) within which all members of the countdown
// should ready up. After that time, the request is cancelled automatically.
const requestLasts = 3 * 60 * 1000 // 3 min.
// The time (in milliseconds) to wait before re-prompt members that did not respond.
const repromptAfter = 1 * 60 * 1000 // 1 min.

/**
 * Start watching members until they all ready up
 *
 * @param {object} arg
 * @param {Discord.Message} message - The commanding message.
 * @param {Discord.Collection} members - The countdown members.
 * @param {Discord.Collection} mentioned - The members that have already been mentioned in the message.
 */
function handleStart({
  message,
  members,
  mentioned,
}: {
  message: Discord.Message
  members: Discord.Collection<Discord.Snowflake, Discord.User>
  mentioned?: Discord.Collection<Discord.Snowflake, Discord.User>
}): void {
  const { channel } = message
  const memberIDs = [...members.keys()]
  // instantiate watcher
  const watcher = new ReadinessWatcher({
    message,
    members,
    mentioned,
    requestLasts,
    repromptAfter,
  })
  // Leave trace to the current request
  setCache(channel.id, { members, watcher, state: CountdownState.Awaiting })
  // Start watching
  watcher.watch()
  // Log
  logger.info(
    `countdown request | channel: ${channel.id} | members: ${memberIDs}`,
  )
}

export default {
  name: '카운트',
  aliases: [
    { name: '카운트다시', flag: 'REPEAT' },
    { name: 'ㄱ', flag: 'IMMEDIATE' },
    { name: 'ㅇㅋ', flag: 'READY' },
    { name: 'ㄴㄴ', flag: 'CANCEL' },
  ],
  permissions: ['MANAGE_MESSAGES'],
  /**
   * Start a countdown when all of the invited members ready up.
   * Useful when you want to start watching a show with remote friends.
   *
   * @param message - The commanding message.
   * @param invitees - Members to invite to the countdown.
   * @param flag - The modifier to the handler's behavior.
   */
  run: async (
    message: Discord.Message,
    invitees = [],
    flag?: string,
  ): Promise<void> => {
    const { author, channel } = message
    const lastTrace = getCache(channel.id)

    // `READY` flag -> Set the author user state as ready
    if (flag === 'READY' || flag === 'CANCEL') {
      // There is no active countdown request
      if (
        typeof lastTrace !== 'object' ||
        !lastTrace.watcher ||
        lastTrace.state !== CountdownState.Awaiting
      ) {
        message.reply('채널에서 진행중인 카운트다운이 없어.')
        return
      }
      if (flag === 'READY') {
        lastTrace.watcher.handleReady(author)
      }
      if (flag === 'CANCEL') {
        lastTrace.watcher.handleCancel()
      }
      return
    }

    // There is an active request in the channel
    if (lastTrace && lastTrace.state !== CountdownState.Done) {
      // Respond to the user unless we are in the middle of the countdown —
      // sending a message in between countdown may hit the rate limit of the bot
      // and delay countdown ticks.
      if (lastTrace.state !== CountdownState.Counting) {
        message.reply('채널에서 이미 카운트다운이 진행중이야.')
      }
      return
    }

    // `IMMEDIATE` flag: Start countdown directly.
    if (flag === 'IMMEDIATE') {
      // Notify users first
      message.reply('바로 카운트다운을 시작할게.')
      // Start countdown
      startCounting(channel)
      return
    }

    // `REPEAT` flag -> Repeat the latest recorded request of the same channel
    if (flag === 'REPEAT') {
      // No request lastTrace found :(
      if (!lastTrace || !lastTrace.members) {
        message.reply(
          `채널에 저장된 카운트 정보가 없어. 정보는 ${Math.round(
            cacheLasts / 60 / 1000,
          )}분간 유지돼.`,
        )
        return
      }
      // Start countdown process
      handleStart({ message, members: lastTrace.members })
      return
    }

    // No invitees provided
    if (!invitees.length) {
      message.reply('누굴 초대할 거야? `/카운트 멤버1 멤버2` 처럼 명령해줘.')
      return
    }

    // A. Users invited with their nicknames
    let namedInvitees
    try {
      const names = invitees.filter(invitee => !isMention(invitee))
      namedInvitees = await getMembersByName(message, names)
    } catch (error) {
      // An error is thrown when a nickname does not match any member of the guild.
      // (The error object contains these names joined as a string.)
      message.reply(`${error.message} 닉네임을 찾을 수 없었어…`)
      return
    }
    // B. Users invited by mentions (e.g. /카운트 @someone#1234)
    const mentionedInvitees = await getMentionedUsers(message)
    // Merge A + B (duplicates are removed safely)
    const members = namedInvitees.concat(mentionedInvitees)
    // Include the countdown requestor to the members
    members.set(author.id, author)
    // Start countdown process
    handleStart({
      message,
      members,
      mentioned: mentionedInvitees,
    })
  },
}
