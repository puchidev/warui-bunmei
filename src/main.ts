import dotenv from 'dotenv'
import client from './components/client'
import logger from './devtools/logger'

// Load .env file as `process.env`
dotenv.config({ path: 'variables.env' })

// Log node warnings
process.on('warning', message => {
  logger.warn(`Node warnings: ${message}`)
})

// Log broken promises & avoid client shutdown
process.on('unhandledRejection', reason => {
  logger.warn(`Node unhandled rejection: ${reason}`)
})

// Init client
try {
  client.init()
} catch (error) {
  logger.error(error)
}
