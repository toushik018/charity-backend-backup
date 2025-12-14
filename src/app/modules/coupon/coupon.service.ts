/**
 * @fileoverview Coupon service for donation reward management.
 *
 * Provides business logic for:
 * - Generating unique coupon codes
 * - Creating and storing coupons after donations
 * - Sending coupon notification emails
 * - Selecting random winners for prize draws
 * - Retrieving coupon statistics and history
 *
 * @module modules/coupon/service
 */

import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';
import AppError from '../../error/AppError';
import { logEmail, sendEmail } from '../../utils/email';
import {
  ICouponResponse,
  ICreateCouponPayload,
  ISelectWinnerParams,
} from './coupon.interface';
import { Coupon } from './coupon.model';
import {
  CouponEmailShopInfo,
  couponEmailTemplate,
} from './templates/coupon.template';

type TGetAllCouponsFilters = {
  search?: string;
  status?: 'active' | 'used' | 'expired';
  fundraiserId?: string;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: Date;
  toDate?: Date;
};

/**
 * Default coupon expiration period in days.
 */
const DEFAULT_EXPIRATION_DAYS = 365;

/**
 * Coupon code prefix for easy identification.
 */
const COUPON_PREFIX = 'FU';

/**
 * Organization info for email templates.
 * Can be extended to pull from config or database.
 */
const getShopInfo = (): CouponEmailShopInfo => ({
  name: 'FundsUs',
  email: config.email?.from || 'support@fundsus.com',
  website: config.frontend_url || 'https://fundsus.com',
});

/**
 * Generate a unique coupon code.
 *
 * Format: FU-XXXXXXXX (8 alphanumeric characters)
 * Uses cryptographically secure random bytes for uniqueness.
 *
 * @returns {string} Unique coupon code
 *
 * @example
 * const code = generateCouponCode();
 * // Returns: "FU-A3B7C9D2"
 */
const generateCouponCode = (): string => {
  const randomBytes = crypto.randomBytes(4);
  const code = randomBytes.toString('hex').toUpperCase();
  return `${COUPON_PREFIX}-${code}`;
};

/**
 * Calculate coupon expiration date.
 *
 * @param {number} [days=DEFAULT_EXPIRATION_DAYS] - Days until expiration
 * @returns {Date} Expiration date
 */
const calculateExpirationDate = (
  days: number = DEFAULT_EXPIRATION_DAYS
): Date => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
};

/**
 * Create a coupon for a donation and send notification email.
 *
 * This function:
 * 1. Generates a unique coupon code
 * 2. Stores the coupon in the database
 * 3. Sends a notification email to the donor
 * 4. Updates the coupon record with email status
 *
 * @param {ICreateCouponPayload} payload - Coupon creation parameters
 * @returns {Promise<ICouponResponse>} Created coupon details
 *
 * @throws {AppError} If coupon creation fails
 *
 * @example
 * const coupon = await CouponService.createCoupon({
 *   donationId: '507f1f77bcf86cd799439011',
 *   fundraiserId: '507f1f77bcf86cd799439012',
 *   userId: '507f1f77bcf86cd799439013', // optional
 *   donorEmail: 'donor@example.com',
 *   donorName: 'John Doe',
 *   donationAmount: 50,
 *   currency: 'USD',
 *   fundraiserTitle: 'Help Local School',
 * });
 */
