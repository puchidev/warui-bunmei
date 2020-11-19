import logger from '../../devtools/logger'
import { ChannelData } from './_types'

// The time (in milliseconds) on how long the countdown history is cached.
export const cacheLasts = 60 * 60 * 1000 // 60 min.
// The intervals (in milliseconds) on how often to clear countdown history.
const cacheClearInterval = 1 * 60 * 1000 // 1 min.

// Map object containing countdown request state per channel
const cache = new Map<string, ChannelData>()

/**
 * Test if there is any countdown history cached for the channel matching passed ID.
 *
 * @param {string} channelID -  The channel's id.
 * @returns Whether the channel has cached history.
 */
export function hasCache(channelID: string): channelID is keyof typeof cache {
  return cache.has(channelID)
}

/**
 * Retrieve cached countdown history for the channel matching passed ID.
 *
 * @param {string} channelID -  The channel's id.
 * @returns Cached countdown history for the channel.
 */
export function getCache(channelID: string): ChannelData | undefined {
  return cache.get(channelID)
}

/**
 * Add countdown request history in the cache map.
 *
 * @param {number} channelID - The ID of the channel that the request is originated from.
 * @param {object} data - Object to store in the cache.
 */
export function setCache(channelID: string, data: Partial<ChannelData>): void {
  cache.set(channelID, { ...data, createdAt: Date.now() })
}

/**
 * Update cached countdown history with new changes.
 *
 * @param {string} channelID - The channel's id.
 * @param {object} changes - Modifications to the cached history object.
 */
export function updateCache(
  channelID: string,
  changes: Partial<ChannelData>,
): void {
  // Set cache to prevent duplicate request while counting
  if (hasCache(channelID)) {
    setCache(channelID, { ...getCache(channelID), ...changes })
  } else {
    setCache(channelID, changes)
  }
}

/**
 * Delete cached countdown history for the channel matching passed ID.
 *
 * @param {string} channelID - The channel's id.
 */
function deleteCache(channelID: string): void {
  cache.delete(channelID)
}

/**
 * Clean up history entries created more than `cacheLasts` milliseconds ago.
 */
function clearCache() {
  const currentTime = Date.now()
  cache.forEach(({ createdAt }, channelID) => {
    if (currentTime - createdAt > cacheLasts) {
      deleteCache(channelID)
      logger.info(`countdown info cleared | channel: ${channelID}`)
    }
  })
}

// Periodically clear expired portion of the cache
setInterval(clearCache, cacheClearInterval)
