/**
 * @fileoverview Request logging middleware using Winston.
 *
 * Logs all incoming HTTP requests with:
 * - Method, URL, status code
 * - Response time
 * - User agent and IP
 * - User ID if authenticated
 *
 * @module app/middlewares/requestLogger
 */

import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

/**
 * Request logging middleware.
 *
 * Logs request details on response finish.
 * Skips logging for health check endpoints.
 */
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Skip logging for health checks and static assets
  const skipPaths = ['/health', '/favicon.ico', '/robots.txt'];
  if (skipPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }

  const startTime = Date.now();

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = (req as unknown as { user?: { _id?: string } }).user?._id;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      userId,
      contentLength: res.get('content-length'),
    };

    // Log level based on status code
    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

export default requestLogger;