const createCoupon = async (
  payload: ICreateCouponPayload
): Promise<ICouponResponse> => {
  const {
    donationId,
    fundraiserId,
    userId,
    donorEmail,
    donorName,
    donationAmount,
    currency = 'EUR',
    fundraiserTitle,
  } = payload;

  // Check if coupon already exists for this donation (idempotency)
  const existingCoupon = await Coupon.findOne({ donation: donationId });
  if (existingCoupon) {
    return {
      code: existingCoupon.code,
      donorEmail: existingCoupon.donorEmail,
      emailSent: existingCoupon.emailSent,
      expiresAt: existingCoupon.expiresAt,
    };
  }

  // Generate unique coupon code
  let code = generateCouponCode();
  let attempts = 0;
  const maxAttempts = 10;

  // Ensure code uniqueness
  while (await Coupon.findOne({ code })) {
    code = generateCouponCode();
    attempts++;
    if (attempts >= maxAttempts) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to generate unique coupon code'
      );
    }
  }

  const expiresAt = calculateExpirationDate();

  // Create coupon record
  const coupon = await Coupon.create({
    code,
    user: userId || undefined,
    donation: donationId,
    fundraiser: fundraiserId,
    donorEmail,
    donorName,
    donationAmount,
    currency,
    status: 'active',
    emailSent: false,
    expiresAt,
  });

  // Send email notification (non-blocking)
  let emailSent = false;
  try {
    const emailHtml = couponEmailTemplate({
      donorName,
      donorEmail,
      couponCode: code,
      donationAmount,
      currency,
      fundraiserTitle,
      donationDate: new Date(),
      expiresAt,
      shop: getShopInfo(),
      logoUrl: undefined, // Can be configured
      helpCenterUrl: config.frontend_url
        ? `${config.frontend_url}/help`
        : undefined,
      viewCouponUrl:
        userId && config.frontend_url
          ? `${config.frontend_url}/profile/coupons`
          : undefined,
    });

    await sendEmail({
      to: donorEmail,
      subject: `🎉 Your Donation Coupon Code: ${code}`,
      html: emailHtml,
      text: `Thank you for your donation of ${currency === 'EUR' ? '€' : currency + ' '}${donationAmount} to "${fundraiserTitle}"! Your coupon code is: ${code}. This code is valid until ${expiresAt.toDateString()}.`,
    });

    emailSent = true;

    // Update coupon with email status
    await Coupon.findByIdAndUpdate(coupon._id, {
      emailSent: true,
      emailSentAt: new Date(),
    });

    logEmail('Coupon email sent successfully', {
      couponCode: code,
      donorEmail,
    });
  } catch (error) {
    logEmail('Failed to send coupon email', {
      couponCode: code,
      donorEmail,
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't throw - coupon is created, email failure is logged
  }

  return {
    code,
    donorEmail,
    emailSent,
    expiresAt,
  };
};

/**
 * Get coupons for a specific user.
 *
 * @param {string} userId - User ID
 * @param {number} [page=1] - Page number
 * @param {number} [limit=20] - Items per page
 * @returns {Promise<object>} Paginated coupon list
 */
const getUserCoupons = async (
  userId: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const [coupons, total] = await Promise.all([
    Coupon.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('fundraiser', 'title slug coverImage')
      .populate('donation', 'amount totalAmount'),
    Coupon.countDocuments({ user: userId }),
  ]);

  return {
    coupons,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single coupon by its code.
 *
 * @param {string} code - Coupon code
 * @returns {Promise<ICoupon | null>} Coupon document or null
 */
const getCouponByCode = async (code: string) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() })
    .populate('fundraiser', 'title slug coverImage')
    .populate('donation', 'amount totalAmount createdAt')
    .populate('user', 'name email profilePicture');

  return coupon;
};

/**
 * Select a random winner from active coupons.
 *
 * This function:
 * 1. Filters coupons by status (active) and expiration
 * 2. Optionally filters by fundraiser and date range
 * 3. Randomly selects one coupon
 * 4. Marks the selected coupon as "used"
 *
 * @param {ISelectWinnerParams} [params] - Filter parameters
 * @returns {Promise<ICoupon | null>} Selected winner coupon or null
 *
 * @example
 * // Select winner from all active coupons
 * const winner = await CouponService.selectRandomWinner();
 *
 * // Select winner from specific fundraiser
 * const winner = await CouponService.selectRandomWinner({
 *   fundraiserId: '507f1f77bcf86cd799439012',
 * });
 */
const selectRandomWinner = async (params?: ISelectWinnerParams) => {
  const query: Record<string, unknown> = {
    status: 'active',
    expiresAt: { $gt: new Date() },
  };

  if (params?.fundraiserId) {
    query.fundraiser = params.fundraiserId;
  }

  if (params?.fromDate) {
    query.createdAt = {
      ...((query.createdAt as object) || {}),
      $gte: params.fromDate,
    };
  }

  if (params?.toDate) {
    query.createdAt = {
      ...((query.createdAt as object) || {}),
      $lte: params.toDate,
    };
  }

  // Count eligible coupons
  const count = await Coupon.countDocuments(query);
  if (count === 0) {
    return null;
  }

  // Select random coupon
  const randomIndex = Math.floor(Math.random() * count);
  const winner = await Coupon.findOne(query)
    .skip(randomIndex)
    .populate('fundraiser', 'title slug')
    .populate('user', 'name email profilePicture');

  if (winner) {
    // Mark as used
    await Coupon.findByIdAndUpdate(winner._id, { status: 'used' });
    winner.status = 'used';
  }

  return winner;
};

/**
 * Get coupon statistics for admin dashboard.
 *
 * @param {string} [fundraiserId] - Optional fundraiser filter
 * @returns {Promise<object>} Coupon statistics
 */
