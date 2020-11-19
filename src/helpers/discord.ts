import Discord from 'discord.js'

/**
 * Regular expressions targeting all types of mentions in chat; we are removing `/g` modifier
 * which causes RegExp.lastIndex to be shifted on each call then return unexpected results.
 */
const USERS_PATTERN = new RegExp(Discord.MessageMentions.USERS_PATTERN.source)
const ROLES_PATTERN = new RegExp(Discord.MessageMentions.ROLES_PATTERN.source)
const CHANNELS_PATTERN = new RegExp(
  Discord.MessageMentions.CHANNELS_PATTERN.source,
)
const EVERYONE_PATTERN = new RegExp(
  Discord.MessageMentions.EVERYONE_PATTERN.source,
)

/**
 * Test if the bot has required permissions in the channel where the request message is sent.
 *
 * @param message - The message to test.
 * @param permissions - The permissions the bot has to have for a specific task.
 * @returns Whether the bot has relevant permissions.
 */
export function botHasPermissions(
  message: Discord.Message,
  permissions: Discord.PermissionResolvable,
): boolean {
  if (!message.guild || !message.guild.me) {
    throw new Error(
      'Unable to find `guild` or `guild.me` in the message object.',
    )
  }
  return message.guild.me.hasPermission(permissions)
}

/**
 * Test if a message is mentioning the bot.
 *
 * @param message - The message to test.
 * @returns Whether the bot is mentioned in the message passed.
 */
export function botIsMentioned(message: Discord.Message): boolean {
  const { client, mentions } = message
  if (!client.user) {
    throw new Error('Unable to find `client.user` in the message object.')
  }
  return mentions.has(client.user)
}

/**
 * Test if the given string value matches any mention format.
 *
 * @param value - The message text to test.
 * @returns Whether the value is a mention.
 */
export function isMention(value: string): boolean {
  return (
    USERS_PATTERN.test(value) ||
    ROLES_PATTERN.test(value) ||
    CHANNELS_PATTERN.test(value) ||
    EVERYONE_PATTERN.test(value)
  )
}

/**
 * Convert an user ID to a mention string.
 *
 * @param userID - The ID of the user that should be mentioned.
 * @returns Converted mention string.
 */
export function userIdToMention(userID: string): string {
  return `<@${userID}>`
}

/**
 * Convert an user object to a mention string.
 *
 * @param user - The user that should be mentioned.
 * @returns Converted mention string.
 */
export function userToMention({ id }: Discord.User): string {
  return userIdToMention(id)
}

/**
 * Get collection of users that are mentioned in a chat message.
 *
 * @param message - The chat message to inspect.
 * @returns Collection of mentioned users.
 */
export async function getMentionedUsers(
  message: Discord.Message,
): Promise<Discord.Collection<Discord.Snowflake, Discord.User>> {
  const { guild, mentions } = message
  if (!guild) {
    throw new Error('The message does not contain a guild object')
  }
  // If the message mentions everyone, return all guild members as a collection of users
  if (mentions.everyone) {
    const guildMembers = await guild.members.fetch()
    return guildMembers.mapValues(({ user }) => user)
  }
  // Find users from mentioned roles and usernames and return them
  const mentioned: Discord.Collection<
    Discord.Snowflake,
    Discord.User
  > = new Discord.Collection()
  mentions.roles.forEach(({ members }) => {
    members.forEach(({ user }) => {
      mentioned.set(user.id, user)
    })
  })
  mentions.users.forEach((user, userID) => {
    mentioned.set(userID, user)
  })
  return mentioned
}

/**
 * Find guild members by their nicknames and return them as a collection of users.
 *
 * @param message - The message that contains user.
 * @param names - The names of users to look for.
 * @returns Collection of Found guild members.
 */
export async function getMembersByName(
  { guild }: Discord.Message,
  names: string[],
): Promise<Discord.Collection<Discord.Snowflake, Discord.User>> {
  if (!guild) {
    throw new Error('The message does not contain a guild object')
  }
  const guildMembers = await guild.members.fetch()
  const unmatches = new Set(names)
  const matches = guildMembers.filter(({ user: { username } }) => {
    if (names.includes(username)) {
      unmatches.delete(username)
      return true
    }
    return false
  })
  // If some of the `names` do not have any matching guild member,
  // throw an error containing these names as the error message.
  if (unmatches.size) {
    throw new Error([...unmatches].join(', '))
  }
  // Convert the collection of guild members to that of users
  return matches.mapValues(({ user }) => user)
}

/**
 * Create an embed block with the data passed, with opinionated styles.
 *
 * @param query
 * @param query.title - The title for the embed.
 * @param query.fields - Entries containing data for embed fields.
 * @returns Created discord embed object.
 */
export function createEmbed({
  title,
  fields,
}: {
  title?: string
  fields?: Discord.EmbedFieldData[]
}): Discord.MessageEmbed {
  const embed = new Discord.MessageEmbed()
  if (title) {
    embed.setTitle(title)
  }
  if (fields) {
    // Make field names **booooold**
    const embedFields = fields.map(({ name, value }) => ({
      name: `**${name}**`,
      value,
    }))
    embed.addFields(embedFields)
  }
  return embed
}
