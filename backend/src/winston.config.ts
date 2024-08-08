import { transports, format } from 'winston';
import 'winston-daily-rotate-file';

// Custom format for console logs with colors and styling
const consoleFormat = format.combine(
  format.colorize({ all: true }), // Apply color to all log levels
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Timestamp format
  format.printf(({ timestamp, level, message, stack }) => {
    // Customize colors and layout
    const levelColors = {
      info: '\x1b[36m', // Cyan for info
      warn: '\x1b[33m', // Yellow for warnings
      error: '\x1b[31m', // Red for errors
      debug: '\x1b[32m', // Green for debug
    };
    const color = levelColors[level] || '\x1b[0m'; // Default color
    return `${color}${timestamp} [${level}]${'\x1b[0m'} ${stack || message}`;
  }),
);

// Winston configuration
export const winstonConfig = {
  transports: [
    // File transport for error logs with daily rotation
    new transports.DailyRotateFile({
      filename: `logs/%DATE%-error.log`,
      level: 'error',
      format: format.combine(format.timestamp(), format.json()),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false, // Don't zip logs
      maxFiles: '30d', // Keep logs for up to 30 days
    }),
    // File transport for combined logs with daily rotation
    new transports.DailyRotateFile({
      filename: `logs/%DATE%-combined.log`,
      format: format.combine(format.timestamp(), format.json()),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxFiles: '30d',
    }),
    // Console transport for logs with enhanced format
    new transports.Console({
      format: consoleFormat,
    }),
  ],
};