const getCouponStats = async (fundraiserId?: string) => {
  const matchStage: Record<string, unknown> = {};
  if (fundraiserId) {
    matchStage.fundraiser = fundraiserId;
  }

  const [stats, recentCoupons] = await Promise.all([
    Coupon.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalCoupons: { $sum: 1 },
          activeCoupons: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          usedCoupons: {
            $sum: { $cond: [{ $eq: ['$status', 'used'] }, 1, 0] },
          },
          expiredCoupons: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] },
          },
          emailsSent: {
            $sum: { $cond: ['$emailSent', 1, 0] },
          },
          totalDonationAmount: { $sum: '$donationAmount' },
        },
      },
    ]),
    Coupon.find(matchStage)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('fundraiser', 'title slug')
      .populate('user', 'name email'),
  ]);

  const statsData = stats[0] || {
    totalCoupons: 0,
    activeCoupons: 0,
    usedCoupons: 0,
    expiredCoupons: 0,
    emailsSent: 0,
    totalDonationAmount: 0,
  };

  return {
    ...statsData,
    recentCoupons,
  };
};

/**
 * Admin: Get all coupons with donation + fundraiser details.
 *
 * @param {number} [page=1] - Page number
 * @param {number} [limit=20] - Items per page
 * @param {TGetAllCouponsFilters} [filters] - Optional filters
 * @returns {Promise<object>} Paginated coupons list
 */
const getAllCoupons = async (
  page: number = 1,
  limit: number = 20,
  filters?: TGetAllCouponsFilters
) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
  const skip = (safePage - 1) * safeLimit;

  const query: Record<string, unknown> = {};

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.fundraiserId) {
    query.fundraiser = filters.fundraiserId;
  }

  if (filters?.search) {
    const term = String(filters.search).trim();
    if (term) {
      query.$or = [
        { code: { $regex: term, $options: 'i' } },
        { donorEmail: { $regex: term, $options: 'i' } },
        { donorName: { $regex: term, $options: 'i' } },
      ];
    }
  }

  if (typeof filters?.minAmount === 'number') {
    query.donationAmount = {
      ...((query.donationAmount as object) || {}),
      $gte: filters.minAmount,
    };
  }

  if (typeof filters?.maxAmount === 'number') {
    query.donationAmount = {
      ...((query.donationAmount as object) || {}),
      $lte: filters.maxAmount,
    };
  }

  if (filters?.fromDate) {
    query.createdAt = {
      ...((query.createdAt as object) || {}),
      $gte: filters.fromDate,
    };
  }

  if (filters?.toDate) {
    query.createdAt = {
      ...((query.createdAt as object) || {}),
      $lte: filters.toDate,
    };
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('fundraiser', 'title slug coverImage status owner')
      .populate({
        path: 'donation',
        select:
          'fundraiser donor amount tipAmount totalAmount currency paymentStatus paymentMethod transactionId isAnonymous donorName donorEmail createdAt',
        populate: {
          path: 'donor',
          select: 'name email profilePicture',
        },
      })
      .populate('user', 'name email profilePicture'),
    Coupon.countDocuments(query),
  ]);

  return {
    coupons,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

/**
 * Admin: Get a single coupon by id.
 */
const getCouponById = async (couponId: string) => {
  const coupon = await Coupon.findById(couponId)
    .populate('fundraiser', 'title slug coverImage status owner')
    .populate({
      path: 'donation',
      select:
        'fundraiser donor amount tipAmount totalAmount currency paymentStatus paymentMethod transactionId isAnonymous donorName donorEmail createdAt',
      populate: {
        path: 'donor',
        select: 'name email profilePicture',
      },
    })
    .populate('user', 'name email profilePicture');

  if (!coupon) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Coupon not found');
  }

  return coupon;
};

/**
 * Mark expired coupons.
 *
 * This should be run periodically (e.g., daily cron job)
 * to update the status of expired coupons.
 *
 * @returns {Promise<number>} Number of coupons marked as expired
 */
const markExpiredCoupons = async (): Promise<number> => {
  const result = await Coupon.updateMany(
    {
      status: 'active',
      expiresAt: { $lt: new Date() },
    },
    {
      status: 'expired',
    }
  );

  return result.modifiedCount;
};

export const CouponService = {
  createCoupon,
  getUserCoupons,
  getCouponByCode,
  selectRandomWinner,
  getCouponStats,
  getAllCoupons,
  getCouponById,
  markExpiredCoupons,
};
