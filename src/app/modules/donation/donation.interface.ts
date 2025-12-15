/**
 * @fileoverview Donation module type definitions.
 *
 * Defines TypeScript interfaces and types for the donation module,
 * including document schemas, payment types, and request payloads.
 *
 * @module modules/donation/interface
 */

import { Document, Types } from 'mongoose';

/* -------------------------------------------------------------------------- */
/*                              PAYMENT TYPES                                 */
/* -------------------------------------------------------------------------- */

/**
 * Supported payment methods.
 */
export type TPaymentMethod = 'card' | 'bank' | 'mobile';

/**
 * Array of valid payment methods for validation.
 */
export const PAYMENT_METHODS: TPaymentMethod[] = ['card', 'bank', 'mobile'];

/**
 * Donation payment status.
 */
export type TPaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

/**
 * Array of valid payment statuses for validation.
 */
export const PAYMENT_STATUSES: TPaymentStatus[] = [
  'pending',
  'completed',
  'failed',
  'refunded',
];

/* -------------------------------------------------------------------------- */
/*                              DOCUMENT INTERFACE                            */
/* -------------------------------------------------------------------------- */

/**
 * Donation document interface.
 *
 * Represents a donation transaction in the database.
 *
 * @extends Document
 */
export interface IDonation extends Document {
  /**
   * Unique identifier.
   */
  _id: Types.ObjectId;

  /**
   * Reference to the fundraiser receiving the donation.
   */
  fundraiser: Types.ObjectId;

  /**
   * Reference to the user who made the donation (if logged in).
   */
  donor?: Types.ObjectId;

  /**
   * Base donation amount (excluding tip).
   */
  amount: number;

  /**
   * Optional tip amount for the platform.
   */
  tipAmount: number;

  /**
   * Total amount charged (amount + tipAmount).
   */
  totalAmount: number;

  /**
   * Currency code (e.g., 'EUR', 'USD').
   */
  currency: string;

  /**
   * Payment method used.
   */
  paymentMethod: TPaymentMethod;

  /**
   * Current payment status.
   */
  paymentStatus: TPaymentStatus;

  /**
   * External payment processor transaction ID.
   */
  transactionId?: string;

  /**
   * Whether the donor chose to remain anonymous.
   */
  isAnonymous: boolean;

  /**
   * Name of the donor.
   */
  donorName: string;

  /**
   * Email address of the donor.
   */
  donorEmail: string;

  /**
   * Optional message from the donor.
   */
  message?: string;

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
 * Payload for creating a new donation.
 */
export type TCreateDonationPayload = {
  /**
   * ID of the fundraiser to donate to.
   */
  fundraiserId: string;

  /**
   * Base donation amount.
   */
  amount: number;

  /**
   * Optional tip amount.
   */
  tipAmount?: number;

  /**
   * Currency code.
   */
  currency?: string;

  /**
   * Payment method to use.
   */
  paymentMethod: TPaymentMethod;

  /**
   * Whether to make the donation anonymous.
   */
  isAnonymous?: boolean;

  /**
   * Donor's name.
   */
  donorName: string;

  /**
   * Donor's email address.
   */
  donorEmail: string;

  /**
   * Optional message to the fundraiser.
   */
  message?: string;
};

/* -------------------------------------------------------------------------- */
/*                              FILTER TYPES                                  */
/* -------------------------------------------------------------------------- */

/**
 * Filter options for admin donation list queries.
 */
export interface IDonationFilters {
  /**
   * Search term for donor name or email.
   */
  searchTerm?: string;

  /**
   * Filter by payment status.
   */
  paymentStatus?: TPaymentStatus;

  /**
   * Filter by payment method.
   */
  paymentMethod?: TPaymentMethod;

  /**
   * Filter by fundraiser ID.
   */
  fundraiserId?: string;

  /**
   * Filter by donor user ID.
   */
  donorId?: string;

  /**
   * Filter by anonymous status.
   */
  isAnonymous?: boolean;

  /**
   * Minimum donation amount.
   */
  minAmount?: number;

  /**
   * Maximum donation amount.
   */
  maxAmount?: number;

  /**
   * Filter donations created after this date.
   */
  fromDate?: string;

  /**
   * Filter donations created before this date.
   */
  toDate?: string;
}
