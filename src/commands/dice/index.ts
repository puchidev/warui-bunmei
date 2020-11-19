import type Discord from 'discord.js'
import { bold, getRandomInteger } from '../../helpers'

export default {
  name: '주사',
  /**
   * Roll a virtual dice of custom sides.
   *
   * @param {Discord.Message} message - The commanding message.
   * @param {[number]} numberOfSides - The size of the dice.
   */
  run: (
    message: Discord.Message,
    [numberOfSides]: [numberOfSides: string],
  ): void => {
    const sides = numberOfSides ? Number(numberOfSides) : 6
    // The size is not a number
    if (isNaN(sides)) {
      message.reply('이 주사위는 숫자를 원하고 있어.')
      return
    }
    // The size is too large
    if (sides > Number.MAX_SAFE_INTEGER) {
      message.reply('너무 많은 눈을 가진 주사위는 혼돈을 가져올 뿐이야.')
      return
    }
    // Weird number of side (floats, negative numbers...)
    if (!Number.isInteger(sides) || sides < 2) {
      message.reply(
        `${bold(
          sides,
        )}개의 눈을 가진 주사위가 이 세계에 존재할 확률을 먼저 계산해 볼께.`,
      )
      return
    }
    // Generate a random positive integer within the number of sides and return
    const result = getRandomInteger(1, sides)
    message.reply(
      `${bold(sides)}개의 눈을 가진 주사위를 던져서 ${bold(
        result,
      )}의 눈이 나왔어.`,
    )
  },
}
