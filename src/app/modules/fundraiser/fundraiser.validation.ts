/**
 * @fileoverview Fundraiser validation schemas using Zod.
 *
 * Provides request validation for all fundraiser-related API endpoints,
 * ensuring data integrity and type safety.
 *
 * @module modules/fundraiser/validation
 */

import { z } from 'zod';

import {
  zImageUrl,
  zObjectId,
  zOptionalLimit,
  zOptionalPage,
  zSortOrder,
} from '../../utils/zod';

/* -------------------------------------------------------------------------- */
/*                              SHARED ENUMS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Fundraiser status enum values.
 */
const fundraiserStatusEnum = z.enum(['draft', 'published']);

/**
 * Beneficiary type enum values.
 */
const beneficiaryTypeEnum = z.enum(['yourself', 'someone_else', 'charity']);

/**
 * Long term need enum values.
 */
const longTermNeedEnum = z.enum(['YES', 'NO']);

/* -------------------------------------------------------------------------- */
/*                           SHARED BODY SCHEMA                               */
/* -------------------------------------------------------------------------- */

/**
 * Common fundraiser body fields used in create and update operations.
 *
 * All fields are optional to support partial updates.
 */
const fundraiserBodyFields = {
  title: z.string().min(3).max(120).optional(),
  coverImage: zImageUrl().optional(),
  gallery: z.array(zImageUrl()).optional(),
  goalAmount: z.number().min(0).optional(),
  currency: z.string().min(1).max(10).optional(),
  category: z.string().min(1).max(100).optional(),
  story: z.string().max(10000).optional(),
  country: z.string().min(1).max(100).optional(),
  zipCode: z.string().min(1).max(20).optional(),
  beneficiaryType: beneficiaryTypeEnum.optional(),
  automatedGoal: z.boolean().optional(),
  longTermNeed: longTermNeedEnum.optional(),
};

/* -------------------------------------------------------------------------- */
/*                           CREATE FUNDRAISER                                */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for creating a new fundraiser.
 *
 * All fields are optional as fundraisers can be created as drafts
 * and filled in progressively.
 */
export const createFundraiserValidation = z.object({
  body: z.object(fundraiserBodyFields),
});

/* -------------------------------------------------------------------------- */
/*                           UPDATE FUNDRAISER                                */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for updating an existing fundraiser.
 *
 * Requires fundraiser ID in params. All body fields are optional.
 */
export const updateFundraiserValidation = z.object({
  params: z.object({ id: z.string() }),
  body: z.object(fundraiserBodyFields),
});

/* -------------------------------------------------------------------------- */
/*                          PUBLISH FUNDRAISER                                */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for publishing a fundraiser.
 *
 * Only requires the fundraiser ID in params.
 */
export const publishFundraiserValidation = z.object({
  params: z.object({ id: z.string() }),
});

/* -------------------------------------------------------------------------- */
/*                           GET MY FUNDRAISERS                               */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for fetching current user's fundraisers.
 *
 * Supports optional status filtering (draft or published).
 */
export const getMineQueryValidation = z.object({
  query: z.object({ status: fundraiserStatusEnum.optional() }),
});

/* -------------------------------------------------------------------------- */
/*                           GET BY SLUG                                      */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for fetching a fundraiser by its URL slug.
 */
export const getBySlugParamValidation = z.object({
  params: z.object({ slug: z.string().min(1) }),
});

/* -------------------------------------------------------------------------- */
/*                           GET BY ID                                        */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for fetching a fundraiser by its MongoDB ObjectId.
 */
export const getByIdParamValidation = z.object({
  params: z.object({ id: zObjectId() }),
});

/* -------------------------------------------------------------------------- */
/*                        GET FUNDRAISERS (ADMIN)                             */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for admin fundraisers list endpoint.
 *
 * Supports:
 * - Pagination (page, limit)
 * - Search (searchTerm)
 * - Filtering by status, owner, category, country
 * - Sorting (sortBy, sortOrder)
 */
export const getFundraisersQueryValidation = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    status: fundraiserStatusEnum.optional(),
    owner: zObjectId().optional(),
    category: z.string().optional(),
    country: z.string().optional(),
    page: zOptionalPage(),
    limit: zOptionalLimit(),
    sortBy: z.string().optional(),
    sortOrder: zSortOrder(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                        GET PUBLIC FUNDRAISERS                              */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for public fundraisers list endpoint.
 *
 * Similar to admin endpoint but without status filtering
 * (only published fundraisers are shown publicly).
 */
export const getPublicFundraisersQueryValidation = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    owner: zObjectId().optional(),
    category: z.string().optional(),
    country: z.string().optional(),
    page: zOptionalPage(),
    limit: zOptionalLimit(),
    sortBy: z.string().optional(),
    sortOrder: zSortOrder(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                      ADMIN CREATE FUNDRAISER                               */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for admin creating a fundraiser on behalf of a user.
 *
 * Requires owner ID in params to specify which user owns the fundraiser.
 */
export const adminCreateFundraiserValidation = z.object({
  params: z.object({
    ownerId: zObjectId({ requiredError: 'ownerId is required' }),
  }),
  body: z.object(fundraiserBodyFields),
});
