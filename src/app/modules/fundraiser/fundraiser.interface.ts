/**
 * @fileoverview Fundraiser module type definitions.
 *
 * Defines TypeScript interfaces and types for the fundraiser module,
 * including document schemas, request payloads, and filter types.
 *
 * @module modules/fundraiser/interface
 */

import { Document, Types } from 'mongoose';

/* -------------------------------------------------------------------------- */
/*                              STATUS TYPES                                  */
/* -------------------------------------------------------------------------- */

/**
 * Fundraiser status type.
 *
 * @property draft - Fundraiser is being edited, not publicly visible
 * @property published - Fundraiser is live and accepting donations
 */
export type TFundraiserStatus = 'draft' | 'published';

/**
 * Array of valid fundraiser statuses for validation.
 */
export const FUNDRAISER_STATUSES: TFundraiserStatus[] = ['draft', 'published'];

/**
 * Beneficiary type for fundraiser.
 */
export type TBeneficiaryType = 'yourself' | 'someone_else' | 'charity';

/**
 * Long-term need indicator.
 */
export type TLongTermNeed = 'YES' | 'NO';

/* -------------------------------------------------------------------------- */
/*                              NONPROFIT TYPES                               */
/* -------------------------------------------------------------------------- */

/**
 * Nonprofit organization details.
 */
export interface INonprofit {
  /**
   * External nonprofit ID.
   */
  id?: string;

  /**
   * Organization name.
   */
  name?: string;

  /**
   * Organization logo URL.
   */
  logo?: string;

  /**
   * Organization category.
   */
  category?: string;

  /**
   * Organization location.
   */
  location?: string;

  /**
   * Employer Identification Number (US tax ID).
   */
  ein?: string;

  /**
   * Whether the nonprofit is verified.
   */
  verified?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              DOCUMENT INTERFACE                            */
/* -------------------------------------------------------------------------- */

/**
 * Fundraiser document interface.
 *
 * Represents a fundraiser campaign in the database.
 *
 * @extends Document
 */
export interface IFundraiser extends Document {
  /**
   * Unique identifier.
   */
  _id: Types.ObjectId;

  /**
   * Reference to the user who created the fundraiser.
   */
  owner: Types.ObjectId;

  /**
   * Fundraiser title.
   */
  title: string;

  /**
   * URL-friendly slug derived from title.
   */
  slug: string;

  /**
   * Current status of the fundraiser.
   */
  status: TFundraiserStatus;

  /**
   * Main cover image URL.
   */
  coverImage?: string;

  /**
   * Array of gallery image URLs.
   */
  gallery?: string[];

  /**
   * Target fundraising goal amount.
   */
  goalAmount?: number;

  /**
   * Current amount raised.
   */
  currentAmount: number;

  /**
   * Currency code (e.g., 'EUR', 'USD').
   */
  currency?: string;

  /**
   * Fundraiser category.
   */
  category?: string;

  /**
   * Full story/description of the fundraiser.
   */
  story?: string;

  /**
   * Short description.
   */
  description?: string;

  /**
   * Location description.
   */
  location?: string;

  /**
   * Country code or name.
   */
  country?: string;

  /**
   * Postal/ZIP code.
   */
  zipCode?: string;

  /**
   * Who the fundraiser benefits.
   */
  beneficiaryType?: TBeneficiaryType;

  /**
   * Associated nonprofit organization details.
   */
  nonprofit?: INonprofit | null;

  /**
   * Whether goal is automatically calculated.
   */
  automatedGoal?: boolean;

  /**
   * Whether this is a long-term need.
   */
  longTermNeed?: TLongTermNeed;

  /**
   * Total number of donations received.
   */
  donationCount?: number;

  /**
   * Timestamp when fundraiser was published.
   */
  publishedAt?: Date | null;

  /**
   * Creation timestamp.
   */
  createdAt: Date;

  /**
   * Last update timestamp.
   */
  updatedAt: Date;
}

/* -------------------------------------------------------------------------- */
/*                              REQUEST TYPES                                 */
/* -------------------------------------------------------------------------- */

/**
 * Request payload for creating a new fundraiser.
 */
export interface IFundraiserCreateRequest {
  title: string;
  coverImage?: string;
  gallery?: string[];
  goalAmount?: number;
  currency?: string;
  category?: string;
  story?: string;
  description?: string;
  location?: string;
  country?: string;
  zipCode?: string;
  beneficiaryType?: TBeneficiaryType;
  nonprofit?: INonprofit | null;
  automatedGoal?: boolean;
  longTermNeed?: TLongTermNeed;
  donationCount?: number;
  currentAmount?: number;
}

/**
 * Request payload for updating an existing fundraiser.
 *
 * All fields are optional to support partial updates.
 */
export interface IFundraiserUpdateRequest {
  title?: string;
  coverImage?: string;
  gallery?: string[];
  goalAmount?: number;
  currency?: string;
  category?: string;
  story?: string;
  country?: string;
  zipCode?: string;
  beneficiaryType?: TBeneficiaryType;
  nonprofit?: INonprofit | null;
  automatedGoal?: boolean;
  longTermNeed?: TLongTermNeed;
}

/* -------------------------------------------------------------------------- */
/*                              FILTER TYPES                                  */
/* -------------------------------------------------------------------------- */

/**
 * Filter options for admin fundraiser list queries.
 */
export interface IFundraiserFilters {
  /**
   * Search term for title or slug.
   */
  searchTerm?: string;

  /**
   * Filter by status.
   */
  status?: TFundraiserStatus;

  /**
   * Filter by category.
   */
  category?: string;

  /**
   * Filter by owner user ID.
   */
  ownerId?: string;

  /**
   * Filter fundraisers created after this date.
   */
  fromDate?: string;

  /**
   * Filter fundraisers created before this date.
   */
  toDate?: string;
}
