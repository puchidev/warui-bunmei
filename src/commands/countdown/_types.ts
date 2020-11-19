import type Discord from 'discord.js'

// Possible states of a channel along the countdown process
export enum CountdownState {
  Awaiting,
  Counting,
  Done,
}

export type UserCollection = Discord.Collection<Discord.Snowflake, Discord.User>

export interface ReadinessWatcherInterface {
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
  watch(): Promise<void>
  unwatch(): void
  reprompt(): void
  handleReaction(
    { emoji }: Discord.MessageReaction,
    user: Discord.User,
  ): boolean
  handleReady(user: Discord.User): void
  handleCancel(): void
  startCounting(): void
}

export type ChannelData = {
  members?: UserCollection
  state?: CountdownState
  watcher?: ReadinessWatcherInterface | null
  createdAt: number
}
