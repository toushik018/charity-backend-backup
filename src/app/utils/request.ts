/**
 * @fileoverview Shared request/query parsing utilities.
 *
 * Centralizes common controller-level parsing concerns such as pagination,
 * sorting, booleans, numbers, and dates from Express `req.query`.
 *
 * Express query params are often strings, but in this codebase they can also
 * be *already transformed* by `validateRequest` (Zod) into numbers/booleans.
 * These helpers handle both cases consistently.
 *
 * @module app/utils/request
 */

import type { PaginationOptions } from './pagination';

/* -------------------------------------------------------------------------- */
/*                              PRIMITIVE PARSERS                             */
/* -------------------------------------------------------------------------- */

/**
 * Safely extracts the first scalar value from a query param.
 *
 * Express query params can be:
 * - string
 * - string[]
 * - undefined
 * - (in our codebase) number/boolean due to Zod transforms
 *
 * @param value - Raw query value
 * @returns First scalar value or undefined
 */
const getScalarQueryValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value[0];
  return value;
};

/**
 * Parses a query parameter into a string.
 *
 * @param value - Raw query value
 * @returns Trimmed string or undefined
 */
export const parseStringQuery = (value: unknown): string | undefined => {
  const v = getScalarQueryValue(value);
  if (typeof v !== 'string') return undefined;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : undefined;
};

/**
 * Parses a query parameter into a raw string without trimming.
 *
 * This is intentionally stricter than `parseStringQuery` for some filters:
 * if the client provides whitespace/invalid values for an ID/status filter,
 * many services will treat it as invalid and return no results.
 * Trimming such values into `undefined` could accidentally remove a filter
 * and change behavior.
 *
 * @param value - Raw query value
 * @returns String value as-is or undefined
 */
export const parseRawStringQuery = (value: unknown): string | undefined => {
  const v = getScalarQueryValue(value);
  return typeof v === 'string' ? v : undefined;
};

/**
 * Parses a query parameter into a number.
 *
 * Accepts both `number` (already parsed) and `string` values.
 *
 * @param value - Raw query value
 * @returns Parsed number or undefined
 */
export const parseNumberQuery = (value: unknown): number | undefined => {
  const v = getScalarQueryValue(value);
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (typeof v !== 'string') return undefined;

  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Parses a query parameter into an integer.
 *
 * @param value - Raw query value
 * @returns Parsed integer or undefined
 */
export const parseIntQuery = (value: unknown): number | undefined => {
  const n = parseNumberQuery(value);
  if (n === undefined) return undefined;
  const intVal = Math.trunc(n);
  return Number.isFinite(intVal) ? intVal : undefined;
};

/**
 * Parses a query parameter into a boolean.
 *
 * Accepts:
 * - `true`/`false` boolean values
 * - `'true'`/`'false'` strings
 *
 * @param value - Raw query value
 * @returns Parsed boolean or undefined
 */
export const parseBooleanQuery = (value: unknown): boolean | undefined => {
  const v = getScalarQueryValue(value);
  if (typeof v === 'boolean') return v;
  if (typeof v !== 'string') return undefined;

  if (v === 'true') return true;
  if (v === 'false') return false;
  return undefined;
};

/**
 * Parses a query parameter into a Date.
 *
 * Accepts:
 * - Date objects (already parsed)
 * - ISO date strings
 *
 * @param value - Raw query value
 * @returns Date instance or undefined
 */
export const parseDateQuery = (value: unknown): Date | undefined => {
  const v = getScalarQueryValue(value);
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? undefined : v;
  if (typeof v !== 'string') return undefined;

  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

/* -------------------------------------------------------------------------- */
/*                              PAGINATION                                    */
/* -------------------------------------------------------------------------- */

/**
 * Normalized pagination parameters.
 */
export interface ParsedPagination {
  /**
   * Page number (1-indexed).
   */
  page: number;

  /**
   * Items per page.
   */
  limit: number;
}

/**
 * Parses `page` and `limit` from a query object.
 *
 * @param query - Express request query
 * @param defaults - Default page/limit values
 * @param maxLimit - Maximum allowed limit
 * @returns Normalized pagination params
 */
export const parsePaginationQuery = (
  query: Record<string, unknown>,
  defaults: ParsedPagination = { page: 1, limit: 20 },
  maxLimit = Number.MAX_SAFE_INTEGER
): ParsedPagination => {
  const pageRaw = parseIntQuery(query.page);
  const limitRaw = parseIntQuery(query.limit);

  // Intentionally mirrors existing patterns like:
  // `parseInt(req.query.page as string) || 1`
  // This preserves edge-case behavior (e.g. negative numbers remain valid).
  const page = (pageRaw || defaults.page) as number;
  const limit = Math.min(maxLimit, (limitRaw || defaults.limit) as number);

  return { page, limit };
};

/**
 * Parses pagination options where missing query params remain `undefined`.
 *
 * Useful for service functions that accept optional pagination overrides.
 *
 * @param query - Express request query
 * @returns PaginationOptions with optional page/limit
 */
export const parseOptionalPaginationOptions = (
  query: Record<string, unknown>
): Pick<PaginationOptions, 'page' | 'limit'> => {
  return {
    page: parseIntQuery(query.page),
    limit: parseIntQuery(query.limit),
  };
};

/**
 * Parses common list options from a query object.
 *
 * Reads `page`, `limit`, `sortBy`, and `sortOrder`.
 *
 * @param query - Express request query
 * @returns PaginationOptions
 */
export const parseListOptionsQuery = (
  query: Record<string, unknown>
): PaginationOptions => {
  const sortBy = parseRawStringQuery(query.sortBy);
  const sortOrder = parseRawStringQuery(query.sortOrder);

  return {
    ...parseOptionalPaginationOptions(query),
    sortBy,
    sortOrder: (sortOrder as 'asc' | 'desc' | undefined) ?? undefined,
  };
};
