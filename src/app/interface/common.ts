/**
 * @fileoverview Common shared interfaces and types.
 *
 * Centralized type definitions used across all backend modules to ensure
 * consistency and reduce duplication.
 *
 * @module app/interface/common
 */

import { Types } from 'mongoose';

/* -------------------------------------------------------------------------- */
/*                              BASE TYPES                                    */
/* -------------------------------------------------------------------------- */

/**
 * MongoDB ObjectId type alias for convenience.
 */
export type ObjectId = Types.ObjectId;

/**
 * String representation of MongoDB ObjectId.
 */
export type ObjectIdString = string;

/* -------------------------------------------------------------------------- */
/*                              SORT TYPES                                    */
/* -------------------------------------------------------------------------- */

/**
 * Sort order direction.
 */
export type SortOrder = 'asc' | 'desc';

/**
 * MongoDB sort direction values.
 */
export type MongoSortDirection = 1 | -1;

/**
 * MongoDB sort object type.
 */
export type MongoSort = Record<string, MongoSortDirection>;

/* -------------------------------------------------------------------------- */
/*                              LIST OPTIONS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Common list/query options for paginated endpoints.
 *
 * @property page - Current page number (1-indexed)
 * @property limit - Number of items per page
 * @property sortBy - Field to sort by
 * @property sortOrder - Sort direction
 */
export interface ListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

/**
 * Extended list options with search capability.
 */
export interface SearchableListOptions extends ListOptions {
  searchTerm?: string;
}

/* -------------------------------------------------------------------------- */
/*                              FILTER TYPES                                  */
/* -------------------------------------------------------------------------- */

/**
 * Base filter interface for list queries.
 */
export interface BaseFilters {
  searchTerm?: string;
}

/**
 * Date range filter fields.
 */
export interface DateRangeFilters {
  fromDate?: string;
  toDate?: string;
}

/**
 * Amount range filter fields.
 */
export interface AmountRangeFilters {
  minAmount?: string;
  maxAmount?: string;
}

/* -------------------------------------------------------------------------- */
/*                              RESPONSE TYPES                                */
/* -------------------------------------------------------------------------- */

/**
 * Pagination metadata for list responses.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

/**
 * Generic paginated list response.
 *
 * @template T - Type of items in the data array
 */
export interface PaginatedList<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Alias for PaginatedList for semantic clarity.
 *
 * @template T - Type of items in the data array
 */
export type PaginatedResponse<T> = PaginatedList<T>;

/**
 * API response structure.
 *
 * @template T - Type of response data
 */
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message?: string | null;
  meta?: PaginationMeta;
  data?: T | null;
}

/* -------------------------------------------------------------------------- */
/*                              ENTITY TYPES                                  */
/* -------------------------------------------------------------------------- */

/**
 * Base entity interface with common fields.
 */
export interface BaseEntity {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Soft-deletable entity interface.
 */
export interface SoftDeletableEntity extends BaseEntity {
  isDeleted?: boolean;
  deletedAt?: Date;
}

/**
 * Activatable entity interface.
 */
export interface ActivatableEntity extends BaseEntity {
  isActive: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              POPULATED TYPES                               */
/* -------------------------------------------------------------------------- */

/**
 * Minimal user reference for populated fields.
 */
export interface UserRef {
  _id: ObjectId;
  name: string;
  email?: string;
  profilePicture?: string;
}

/**
 * Minimal fundraiser reference for populated fields.
 */
export interface FundraiserRef {
  _id: ObjectId;
  title: string;
  slug: string;
  coverImage?: string;
  status?: string;
}

/* -------------------------------------------------------------------------- */
/*                              UTILITY TYPES                                 */
/* -------------------------------------------------------------------------- */

/**
 * Makes specified keys required in a type.
 *
 * @template T - Base type
 * @template K - Keys to make required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Makes specified keys optional in a type.
 *
 * @template T - Base type
 * @template K - Keys to make optional
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Extracts the element type from an array type.
 *
 * @template T - Array type
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Creates a type with all properties set to optional and nullable.
 *
 * @template T - Base type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
