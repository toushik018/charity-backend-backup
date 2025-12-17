/**
 * @fileoverview Shared pagination utilities.
 *
 * Centralized pagination helpers used across all backend services to ensure
 * consistent pagination behavior and reduce code duplication.
 *
 * @module app/utils/pagination
 */

import type {
  PaginatedResponse as CommonPaginatedResponse,
  PaginationMeta as CommonPaginationMeta,
} from '../interface/common';

/* -------------------------------------------------------------------------- */
/*                              CONSTANTS                                     */
/* -------------------------------------------------------------------------- */

/**
 * Default page size when not specified.
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Maximum allowed page size to prevent excessive data fetching.
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Minimum page number.
 */
export const MIN_PAGE = 1;

/* -------------------------------------------------------------------------- */
/*                              TYPES                                         */
/* -------------------------------------------------------------------------- */

/**
 * Pagination options for list queries.
 *
 * @property page - Current page number (1-indexed)
 * @property limit - Number of items per page
 * @property sortBy - Field to sort by
 * @property sortOrder - Sort direction ('asc' or 'desc')
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination metadata returned with list responses.
 *
 * This is a shared/canonical type defined in `app/interface/common`.
 */
export type PaginationMeta = CommonPaginationMeta;

/**
 * Paginated response structure.
 *
 * This is a shared/canonical type defined in `app/interface/common`.
 */
export type PaginatedResponse<T> = CommonPaginatedResponse<T>;

/* -------------------------------------------------------------------------- */
/*                              HELPERS                                       */
/* -------------------------------------------------------------------------- */

/**
 * Normalizes pagination options with sensible defaults and bounds.
 *
 * Ensures:
 * - Page is at least 1
 * - Limit is between 1 and MAX_PAGE_SIZE
 * - Default values are applied when not provided
 *
 * @param options - Raw pagination options from request
 * @param defaults - Optional custom defaults
 * @returns Normalized pagination options
 *
 * @example
 * const { page, limit, skip } = normalizePagination({ page: 2, limit: 20 });
 * // { page: 2, limit: 20, skip: 20 }
 *
 * @example
 * const { page, limit, skip } = normalizePagination({});
 * // { page: 1, limit: 10, skip: 0 }
 */
export const normalizePagination = (
  options: PaginationOptions = {},
  defaults: { page?: number; limit?: number } = {}
): { page: number; limit: number; skip: number } => {
  const defaultPage = defaults.page ?? MIN_PAGE;
  const defaultLimit = defaults.limit ?? DEFAULT_PAGE_SIZE;

  const page = Math.max(MIN_PAGE, options.page ?? defaultPage);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, options.limit ?? defaultLimit)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Builds pagination metadata from total count and current options.
 *
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Pagination metadata object
 *
 * @example
 * const meta = buildPaginationMeta(100, 2, 10);
 * // { page: 2, limit: 10, total: 100, totalPages: 10 }
 */
export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1,
});

/**
 * Builds a MongoDB sort object from pagination options.
 *
 * @param options - Pagination options with sortBy and sortOrder
 * @param defaultSortBy - Default field to sort by (default: 'createdAt')
 * @param defaultSortOrder - Default sort order (default: 'desc')
 * @returns MongoDB sort object
 *
 * @example
 * const sort = buildSortObject({ sortBy: 'name', sortOrder: 'asc' });
 * // { name: 1 }
 *
 * @example
 * const sort = buildSortObject({});
 * // { createdAt: -1 }
 */
export const buildSortObject = (
  options: Pick<PaginationOptions, 'sortBy' | 'sortOrder'>,
  defaultSortBy = 'createdAt',
  defaultSortOrder: 'asc' | 'desc' = 'desc'
): Record<string, 1 | -1> => {
  const sortBy = options.sortBy || defaultSortBy;
  const sortOrder = options.sortOrder || defaultSortOrder;

  return { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
};

/**
 * Creates a paginated response object.
 *
 * @template T - Type of items in the data array
 * @param data - Array of items for the current page
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Paginated response with data and meta
 *
 * @example
 * const response = createPaginatedResponse(users, 100, 1, 10);
 * // { data: [...], meta: { page: 1, limit: 10, total: 100, totalPages: 10 } }
 */
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => ({
  data,
  meta: buildPaginationMeta(total, page, limit),
});
