/**
 * @fileoverview Fundraiser reaction validation schemas using Zod.
 *
 * Provides request validation for all reaction-related API endpoints,
 * ensuring data integrity and type safety.
 *
 * @module modules/reaction/validation
 */

import { z } from 'zod';

import { zObjectId, zOptionalLimit, zOptionalPage } from '../../utils/zod';

/* -------------------------------------------------------------------------- */
/*                              REACTION TYPES                                */
/* -------------------------------------------------------------------------- */

/**
 * Available reaction types for fundraisers.
 *
 * These represent emotional responses users can give to fundraisers.
 */
export const REACTION_TYPES = [
  'SENDING_LOVE',
  'SYMPATHIES',
  'HOPE',
  'CARE',
  'SUPPORTING_YOU',
  'INSPIRING',
] as const;

/**
 * Zod enum for reaction types.
 */
const reactionTypeEnum = z.enum(REACTION_TYPES);

/* -------------------------------------------------------------------------- */
/*                          REACT TO FUNDRAISER                               */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for reacting to a fundraiser.
 *
 * Required:
 * - params.id: Fundraiser ObjectId
 * - body.type: Reaction type (one of REACTION_TYPES)
 */
export const reactToFundraiserValidation = z.object({
  params: z.object({ id: zObjectId() }),
  body: z.object({
    type: reactionTypeEnum,
  }),
});

/* -------------------------------------------------------------------------- */
/*                          GET MY REACTIONS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for fetching current user's reactions.
 *
 * Supports pagination with optional page and limit query parameters.
 */
export const getMyReactionsQueryValidation = z.object({
  query: z.object({
    page: zOptionalPage(),
    limit: zOptionalLimit(),
  }),
});
