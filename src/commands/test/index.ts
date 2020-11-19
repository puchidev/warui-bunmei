import dedent from 'dedent'
import type Discord from 'discord.js'

// Available test types.
const types = {
  mention: '멘션',
  message: 'DM',
}

// Time to wait before running the test
const timeBeforeTesting = 2000

// Bot messages
const MESSAGES = {
  MENTION_ALERT: (timeToCall: number) =>
    `디스코드가 아닌 창을 봐줘. ${timeToCall / 1000}초 뒤에 멘션할께.`,
  MENTION_SENT: '요청했던 호출이야. 도움이 됐어?',
  MESSAGE_ALERT: (timeToCall: number) =>
    `디스코드가 아닌 창을 봐줘. ${timeToCall / 1000}초 뒤에 DM할께.`,
  MESSAGE_SENT: '요청했던 메시지야. 도움이 됐어?',
  INVALID_PARAMETER: dedent`
    가능한 키워드가 아니야.
    내게 가능한 건 \`${Object.values(types).join(' ')}\` 정도 되겠네.`,
}

export default {
  name: '테스트',
  /**
   * This command allows users to test Discord features requiring someone else's help;
   * Currently supported features are: mentions and DMs.
   *
   * @param message - The commanding message.
   */
  run: (
    message: Discord.Message,
    [type, delay]: [type: string, delay: string],
  ): void => {
    const timeout = delay ? parseInt(delay, 10) * 1000 : timeBeforeTesting

    switch (type) {
      // Mention the requestor in a few seconds
      case types.mention:
        message.channel.send(MESSAGES.MENTION_ALERT(timeout))
        setTimeout(() => message.reply(MESSAGES.MENTION_SENT), timeout)
        break

      // Send a DM to the requestor in a few seconds
      case types.message:
        message.channel.send(MESSAGES.MESSAGE_ALERT(timeout))
        setTimeout(() => message.reply(MESSAGES.MESSAGE_SENT), timeout)
        break

      // Not supported test type
      default:
        message.reply(MESSAGES.INVALID_PARAMETER)
        break
    }
  },
}
