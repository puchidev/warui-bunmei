/**
 * Remove duplicate items from the array passed.
 * @param array - The array or iterable object to filter.
 * @returns An array of unique items.
 */
export function removeDuplicates(array: unknown[]): unknown[] {
  return [...new Set(array)]
}

/**
 * Find duplicate items from the array passed.
 * @param array - The array or iterable object to look into.
 * @returns An array of duplicate items in the original array.
 */
export function findDuplicates(array: unknown[]): unknown[] | null {
  const duplicates = new Set()
  array.forEach((item, _, originalArray) => {
    if (originalArray.indexOf(item) !== originalArray.lastIndexOf(item)) {
      duplicates.add(item)
    }
  })
  return duplicates.size ? [...duplicates] : null
}

/**
 * Choose an arbitrary item from the array passed.
 * @param array - The array to choose the item from
 * @param rando - Method generating a random seed between 0 and 1
 * @returns The chosen item from the original array.
 */
export function randomSelect<T>(array: T[], rando = Math.random): T {
  return array[Math.floor(rando() * array.length)]
}
