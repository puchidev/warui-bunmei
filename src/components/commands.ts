import Discord from 'discord.js'
import Command from '../classes/Command'
import CommandAlias from '../classes/CommandAlias'
import logger from '../devtools/logger'
import { botHasPermissions, importGlob } from '../helpers'

type CommandAliasData = string | { name: string; flag?: string }

type CommandName = string

type CommandData = {
  name: CommandName
  aliases?: CommandAliasData[]
  permissions?: Discord.PermissionString[]
  run: (...args: any[]) => void
}

type Commands = Discord.Collection<CommandName, Command | CommandAlias>

// Master map object containing all commands, alias and their handler functions.
const commands: Commands = new Discord.Collection()

/**
 * Load commands from the files in command directory.
 */
export async function loadCommands(): Promise<void> {
  let hasError = false
  await importGlob({
    // Look for all .ts files in `src/commands` tree
    pattern: 'src/commands/**/*.ts',
    // Exclude files starting with `_`
    options: { ignore: 'src/commands/**/_*.ts' },
    // Successfully loaded
    onResolve: (esModule: { default: CommandData }): void => {
      const data = esModule.default
      if (data.aliases) {
        data.aliases.forEach(alias => {
          addAlias(data, alias)
        })
      }
      addCommand(data)
    },
    // Failed to load
    onReject: (error: Error): void => {
      hasError = true
      logger.error(error.message)
    },
  })
  if (!hasError && commands.size) {
    logger.info('Commands successfully loaded.')
  }
}

/**
 * Register a command.
 *
 * @param command - The data to pass to the command constructor.
 */
export function addCommand({ name, permissions, run }: CommandData): void {
  const $command = new Command(name, run, permissions)
  commands.set(name, $command)
}

/**
 * Unregister a command.
 *
 * @param {string} name - The name of the command to remove.
 */
export function removeCommand(name: CommandName): void {
  commands.delete(name)
}

/**
 * Add an alias to the existing command.
 *
 * @param name - The name of the original command.
 * @param alias - The alias data.
 */
export function addAlias(command: CommandData, alias: CommandAliasData): void {
  let $alias
  switch (typeof alias) {
    case 'string':
      $alias = new CommandAlias(command.name, alias)
      break

    case 'object':
      $alias = new CommandAlias(command.name, alias.name, alias.flag)
      break

    default:
      throw new Error('Unknown type of alias')
  }
  commands.set($alias.alias, $alias)
}

/**
 * Handle a command that the client has detected.
 *
 * @param {string} command - The received command.
 * @param {array} params - Parameters to pass to the command
 * @param {object} message - Discord.js message object (https://discord.js.org/#/docs/main/stable/class/Message)
 */
export function runCommand(
  message: Discord.Message,
  name: CommandName,
  params?: string[],
): void {
  // Find matching command
  let command = commands.get(name)
  let flag: string | undefined
  // Skip if invalid command
  if (!command) {
    return
  }
  // Redirect an alias to its parent command
  if (!('run' in command)) {
    flag = command.flag
    command = commands.get(command.name) as Command
  }
  // Check if any permissions are required
  if (command.permissions && !botHasPermissions(message, command.permissions)) {
    message.reply(
      `명령을 수행하려면 권력이 필요해. ${command.permissions.join(', ')}`,
    )
    return
  }
  // Run the handler
  command.run(message, params, flag)
}
