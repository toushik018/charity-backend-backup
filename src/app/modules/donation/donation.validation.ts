/**
 * @fileoverview Donation validation schemas using Zod.
 *
 * Provides request validation for all donation-related API endpoints,
 * ensuring data integrity and type safety.
 *
 * @module modules/donation/validation
 */

import { z } from 'zod';

import {
  zOptionalBooleanFromString,
  zOptionalDateString,
  zOptionalLimit,
  zOptionalPage,
} from '../../utils/zod';

/* -------------------------------------------------------------------------- */
/*                              PAYMENT METHOD                                */
/* -------------------------------------------------------------------------- */

/**
 * Payment method enum values.
 */
const paymentMethodEnum = z.enum(['card', 'bank', 'mobile'], {
  required_error: 'Payment method is required',
});

/* -------------------------------------------------------------------------- */
/*                           CREATE DONATION                                  */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for creating a new donation.
 *
 * Required fields:
 * - fundraiserId: Target fundraiser ID
 * - amount: Donation amount (minimum €1)
 * - paymentMethod: Payment method (card, bank, mobile)
 * - donorName: Name of the donor
 * - donorEmail: Email of the donor
 *
 * Optional fields:
 * - tipAmount: Platform tip (default: 0)
 * - currency: Currency code (default: EUR)
 * - isAnonymous: Hide donor info publicly (default: false)
 * - message: Optional message to fundraiser (max 500 chars)
 */
export const createDonationValidation = z.object({
  body: z.object({
    fundraiserId: z.string({ required_error: 'Fundraiser ID is required' }),
    amount: z
      .number({ required_error: 'Amount is required' })
      .min(1, 'Minimum donation is €1'),
    tipAmount: z.number().min(0).optional().default(0),
    currency: z.string().optional().default('EUR'),
    paymentMethod: paymentMethodEnum,
    isAnonymous: z.boolean().optional().default(false),
    donorName: z.string({ required_error: 'Donor name is required' }).min(1),
    donorEmail: z.string({ required_error: 'Donor email is required' }).email(),
    message: z.string().max(500).optional(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          GET DONATIONS BY FUNDRAISER                       */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for fetching donations by fundraiser ID.
 *
 * Supports pagination with optional page and limit query parameters.
 */
export const getDonationsQueryValidation = z.object({
  params: z.object({
    fundraiserId: z.string(),
  }),
  query: z.object({
    page: zOptionalPage(),
    limit: zOptionalLimit(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          GET TOP DONATIONS                                 */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for fetching top donations by fundraiser ID.
 *
 * Returns the highest donations for a fundraiser.
 */
export const getTopDonationsQueryValidation = z.object({
  params: z.object({
    fundraiserId: z.string(),
  }),
  query: z.object({
    limit: zOptionalLimit(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          GET MY DONATIONS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for fetching current user's donations.
 *
 * Supports pagination with optional page and limit query parameters.
 */
export const getMyDonationsQueryValidation = z.object({
  query: z.object({
    page: zOptionalPage(),
    limit: zOptionalLimit(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          GET ADMIN DONATIONS                               */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for admin donations list endpoint.
 *
 * Supports:
 * - Pagination (page, limit)
 * - Search (searchTerm)
 * - Filtering by payment status, fundraiser, donor, currency, payment method
 * - Anonymous filter
 * - Amount range (minAmount, maxAmount)
 * - Date range (fromDate, toDate)
 */
export const getAdminDonationsQueryValidation = z.object({
  query: z.object({
    page: zOptionalPage(),
    limit: zOptionalLimit(),
    paymentStatus: z.string().optional(),
    searchTerm: z.string().optional(),
    fundraiserId: z.string().optional(),
    donorId: z.string().optional(),
    currency: z.string().optional(),
    paymentMethod: z.string().optional(),
    isAnonymous: zOptionalBooleanFromString(),
    minAmount: z.string().optional(),
    maxAmount: z.string().optional(),
    fromDate: zOptionalDateString(),
    toDate: zOptionalDateString(),
  }),
});
