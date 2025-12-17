/**
 * @fileoverview Activity module type definitions.
 *
 * Defines TypeScript interfaces and types for the activity module,
 * including document schemas and populated types.
 *
 * @module modules/activity/interface
 */

import { Document, Types } from 'mongoose';

import { FundraiserRef, UserRef } from '../../interface/common';

/* -------------------------------------------------------------------------- */
/*                              ACTIVITY TYPES                                */
/* -------------------------------------------------------------------------- */

/**
 * Activity type union.
 *
 * Represents all possible activity types in the system.
 */
export type TActivityType =
  | 'DONATION'
  | 'REACTION'
  | 'FUNDRAISER_CREATED'
  | 'SHARE';

/* -------------------------------------------------------------------------- */
/*                              DOCUMENT INTERFACE                            */
/* -------------------------------------------------------------------------- */

/**
 * Activity document interface.
 *
 * Represents an activity record in the database, tracking user actions
 * related to fundraisers such as donations, reactions, and shares.
 *
 * @extends Document
 */
export interface IActivity extends Document {
  /**
   * Unique identifier for the activity.
   */
  _id: Types.ObjectId;

  /**
   * Reference to the user who performed the activity.
   */
  user: Types.ObjectId;

  /**
   * Type of activity performed.
   */
  type: TActivityType;

  /**
   * Reference to the associated fundraiser.
   */
  fundraiser: Types.ObjectId;

  /**
   * Donation amount (only for DONATION type activities).
   */
  donationAmount?: number;

  /**
   * Currency code for the donation (only for DONATION type activities).
   * @default 'EUR'
   */
  donationCurrency?: string;

  /**
   * Type of reaction (only for REACTION type activities).
   */
  reactionType?: string;

  /**
   * Whether the activity is publicly visible.
   * @default true
   */
  isPublic: boolean;

  /**
   * Timestamp when the activity was created.
   */
  createdAt: Date;

  /**
   * Timestamp when the activity was last updated.
   */
  updatedAt: Date;
}

/* -------------------------------------------------------------------------- */
/*                              POPULATED TYPES                               */
/* -------------------------------------------------------------------------- */

/**
 * Activity with populated user and fundraiser references.
 *
 * Used when returning activities with full user and fundraiser details
 * instead of just ObjectId references.
 */
export interface IActivityPopulated
  extends Omit<IActivity, 'user' | 'fundraiser'> {
  /**
   * Populated user information.
   */
  user: UserRef;

  /**
   * Populated fundraiser information.
   */
  fundraiser: FundraiserRef;
}

/* -------------------------------------------------------------------------- */
/*                              PAYLOAD TYPES                                 */
/* -------------------------------------------------------------------------- */

/**
 * Payload for creating a new activity.
 */
export interface CreateActivityPayload {
  /**
   * ID of the user performing the activity.
   */
  userId: string;

  /**
   * Type of activity being performed.
   */
  type: TActivityType;

  /**
   * ID of the associated fundraiser.
   */
  fundraiserId: string;

  /**
   * Donation amount (for DONATION type).
   */
  donationAmount?: number;

  /**
   * Currency code (for DONATION type).
   */
  donationCurrency?: string;

  /**
   * Reaction type (for REACTION type).
   */
  reactionType?: string;

  /**
   * Whether the activity is publicly visible.
   */
  isPublic?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              FILTER TYPES                                  */
/* -------------------------------------------------------------------------- */

/**
 * Filter options for admin activity list queries.
 */
export interface AdminActivityFilters {
  /**
   * Search term for filtering by user name/email or fundraiser title.
   */
  searchTerm?: string;

  /**
   * Filter by activity type.
   */
  type?: TActivityType;

  /**
   * Filter by public visibility status.
   */
  isPublic?: boolean;

  /**
   * Filter by user ID.
   */
  userId?: string;

  /**
   * Filter by fundraiser ID.
   */
  fundraiserId?: string;

  /**
   * Filter by reaction type.
   */
  reactionType?: string;

  /**
   * Filter activities created after this date.
   */
  fromDate?: string;

  /**
   * Filter activities created before this date.
   */
  toDate?: string;
}
