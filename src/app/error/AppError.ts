/**
 * @fileoverview Custom application error class.
 *
 * Provides a standardized error class for throwing HTTP errors with
 * appropriate status codes throughout the application.
 *
 * @module app/error/AppError
 */

/**
 * Custom error class for application-specific errors.
 *
 * Extends the native Error class to include HTTP status codes,
 * enabling proper error handling and response formatting in
 * Express error middleware.
 *
 * @extends Error
 *
 * @example
 * // Throw a not found error
 * throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
 *
 * @example
 * // Throw a validation error
 * throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid email format');
 *
 * @example
 * // Throw an unauthorized error
 * throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
 */
class AppError extends Error {
  /**
   * HTTP status code for the error.
   */
  public readonly statusCode: number;

  /**
   * Whether this error is operational (expected) vs programming error.
   */
  public readonly isOperational: boolean;

  /**
   * Creates a new AppError instance.
   *
   * @param statusCode - HTTP status code (e.g., 400, 401, 404, 500)
   * @param message - Human-readable error message
   * @param stack - Optional stack trace (auto-captured if not provided)
   */
  constructor(statusCode: number, message: string, stack = '') {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
  }
}

export default AppError;

/* -------------------------------------------------------------------------- */
/*                              ERROR FACTORIES                               */
/* -------------------------------------------------------------------------- */

/**
 * Creates a Bad Request (400) error.
 *
 * @param message - Error message
 * @returns AppError with 400 status code
 */
export const badRequest = (message: string): AppError =>
  new AppError(400, message);

/**
 * Creates an Unauthorized (401) error.
 *
 * @param message - Error message (default: 'Unauthorized')
 * @returns AppError with 401 status code
 */
export const unauthorized = (message = 'Unauthorized'): AppError =>
  new AppError(401, message);

/**
 * Creates a Forbidden (403) error.
 *
 * @param message - Error message (default: 'Forbidden')
 * @returns AppError with 403 status code
 */
export const forbidden = (message = 'Forbidden'): AppError =>
  new AppError(403, message);

/**
 * Creates a Not Found (404) error.
 *
 * @param resource - Name of the resource not found
 * @returns AppError with 404 status code
 */
export const notFound = (resource: string): AppError =>
  new AppError(404, `${resource} not found`);

/**
 * Creates a Conflict (409) error.
 *
 * @param message - Error message
 * @returns AppError with 409 status code
 */
export const conflict = (message: string): AppError =>
  new AppError(409, message);

/**
 * Creates an Internal Server Error (500).
 *
 * @param message - Error message (default: 'Internal server error')
 * @returns AppError with 500 status code
 */
export const internalError = (message = 'Internal server error'): AppError =>
  new AppError(500, message);
