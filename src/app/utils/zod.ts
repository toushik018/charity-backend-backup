/**
 * @fileoverview Shared Zod validation helpers.
 *
 * Centralized Zod schema helpers used across all backend modules to keep
 * validation logic consistent and avoid duplicating common patterns.
 *
 * @module app/utils/zod
 */

import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*                              REGEX CONSTANTS                               */
/* -------------------------------------------------------------------------- */

/**
 * MongoDB ObjectId format (24 hex characters).
 *
 * @example
 * '507f1f77bcf86cd799439011' // valid
 * 'invalid-id' // invalid
 */
export const MONGODB_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/* -------------------------------------------------------------------------- */
/*                              OBJECT ID SCHEMA                              */
/* -------------------------------------------------------------------------- */

/**
 * Options for creating a MongoDB ObjectId Zod schema.
 */
export interface ZObjectIdOptions {
  /**
   * Custom required error message for `z.string({ required_error })`.
   */
  requiredError?: string;

  /**
   * Custom invalid format message for `.regex(...)`.
   */
  invalidMessage?: string;
}

/**
 * Creates a Zod schema for validating MongoDB ObjectId strings.
 *
 * @param options - Configuration options for the schema.
 * @returns A Zod string schema with ObjectId regex validation.
 *
 * @example
 * // Basic usage
 * const schema = z.object({ id: zObjectId() });
 *
 * @example
 * // With custom error messages
 * const schema = z.object({
 *   userId: zObjectId({
 *     requiredError: 'User ID is required',
 *     invalidMessage: 'Invalid user ID format',
 *   }),
 * });
 */
export const zObjectId = (options: ZObjectIdOptions = {}) => {
  const base = options.requiredError
    ? z.string({ required_error: options.requiredError })
    : z.string();

  return options.invalidMessage
    ? base.regex(MONGODB_OBJECT_ID_REGEX, options.invalidMessage)
    : base.regex(MONGODB_OBJECT_ID_REGEX);
};

/* -------------------------------------------------------------------------- */
/*                           INTEGER FROM STRING                              */
/* -------------------------------------------------------------------------- */

/**
 * Options for creating an integer-from-string Zod schema.
 */
export interface ZIntFromStringOptions {
  /**
   * Minimum allowed value (inclusive).
   */
  min: number;

  /**
   * Maximum allowed value (inclusive). Optional.
   */
  max?: number;
}

/**
 * Creates a Zod schema that parses a string query param into an integer.
 *
 * Mirrors the common pattern:
 * `z.string().transform(Number).pipe(z.number().int().min(n).max(m))`
 *
 * @param options - Configuration with min and optional max values.
 * @returns A Zod schema that transforms string to validated integer.
 *
 * @example
 * // Page number (min 1)
 * const pageSchema = zIntFromString({ min: 1 });
 *
 * @example
 * // Limit with max (1-100)
 * const limitSchema = zIntFromString({ min: 1, max: 100 });
 */
export const zIntFromString = ({ min, max }: ZIntFromStringOptions) => {
  const numberSchema =
    max === undefined
      ? z.number().int().min(min)
      : z.number().int().min(min).max(max);

  return z
    .string()
    .transform((v) => Number(v))
    .pipe(numberSchema);
};

/* -------------------------------------------------------------------------- */
/*                          BOOLEAN FROM STRING                               */
/* -------------------------------------------------------------------------- */

/**
 * Creates a Zod schema that parses a boolean query param from a string.
 *
 * Behavior:
 * - `"true"` → `true`
 * - `"false"` → `false`
 * - `""` / other values → `undefined`
 *
 * @returns A Zod schema that transforms string to optional boolean.
 *
 * @example
 * const schema = z.object({
 *   isActive: zOptionalBooleanFromString(),
 * });
 *
 * // { isActive: 'true' } → { isActive: true }
 * // { isActive: 'false' } → { isActive: false }
 * // { isActive: '' } → { isActive: undefined }
 */
export const zOptionalBooleanFromString = () => {
  return z
    .string()
    .transform((val) =>
      val === ''
        ? undefined
        : val === 'true'
          ? true
          : val === 'false'
            ? false
            : undefined
    )
    .optional() as unknown as z.ZodOptional<z.ZodBoolean>;
};

/* -------------------------------------------------------------------------- */
/*                              PAGINATION SCHEMA                             */
/* -------------------------------------------------------------------------- */

/**
 * Options for creating pagination query schemas.
 */
export interface ZPaginationOptions {
  /**
   * Default page number if not provided. Defaults to 1.
   */
  defaultPage?: number;

  /**
   * Default limit if not provided. Defaults to 20.
   */
  defaultLimit?: number;

  /**
   * Maximum allowed limit. Defaults to 100.
   */
  maxLimit?: number;
}

/**
 * Creates a Zod schema for pagination query parameters.
 *
 * Includes `page` and `limit` fields with sensible defaults.
 *
 * @param options - Configuration for pagination defaults and limits.
 * @returns A Zod object schema with page and limit fields.
 *
 * @example
 * const schema = z.object({
 *   query: z.object({
 *     ...zPaginationQuery(),
 *     searchTerm: z.string().optional(),
 *   }),
 * });
 */
export const zPaginationQuery = (options: ZPaginationOptions = {}) => {
  const { defaultPage = 1, defaultLimit = 20, maxLimit = 100 } = options;

  return {
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : defaultPage))
      .pipe(z.number().int().min(1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : defaultLimit))
      .pipe(z.number().int().min(1).max(maxLimit)),
  };
};

