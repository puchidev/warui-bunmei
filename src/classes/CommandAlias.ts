/**
 * @constructor
 * This class constructs an alias object to a command.
 */
export default class CommandAlias {
  /**
   * @constructs CommandAlias
   * @param name - The name of parent command.
   * @param alias - The alias for the parent command.
   * @param flag - Additional flag to be passed to the command handler.
   */
  constructor(
    readonly name: string,
    readonly alias: string,
    readonly flag?: string,
  ) {}
}
