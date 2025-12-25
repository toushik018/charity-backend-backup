/**
 * @fileoverview Winston logger configuration.
 *
 * Provides centralized logging with:
 * - Console output (colorized in development)
 * - Daily rotating file logs for errors and combined logs
 * - Structured JSON format for production
 *
 * @module app/utils/logger
 */

import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../config';

/* -------------------------------------------------------------------------- */
/*                              LOG DIRECTORY                                  */
/* -------------------------------------------------------------------------- */

/**
 * Directory for log files.
 * Logs are stored in the project root under 'logs' folder.
 */
const LOG_DIR = path.join(process.cwd(), 'logs');

/* -------------------------------------------------------------------------- */
/*                              LOG FORMATS                                    */
/* -------------------------------------------------------------------------- */

/**
 * Custom log format for console output.
 * Includes timestamp, level, and message with colors in development.
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

/**
 * JSON format for file logs.
 * Structured format for easy parsing and analysis.
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/* -------------------------------------------------------------------------- */
/*                              TRANSPORTS                                     */
/* -------------------------------------------------------------------------- */

/**
 * Daily rotating file transport for error logs.
 * - Rotates daily
 * - Keeps logs for 30 days
 * - Max file size 20MB
 */
const errorFileTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
});

/**
 * Daily rotating file transport for all logs.
 * - Rotates daily
 * - Keeps logs for 14 days
 * - Max file size 20MB
 */
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

/**
 * Console transport for development.
 * Shows colorized output in terminal.
 */
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

/* -------------------------------------------------------------------------- */
/*                              LOGGER INSTANCE                                */
/* -------------------------------------------------------------------------- */

/**
 * Winston logger instance.
 *
 * Usage:
 * ```typescript
 * import logger from './utils/logger';
 *
 * logger.info('Server started', { port: 8000 });
 * logger.error('Database connection failed', { error: err.message });
 * logger.warn('Deprecated API called', { endpoint: '/old-api' });
 * logger.debug('Request payload', { body: req.body });
 * ```
 */
const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'fundsus-backend' },
  transports: [
    errorFileTransport,
    combinedFileTransport,
    ...(config.NODE_ENV !== 'production' ? [consoleTransport] : []),
  ],
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
});

// Add console transport in production for container logs (stdout)
if (config.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

export default logger;
