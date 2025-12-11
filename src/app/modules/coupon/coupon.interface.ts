/**
 * @fileoverview Coupon module type definitions.
 *
 * Defines all interfaces and types related to donation coupons,
 * including database document structure, creation payloads,
 * and coupon status enums.
 *
 * @module modules/coupon/interface
 */

import { Document, Types } from 'mongoose';

/**
 * Possible statuses for a coupon.
 *
 * @enum {string}
 * @property {string} ACTIVE - Coupon is valid and can be used for prize selection
 * @property {string} USED - Coupon has been selected as a winner
 * @property {string} EXPIRED - Coupon is no longer valid (past expiration date)
 */
export type TCouponStatus = 'active' | 'used' | 'expired';

/**
 * Represents a coupon document in the database.
 *
 * @interface ICoupon
 * @extends {Document}
 *
 * @property {string} code - Unique coupon code (e.g., "FU-ABC123XY")
 * @property {Types.ObjectId} [user] - Reference to User if donor was logged in
 * @property {Types.ObjectId} donation - Reference to the associated Donation
 * @property {Types.ObjectId} fundraiser - Reference to the associated Fundraiser
 * @property {string} donorEmail - Email address of the donor
 * @property {string} donorName - Name of the donor
 * @property {number} donationAmount - Original donation amount (excluding tip)
 * @property {string} currency - Currency code (e.g., "USD")
 * @property {TCouponStatus} status - Current status of the coupon
 * @property {boolean} emailSent - Whether the coupon email was successfully sent
 * @property {Date} [emailSentAt] - Timestamp when email was sent
 * @property {Date} expiresAt - Expiration date of the coupon
 * @property {Date} createdAt - Timestamp of coupon creation
 * @property {Date} updatedAt - Timestamp of last update
 */
export interface ICoupon extends Document {
  code: string;
  user?: Types.ObjectId;
  donation: Types.ObjectId;
  fundraiser: Types.ObjectId;
  donorEmail: string;
  donorName: string;
  donationAmount: number;
  currency: string;
  status: TCouponStatus;
  emailSent: boolean;
  emailSentAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payload for creating a new coupon.
 *
 * @interface ICreateCouponPayload
 *
 * @property {string} donationId - ID of the associated donation
 * @property {string} fundraiserId - ID of the associated fundraiser
 * @property {string} [userId] - ID of the user (if logged in)
 * @property {string} donorEmail - Email address of the donor
 * @property {string} donorName - Name of the donor
 * @property {number} donationAmount - Donation amount (excluding tip)
 * @property {string} [currency] - Currency code (defaults to "USD")
 * @property {string} fundraiserTitle - Title of the fundraiser (for email)
 */
export interface ICreateCouponPayload {
  donationId: string;
  fundraiserId: string;
  userId?: string;
  donorEmail: string;
  donorName: string;
  donationAmount: number;
  currency?: string;
  fundraiserTitle: string;
}

/**
 * Response structure for coupon creation.
 *
 * @interface ICouponResponse
 *
 * @property {string} code - Generated coupon code
 * @property {string} donorEmail - Email address coupon was sent to
 * @property {boolean} emailSent - Whether email was successfully sent
 * @property {Date} expiresAt - Coupon expiration date
 */
export interface ICouponResponse {
  code: string;
  donorEmail: string;
  emailSent: boolean;
  expiresAt: Date;
}

/**
 * Parameters for selecting a random winner.
 *
 * @interface ISelectWinnerParams
 *
 * @property {string} [fundraiserId] - Filter by specific fundraiser
 * @property {Date} [fromDate] - Filter coupons created after this date
 * @property {Date} [toDate] - Filter coupons created before this date
 */
export interface ISelectWinnerParams {
  fundraiserId?: string;
  fromDate?: Date;
  toDate?: Date;
}
