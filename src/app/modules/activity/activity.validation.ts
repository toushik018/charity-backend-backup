/**
 * @fileoverview Activity validation schemas using Zod.
 *
 * Provides request validation for all activity-related API endpoints,
 * ensuring data integrity and type safety.
 *
 * @module modules/activity/validation
 */

import { z } from 'zod';

import {
  zOptionalBooleanFromString,
  zOptionalDateString,
  zOptionalLimit,
  zOptionalPage,
} from '../../utils/zod';
import { ACTIVITY_TYPES } from './activity.constant';

/* -------------------------------------------------------------------------- */
/*                              ACTIVITY TYPE ENUM                            */
/* -------------------------------------------------------------------------- */

/**
 * Zod enum for activity types.
 *
 * Reusable across multiple validation schemas.
 */
const activityTypeEnum = z.enum([
  ACTIVITY_TYPES.DONATION,
  ACTIVITY_TYPES.REACTION,
  ACTIVITY_TYPES.FUNDRAISER_CREATED,
  ACTIVITY_TYPES.SHARE,
]);

/* -------------------------------------------------------------------------- */
/*                           CREATE ACTIVITY                                  */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for creating a new activity.
 *
 * Required fields:
 * - type: Activity type (donation, reaction, fundraiser_created, share)
 * - fundraiserId: Associated fundraiser ID
 *
 * Optional fields:
 * - donationAmount: Amount donated (for donation activities)
 * - donationCurrency: Currency code (for donation activities)
 * - reactionType: Type of reaction (for reaction activities)
 * - isPublic: Whether the activity is publicly visible
 */
export const createActivityValidation = z.object({
  body: z.object({
    type: activityTypeEnum,
    fundraiserId: z.string().min(1, 'Fundraiser ID is required'),
    donationAmount: z.number().positive().optional(),
    donationCurrency: z.string().optional(),
    reactionType: z.string().optional(),
    isPublic: z.boolean().optional(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                           GET USER ACTIVITIES                              */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for fetching activities by user ID.
 *
 * Supports pagination with optional page and limit query parameters.
 */
export const getUserActivitiesValidation = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
  query: z.object({
    page: zOptionalPage(),
    limit: zOptionalLimit(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                           GET MY ACTIVITIES                                */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for fetching current user's activities.
 *
 * Supports pagination with optional page and limit query parameters.
 */
export const getMyActivitiesValidation = z.object({
  query: z.object({
    page: zOptionalPage(),
    limit: zOptionalLimit(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                        GET FUNDRAISER ACTIVITIES                           */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for fetching activities by fundraiser ID.
 *
 * Supports pagination with optional page and limit query parameters.
 */
export const getFundraiserActivitiesValidation = z.object({
  params: z.object({
    fundraiserId: z.string().min(1, 'Fundraiser ID is required'),
  }),
  query: z.object({
    page: zOptionalPage(),
    limit: zOptionalLimit(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          GET ADMIN ACTIVITIES                              */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for admin activities list endpoint.
 *
 * Supports:
 * - Pagination (page, limit)
 * - Search (searchTerm)
 * - Filtering by type, public status, user, fundraiser, reaction type
 * - Date range filtering (fromDate, toDate)
 */
export const getAdminActivitiesValidation = z.object({
  query: z.object({
    page: zOptionalPage(),
    limit: zOptionalLimit(),
    searchTerm: z.string().optional(),
    type: activityTypeEnum.optional(),
    isPublic: zOptionalBooleanFromString(),
    userId: z.string().optional(),
    fundraiserId: z.string().optional(),
    reactionType: z.string().optional(),
    fromDate: zOptionalDateString(),
    toDate: zOptionalDateString(),
  }),
});
