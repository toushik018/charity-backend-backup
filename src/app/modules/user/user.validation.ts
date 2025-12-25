/**
 * @fileoverview User validation schemas using Zod.
 *
 * Provides request validation for all user-related API endpoints,
 * ensuring data integrity and type safety.
 *
 * @module modules/user/validation
 */

import { z } from 'zod';

import {
  AT_LEAST_ONE_FIELD_MESSAGE,
  atLeastOneField,
  zObjectId,
  zOptionalBooleanFromString,
  zOptionalEnumFromString,
  zOptionalLimit,
  zOptionalPage,
  zSortOrder,
} from '../../utils/zod';

/* -------------------------------------------------------------------------- */
/*                              USER ROLE                                     */
/* -------------------------------------------------------------------------- */

/**
 * User role enum values.
 */
const userRoleEnum = z.enum(['user', 'admin']);

/* -------------------------------------------------------------------------- */
/*                           SHARED PROFILE SCHEMA                            */
/* -------------------------------------------------------------------------- */

/**
 * Social media links schema.
 *
 * All fields are optional URL strings.
 */
const socialsSchema = z
  .object({
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    instagram: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    website: z.string().url().optional(),
  })
  .partial()
  .optional();

/**
 * User profile schema.
 *
 * Contains optional contact info, avatar, and social links.
 */
const profileSchema = z
  .object({
    phone: z.string().optional(),
    address: z.string().optional(),
    avatar: z.string().url().optional(),
    socials: socialsSchema,
  })
  .optional();

/* -------------------------------------------------------------------------- */
/*                           UPDATE USER (ADMIN)                              */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for admin updating a user.
 *
 * Requires userId in params. At least one body field must be provided.
 *
 * Admin can update:
 * - name: User's display name
 * - role: User role (user or admin)
 * - isActive: Account active status
 * - profile: Profile information
 */
export const updateUserValidation = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      role: userRoleEnum.optional(),
      isActive: z.boolean().optional(),
      profile: profileSchema,
    })
    .refine(atLeastOneField, {
      message: AT_LEAST_ONE_FIELD_MESSAGE,
      path: [],
    }),
  params: z.object({
    userId: zObjectId({ requiredError: 'userId is required' }),
  }),
});

/* -------------------------------------------------------------------------- */
/*                           GET USERS (ADMIN)                                */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for admin users list endpoint.
 *
 * Supports:
 * - Pagination (page, limit)
 * - Search (searchTerm)
 * - Filtering by role, active status
 * - Sorting (sortBy, sortOrder)
 */
export const getUsersQueryValidation = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    role: zOptionalEnumFromString(['user', 'admin']),
    isActive: zOptionalBooleanFromString(),
    page: zOptionalPage(),
    limit: zOptionalLimit(),
    sortBy: z.string().optional(),
    sortOrder: zSortOrder(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                           GET USER BY ID                                   */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for fetching a user by their MongoDB ObjectId.
 */
export const getUserByIdParamValidation = z.object({
  params: z.object({
    userId: zObjectId({ requiredError: 'userId is required' }),
  }),
});

/* -------------------------------------------------------------------------- */
/*                           UPDATE ME (SELF)                                 */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for authenticated user updating their own profile.
 *
 * No params required (uses authenticated user's ID).
 * At least one body field must be provided.
 *
 * Users can update:
 * - name: Display name
 * - profile: Profile information (phone, address, avatar, socials)
 */
export const updateMeValidation = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      profile: profileSchema,
    })
    .refine(atLeastOneField, {
      message: AT_LEAST_ONE_FIELD_MESSAGE,
      path: [],
    }),
});

/* -------------------------------------------------------------------------- */
/*                           CREATE USER (ADMIN)                              */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for admin creating a new user.
 *
 * Required fields:
 * - name: User's display name
 * - email: Valid email address
 * - password: Minimum 6 characters
 *
 * Optional fields:
 * - role: User role (defaults to 'user')
 * - isActive: Account active status (defaults to true)
 * - profile: Profile information
 */
export const createUserValidation = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: userRoleEnum.optional(),
    isActive: z.boolean().optional(),
    profile: profileSchema,
  }),
});

/* -------------------------------------------------------------------------- */
/*                           UPDATE HIGHLIGHTS                                */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for updating user's highlighted fundraisers.
 *
 * Allows users to pin up to 10 fundraisers to their profile.
 */
export const updateHighlightsValidation = z.object({
  body: z.object({
    fundraiserIds: z
      .array(zObjectId({ invalidMessage: 'Invalid fundraiser id' }))
      .max(10)
      .optional(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                           UPDATE CAUSES                                    */
/* -------------------------------------------------------------------------- */

/**
 * Valid cause IDs that users can select.
 */
const validCauseIds = [
  'animals',
  'arts_culture',
  'community',
  'crisis_relief',
  'education',
  'environment',
  'faith',
  'medical',
  'social_advocacy',
] as const;

/**
 * Validation schema for updating user's supported causes.
 *
 * Allows users to select up to 3 causes to showcase on their profile.
 */
export const updateCausesValidation = z.object({
  body: z.object({
    causes: z
      .array(z.enum(validCauseIds, { message: 'Invalid cause id' }))
      .max(3, 'Maximum 3 causes allowed')
      .default([]),
  }),
});
