/**
 * @fileoverview Coupon Mongoose model definition.
 *
 * Defines the MongoDB schema for donation coupons, including
 * indexes for efficient querying and automatic timestamp management.
 *
 * @module modules/coupon/model
 */

import { model, Schema } from 'mongoose';
import { ICoupon } from './coupon.interface';

/**
 * Mongoose schema for the Coupon collection.
 *
 * Features:
 * - Unique coupon code with automatic generation
 * - References to User, Donation, and Fundraiser collections
 * - Status tracking (active, used, expired)
 * - Email delivery tracking
 * - Automatic timestamps (createdAt, updatedAt)
 *
 * Indexes:
 * - Unique index on `code` for fast lookups
 * - Index on `user` for fetching user's coupons
 * - Index on `donation` for donation-coupon relationship
 * - Index on `status` for filtering active coupons
 * - Compound index on `status` + `expiresAt` for winner selection
 */
const couponSchema = new Schema<ICoupon>(
  {
    /**
     * Unique coupon code.
     * Format: FU-XXXXXXXX (8 alphanumeric characters after prefix)
     */
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    /**
     * Reference to the User who made the donation.
     * Only populated if the donor was logged in.
     */
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    /**
     * Reference to the associated Donation.
     */
    donation: {
      type: Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true,
    },

    /**
     * Reference to the Fundraiser that received the donation.
     */
    fundraiser: {
      type: Schema.Types.ObjectId,
      ref: 'Fundraiser',
      required: true,
      index: true,
    },

    /**
     * Email address of the donor.
     * Used for sending coupon notification and winner announcements.
     */
    donorEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    /**
     * Display name of the donor.
     */
    donorName: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Original donation amount (excluding tip).
     */
    donationAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * Currency code for the donation.
     */
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
    },

    /**
     * Current status of the coupon.
     * - active: Valid for prize selection
     * - used: Already selected as winner
     * - expired: Past expiration date
     */
    status: {
      type: String,
      enum: ['active', 'used', 'expired'],
      default: 'active',
      index: true,
    },

    /**
     * Whether the coupon email was successfully sent.
     */
    emailSent: {
      type: Boolean,
      default: false,
    },

    /**
     * Timestamp when the email was sent.
     */
    emailSentAt: {
      type: Date,
    },

    /**
     * Expiration date of the coupon.
     * Defaults to 1 year from creation.
     */
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Compound index for efficient winner selection queries.
 * Filters by status and expiration date.
 */
couponSchema.index({ status: 1, expiresAt: 1 });

/**
 * Compound index for user's coupon history.
 */
couponSchema.index({ user: 1, createdAt: -1 });

/**
 * Compound index for fundraiser's coupon statistics.
 */
couponSchema.index({ fundraiser: 1, status: 1 });

export const Coupon = model<ICoupon>('Coupon', couponSchema);
