const UNICODE_GA = 44032 // 가
const UNICODE_HIH = 55203 // 힣

/**
 * Test if a letter is a Korean letter.
 * (This only checks the first letter of the passed string.)
 *
 * @param letter - The letter to test.
 * @returns Whether the character is a Korean character.
 */
function isKoreanChar(letter: string): boolean {
  // We assume the letter is one-character long.
  const charCode = letter.charCodeAt(0)
  return UNICODE_GA <= charCode && charCode <= UNICODE_HIH
}

/**
 * Korean postpositions transform depending on the composition of
 * the word's last character which they immediately follow.
 * This function makes sure how we should handle them
 * by checking the existence of 'jong-seong' in the passed word.
 *
 * @param word - The string to check for jong-seong
 * @returns Whether the passed string has a jong-seong.
 */
export function hasJongSeong(word: string): boolean {
  if (!word) {
    throw new Error('Requires a string to test.')
  }
  const lastChar = word.charAt(word.length - 1)
  const lastCharCode = lastChar.charCodeAt(0)
  if (!isKoreanChar(lastChar)) {
    return false
  }
  return (lastCharCode - UNICODE_GA) % 28 !== 0
}
