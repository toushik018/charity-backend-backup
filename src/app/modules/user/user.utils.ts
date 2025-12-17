/**
 * @fileoverview User module utility functions.
 *
 * Contains helper functions for building user queries and
 * other user-related operations.
 *
 * @module modules/user/utils
 */

import { FilterQuery } from 'mongoose';

import { TUser, TUserFilters } from './user.interface';

/* -------------------------------------------------------------------------- */
/*                              QUERY BUILDERS                                */
/* -------------------------------------------------------------------------- */

/**
 * Searchable fields for user queries.
 */
const USER_SEARCH_FIELDS = ['name', 'email', 'profile.phone'] as const;

/**
 * Builds a MongoDB filter query from user filter options.
 *
 * Constructs a query object that can be used with Mongoose find operations,
 * supporting filtering by role, active status, and text search.
 *
 * @param filters - User filter options
 * @returns MongoDB filter query object
 *
 * @example
 * const query = buildUserQuery({
 *   searchTerm: 'john',
 *   role: 'user',
 *   isActive: true,
 * });
 * const users = await User.find(query);
 */
export function buildUserQuery(filters: TUserFilters): FilterQuery<TUser> {
  const query: FilterQuery<TUser> = {};

  // Filter by active status
  if (typeof filters.isActive === 'boolean') {
    query.isActive = filters.isActive;
  }

  // Filter by role
  if (filters.role) {
    query.role = filters.role;
  }

  // Search across multiple fields
  if (filters.searchTerm) {
    const regex = new RegExp(filters.searchTerm, 'i');
    query.$or = USER_SEARCH_FIELDS.map((field) => ({
      [field]: { $regex: regex },
    }));
  }

  return query;
}

/* -------------------------------------------------------------------------- */
/*                              HELPERS                                       */
/* -------------------------------------------------------------------------- */

/**
 * Checks if a user has admin role.
 *
 * @param role - User role to check
 * @returns True if admin role
 */
export function isAdminRole(role: string | undefined): boolean {
  return role === 'admin';
}
