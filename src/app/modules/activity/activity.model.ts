/**
 * @fileoverview Activity Mongoose model.
 *
 * Defines the MongoDB schema and model for activity documents,
 * including field definitions, indexes, and model configuration.
 *
 * @module modules/activity/model
 */

import { Schema, model } from 'mongoose';

import { ACTIVITY_TYPE_VALUES } from './activity.constant';
import { IActivity } from './activity.interface';

/* -------------------------------------------------------------------------- */
/*                              SCHEMA DEFINITION                             */
/* -------------------------------------------------------------------------- */

/**
 * Mongoose schema for Activity documents.
 *
 * Activities track user interactions with fundraisers including:
 * - Donations made to fundraisers
 * - Reactions to fundraisers
 * - Fundraiser creation events
 * - Shares of fundraisers
 */
const activitySchema = new Schema<IActivity>(
  {
    /**
     * Reference to the user who performed the activity.
     * Indexed for efficient user activity queries.
     */
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },

    /**
     * Type of activity performed.
     * Indexed for filtering by activity type.
     */
    type: {
      type: String,
      enum: {
        values: ACTIVITY_TYPE_VALUES,
        message: 'Invalid activity type: {VALUE}',
      },
      required: [true, 'Activity type is required'],
      index: true,
    },

    /**
     * Reference to the associated fundraiser.
     * Indexed for efficient fundraiser activity queries.
     */
    fundraiser: {
      type: Schema.Types.ObjectId,
      ref: 'Fundraiser',
      required: [true, 'Fundraiser reference is required'],
      index: true,
    },

    /**
     * Donation amount (only for DONATION type activities).
     */
    donationAmount: {
      type: Number,
      min: [0, 'Donation amount cannot be negative'],
    },

    /**
     * Currency code for the donation.
     * @default 'EUR'
     */
    donationCurrency: {
      type: String,
      trim: true,
      default: 'EUR',
    },

    /**
     * Type of reaction (only for REACTION type activities).
     */
    reactionType: {
      type: String,
      trim: true,
    },

    /**
     * Whether the activity is publicly visible.
     * @default true
     */
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    /**
     * Enable automatic timestamps (createdAt, updatedAt).
     */
    timestamps: true,
  }
);

/* -------------------------------------------------------------------------- */
/*                              INDEXES                                       */
/* -------------------------------------------------------------------------- */

/**
 * Compound indexes for efficient query patterns.
 *
 * These indexes optimize common query patterns:
 * - User activity feed (user + createdAt)
 * - Fundraiser activity feed (fundraiser + createdAt)
 * - Activity type filtering (type + createdAt)
 * - Public activity feed (isPublic + createdAt)
 */
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ fundraiser: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ isPublic: 1, createdAt: -1 });

/* -------------------------------------------------------------------------- */
/*                              MODEL EXPORT                                  */
/* -------------------------------------------------------------------------- */

/**
 * Activity Mongoose model.
 *
 * @example
 * // Create a new activity
 * const activity = await Activity.create({
 *   user: userId,
 *   type: 'DONATION',
 *   fundraiser: fundraiserId,
 *   donationAmount: 100,
 *   donationCurrency: 'EUR',
 * });
 *
 * @example
 * // Find user activities
 * const activities = await Activity.find({ user: userId })
 *   .populate('fundraiser', 'title slug')
 *   .sort({ createdAt: -1 });
 */
export const Activity = model<IActivity>('Activity', activitySchema);
