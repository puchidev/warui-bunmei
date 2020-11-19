import Discord from 'discord.js'
import { loadCommands } from '../components/commands'
import events from '../components/events'
import logger from '../devtools/logger'

/**
 * @constructor
 * The main class to set up our multi-purpose Discord bot.
 */
export default class WaruiBunmei extends Discord.Client {
  // Prepare the bot then log into Discord
  async init(): Promise<void> {
    await loadCommands()
    this.addEvents()
    this.login().catch(logger.error)
  }

  // Listen to events specified in: `src/components/events`
  addEvents(): void {
    Object.entries(events).forEach(([event, handler]) => {
      this.on(event, handler)
    })
    logger.info('Events successfully initialized.')
  }

  // Log into Discord
  login(token = process.env.DISCORD_TOKEN): Promise<string> {
    return super.login(token)
  }
}
