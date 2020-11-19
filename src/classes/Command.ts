import type { PermissionString } from 'discord.js'

/**
 * @constructor
 * This class constructs an object holding core information about a command.
 */
export default class Command {
  /**
   * @constructs Command
   * @param name - The name of command.
   * @param permissions - The required permissions to run the command.
   * @param run - The command handler function.
   */
  constructor(
    readonly name: string,
    readonly run: (...args: any[]) => void,
    readonly permissions?: PermissionString[],
  ) {}
}
