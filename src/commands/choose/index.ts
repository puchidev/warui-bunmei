import type Discord from 'discord.js'
import {
  findDuplicates,
  removeDuplicates,
  randomSelect,
  hasJongSeong,
} from '../../helpers'

export default {
  name: '선택',
  /**
   * Choose an option from given items.
   *
   * @param {Discord.Message} message - The commanding message.
   * @param {string[]} options - The items to choose from.
   */
  run: (message: Discord.Message, options: string[]): void => {
    if (!options.length) {
      message.reply('선택지를 명령어 뒤에 나열해 주겠어?')
      return
    }
    // Only 1 option has been provided
    if (removeDuplicates(options).length === 1) {
      message.reply('답은… 이미 정해져 있었던 거지?')
      return
    }
    // Notify user if duplicate options have been found
    const duplicates = findDuplicates(options)
    if (duplicates) {
      const duplicateString = duplicates.join(', ')
      message.reply(
        `마스터, 「${duplicateString}」${
          hasJongSeong(duplicateString) ? '이' : ''
        }라는 이중 존재를 체포했어.`,
      )
      return
    }
    // Choose an option and return it to the requestor.
    const selected = randomSelect(options)
    message.reply(`마스터가 원하는 것은 「**${selected}**」일까?`)
  },
}
