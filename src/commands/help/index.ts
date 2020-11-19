import dedent from 'dedent'
import type Discord from 'discord.js'
import { createEmbed } from '../../helpers'

const helpBlock = {
  title: '나쁜 문명을 탐험해 볼래?',
  fields: [
    {
      name: '/테스트',
      value: dedent`나한테 알림을 받아보고 싶다면 사용해줘.
                   \`/테스트 멘션\` \`/테스트 DM\``,
    },
    {
      name: '/카운트',
      value: dedent`카운트다운에 부를 멤버를 적어줘. @는 붙이지 않아도 좋아.
                   \`/카운트 유저1 유저2\` 처럼 말이야.
                  최근에 실행한 카운트다운을 반복하려면 \`/카운트다시\`를,
                  멤버들을 호출하지 않고 바로 카운트하려면 \`/ㄱ\`를 사용할 수 있어.`,
    },
    {
      name: '/선택',
      value: dedent`선택지를 나열해 주면 하나를 골라줄 거야.
                   \`/선택 잠 애니 게임\` 처럼 명령해줘.`,
    },
    {
      name: '/주사',
      value: dedent`주사위를 굴려볼 수 있어. 눈의 수를 바꿀 수도 있지.
                   \`/주사 10\` 처럼 입력하면 돼.`,
    },
    // {
    //   name: '/가챠',
    //   value: dedent`\`/가챠 페그오\`
    //                 가챠아ㅏ 가챠다아아ㅏ앗 돌리고 또 돌리는 거야아아
    //                 10연챠 말고도 단챠나 커스텀 연챠도 가능해...
    //                 \`/가챠 페그오 22\` 처럼 한 칸 띄고 연챠횟수를 불러줘.`,
    // },
  ],
}

export default {
  name: '도움말',
  aliases: ['도움'],
  /**
   * Show usage guide of the bot.
   *
   * @param message - The commanding message.
   */
  run: (message: Discord.Message): void => {
    const embed = createEmbed(helpBlock)
    message.channel.send(embed)
  },
}
