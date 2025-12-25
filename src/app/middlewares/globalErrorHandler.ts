import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import config from '../config';

import AppError from '../error/AppError';
import handleCastError from '../error/handleCastError';
import handleDuplicateError from '../error/handleDuplicateError';
import handleValidationError from '../error/handleValidationError';
import handleZodError from '../error/handleZodError';
import { TErrorSources } from '../interface/error.interface';
import logger from '../utils/logger';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Setting default values
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  // Handle specific error types
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'CastError') {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  // Log the error
  logger.error(message, {
    statusCode,
    errorSources,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: (req as unknown as { user?: { _id?: string } }).user?._id,
    stack: err?.stack,
    error: err instanceof Error ? err.message : err,
  });

  // Ultimate return
  const payload: Record<string, unknown> = {
    success: false,
    message,
    statusCode,
    errorSources,
  };

  if (config.NODE_ENV === 'development') {
    payload.stack = err?.stack;
    payload.error = err;
  }

  res.status(statusCode).json(payload);

  // Ensure compatibility with ErrorRequestHandler
  return next();
};

export default globalErrorHandler;
