// Custom logger
// @api https://github.com/winstonjs/winston#readme
import { createLogger, format, transports } from 'winston'
// Rotate logs based on the date & remove old ones
import 'winston-daily-rotate-file'

// Custom formatter
// @example YYYY-MM-DD HH:mm:ss [info] blah blah
const myFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] ${message}`
})

export default createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    // debug: 5,
    // silly: 6,
  },
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    myFormat,
  ),
  transports: [
    // Console log
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.colorize(), // Add color only to the console
        myFormat,
      ),
    }),
    // Error log files
    new transports.DailyRotateFile({
      level: 'error',
      dirname: 'logs',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
    // Combined log files
    new transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
  ],
})
