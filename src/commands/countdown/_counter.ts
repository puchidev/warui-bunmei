import type Discord from 'discord.js'
import { updateCache } from './_store'
import { CountdownState } from './_types'

// Delay before countdown starts
const countBefore = 2000
// Time gap between counts
const countInterval = 800
// Count string's length (11111)
const countRepeat = 5
// Count from this number
const countSize = 3

// Count tick
async function tick(
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
  currentCount: number,
): Promise<void> {
  // Send countdown message to the channel
  const output = String(currentCount || 'ㄱ').repeat(countRepeat)
  await channel.send(output)
  // Recursively invoke the tick until the count hits 0
  if (currentCount === 0) {
    // Update the state to `done`
    updateCache(channel.id, { state: CountdownState.Done })
    return
  }
  setTimeout(() => {
    tick(channel, currentCount - 1)
  }, countInterval)
}

// Start countdown
export function startCounting(
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
): void {
  // Update states
  updateCache(channel.id, { state: CountdownState.Counting, watcher: null })
  // Trigger tick
  setTimeout(() => {
    tick(channel, countSize)
  }, countBefore)
}