/**
 * Creates optional page schema without default transformation.
 *
 * Use when you want page to remain undefined if not provided.
 *
 * @returns A Zod schema for optional page parameter.
 */
export const zOptionalPage = () => zIntFromString({ min: 1 }).optional();

/**
 * Creates optional limit schema without default transformation.
 *
 * Use when you want limit to remain undefined if not provided.
 *
 * @param max - Maximum allowed limit. Defaults to 100.
 * @returns A Zod schema for optional limit parameter.
 */
export const zOptionalLimit = (max = 100) =>
  zIntFromString({ min: 1, max }).optional();

/* -------------------------------------------------------------------------- */
/*                              SORT ORDER SCHEMA                             */
/* -------------------------------------------------------------------------- */

/**
 * Sort order enum values.
 */
export const SORT_ORDER_VALUES = ['asc', 'desc'] as const;

/**
 * Type for sort order values.
 */
export type SortOrder = (typeof SORT_ORDER_VALUES)[number];

/**
 * Creates a Zod schema for sort order query parameter.
 *
 * @returns A Zod enum schema for 'asc' or 'desc'.
 *
 * @example
 * const schema = z.object({
 *   query: z.object({
 *     sortBy: z.string().optional(),
 *     sortOrder: zSortOrder(),
 *   }),
 * });
 */
export const zSortOrder = () => z.enum(SORT_ORDER_VALUES).optional();

/* -------------------------------------------------------------------------- */
/*                              DATE STRING SCHEMA                            */
/* -------------------------------------------------------------------------- */

/**
 * Creates a Zod schema for optional ISO datetime string.
 *
 * @param message - Custom error message for invalid format.
 * @returns A Zod schema for optional datetime string.
 *
 * @example
 * const schema = z.object({
 *   fromDate: zOptionalDatetime(),
 *   toDate: zOptionalDatetime('Invalid end date format'),
 * });
 */
export const zOptionalDatetime = (message = 'Invalid date format') =>
  z.string().datetime({ message }).optional();

/**
 * Creates a Zod schema for optional date string (any format).
 *
 * Use this when you accept flexible date formats that will be
 * parsed by the service layer.
 *
 * @returns A Zod schema for optional date string.
 */
export const zOptionalDateString = () => z.string().optional();

/* -------------------------------------------------------------------------- */
/*                           AMOUNT FROM STRING                               */
/* -------------------------------------------------------------------------- */

/**
 * Creates a Zod schema for optional numeric amount from string.
 *
 * Validates that the string is a valid number format.
 *
 * @param message - Custom error message for invalid format.
 * @returns A Zod schema for optional amount string.
 *
 * @example
 * const schema = z.object({
 *   minAmount: zOptionalAmountString(),
 *   maxAmount: zOptionalAmountString('Invalid max amount'),
 * });
 */
export const zOptionalAmountString = (message = 'Must be a valid number') =>
  z
    .string()
    .regex(/^\d+(\.\d+)?$/, message)
    .optional();

/* -------------------------------------------------------------------------- */
/*                           ENUM FROM STRING                                 */
/* -------------------------------------------------------------------------- */

/**
 * Creates a Zod schema that transforms empty string to undefined for enums.
 *
 * Useful for optional enum query params where empty string should be treated
 * as "not provided".
 *
 * @param values - Array of allowed enum values.
 * @returns A Zod schema that handles empty string gracefully.
 *
 * @example
 * const schema = z.object({
 *   role: zOptionalEnumFromString(['user', 'admin']),
 * });
 */
export const zOptionalEnumFromString = <T extends string>(
  values: readonly [T, ...T[]]
) =>
  z
    .string()
    .transform((val) => (val === '' ? undefined : val))
    .pipe(z.enum(values).optional())
    .optional();

/* -------------------------------------------------------------------------- */
/*                           REFINEMENT HELPERS                               */
/* -------------------------------------------------------------------------- */

/**
 * Refinement function to ensure at least one field is provided.
 *
 * Use with `.refine()` on update body schemas.
 *
 * @param data - The object to check.
 * @returns True if at least one field is provided.
 *
 * @example
 * const updateSchema = z.object({
 *   body: z.object({
 *     name: z.string().optional(),
 *     email: z.string().email().optional(),
 *   }).refine(atLeastOneField, {
 *     message: 'At least one field must be provided to update.',
 *   }),
 * });
 */
export const atLeastOneField = (data: Record<string, unknown>): boolean =>
  Object.keys(data).length > 0;

/**
 * Standard error message for atLeastOneField refinement.
 */
export const AT_LEAST_ONE_FIELD_MESSAGE =
  'At least one field must be provided to update.';

/* -------------------------------------------------------------------------- */
/*                           IMAGE URL SCHEMA                                 */
/* -------------------------------------------------------------------------- */

/**
 * Creates a Zod schema for image URL validation.
 *
 * Accepts both HTTP(S) URLs and data URIs.
 *
 * @param message - Custom error message for invalid format.
 * @returns A Zod schema for image URL.
 *
 * @example
 * const schema = z.object({
 *   coverImage: zImageUrl().optional(),
 *   gallery: z.array(zImageUrl()).optional(),
 * });
 */
export const zImageUrl = (message = 'Invalid image URL') =>
  z
    .string()
    .refine((v) => /^https?:\/\//.test(v) || v.startsWith('data:'), message);
