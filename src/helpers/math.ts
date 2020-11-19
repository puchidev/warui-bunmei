/**
 * Round a numeric `value` to certain decimal places. Accepts negative values.
 *
 * @param value - Value to round.
 * @param scale - 10, 1, 0.1, 0.01...
 * @returns The rounded number.
 */
export function roundTo(value: number, scale = 1): number {
  const inverse = 1.0 / scale
  return Math.round(value * inverse) / inverse
}

/**
 * Generate a random integer between `min` and `max` values.
 *
 * @param min - Minimum number (inclusive)
 * @param max - Maximum number (exclusive)
 * @returns The generated integer.
 */
export function getRandomInteger(min: number, max: number): number {
  const $min = Math.ceil(min)
  const $max = Math.floor(max)
  return Math.floor(Math.random() * ($max - $min + 1)) + $min
}
