import type Discord from 'discord.js'
import { runCommand } from './commands'
import help from '../commands/help'
import logger from '../devtools/logger'
import { botIsMentioned } from '../helpers'

/* List of events our client should listen to */
export default {
  // @this {Bot} The bot client.
  message: (message: Discord.Message): void => {
    const { author, content, mentions } = message
    const prefix = process.env.COMMAND_PREFIX
    // Ignore bot messages
    if (author.bot) {
      return
    }
    // Skip non-command messages
    if (!content.startsWith(prefix)) {
      // Show help block when a user mentions the bot (except for @everyone call)
      if (!mentions.everyone && botIsMentioned(message)) {
        help.run(message)
      }
      return
    }
    // Parse command and parameters to pass
    const [command, ...params] = content.slice(1).split(/ +/)
    // Find matching command and invoke handler
    runCommand(message, command, params)
  },
  ready: (): void => {
    logger.info('The bot is running.')
  },
  disconnect: (): void => {
    logger.warn('The bot has disconnected.')
    process.exit()
  },
  // Adding multiple reactions succesively triggers a rate limit
  // rateLimit: info => {
  //   logger.info('Rate limit exceeded.')
  //   logger.warn(info)
  // },
}
