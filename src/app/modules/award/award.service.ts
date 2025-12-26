import { StatusCodes } from 'http-status-codes';
import mongoose, { FilterQuery, Query } from 'mongoose';

import config from '../../config';
import AppError from '../../error/AppError';
import { logEmail, sendEmail } from '../../utils/email';
import { Coupon } from '../coupon/coupon.model';
import { IAnnounceAwardPayload, IAward } from './award.interface';
import { Award } from './award.model';
import { awardAnnouncementEmailTemplate } from './templates/award-email.template';

interface IGetAwardsParams {
  page?: number;
  limit?: number;
  fundraiserId?: string;
  fromDate?: Date;
  toDate?: Date;
}

type PopulatedAward = IAward & {
  fundraiser?: {
    title?: string;
    slug?: string;
    coverImage?: string;
  };
};

const populateAward = <T>(query: Query<T, IAward>) =>
  query
    .populate('fundraiser', 'title slug coverImage')
    .populate('announcedBy', 'name email profilePicture')
    .populate('coupon', 'code status')
    .populate('donor', 'name email profilePicture');

const buildFundraiserUrl = (slug?: string) => {
  if (!slug || !config.frontend_url) return undefined;
  return `${config.frontend_url}/fundraisers/${slug}`;
};

const sendAwardAnnouncementEmail = async (award: PopulatedAward) => {
  if (!award?.donorEmail) {
    return;
  }

  const brandName = config.admin?.name || 'FundsUs';
  const fundraiserTitle =
    (award.fundraiser &&
      'title' in award.fundraiser &&
      award.fundraiser.title) ||
    'your supported fundraiser';

  try {
    const emailHtml = awardAnnouncementEmailTemplate({
      donorName: award.donorName || 'Valued Supporter',
      couponCode: award.couponCode,
      fundraiserTitle,
      donationAmount: award.donationAmount,
      currency: award.currency,
      announcedAt: award.announcedAt,
      selectedAt: award.selectedAt,
      brandName,
      brandLogoUrl:
        award.fundraiser && 'coverImage' in award.fundraiser
          ? award.fundraiser.coverImage
          : undefined,
      fundraiserUrl: buildFundraiserUrl(
        award.fundraiser && 'slug' in award.fundraiser
          ? award.fundraiser.slug
          : undefined
      ),
      supportEmail: config.email?.from,
      notes: award.notes,
    });

    await sendEmail({
      to: award.donorEmail,
      subject: `🎉 ${brandName} Award Winner: ${award.donorName || 'You'}!`,
      html: emailHtml,
      text: `Congratulations! Your coupon ${award.couponCode} was selected as an award winner for ${fundraiserTitle}.`,
    });

    await Award.findByIdAndUpdate(award._id, {
      emailSent: true,
      emailSentAt: new Date(),
    });

    logEmail('Award announcement email sent', {
      awardId: award._id,
      couponCode: award.couponCode,
      donorEmail: award.donorEmail,
    });
  } catch (error) {
    logEmail('Failed to send award announcement email', {
      awardId: award._id,
      couponCode: award.couponCode,
      donorEmail: award.donorEmail,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const announceAward = async ({
  couponId,
  announcedBy,
  selectedAt,
  notes,
}: IAnnounceAwardPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const coupon = await Coupon.findById(couponId)
      .populate('fundraiser', 'title slug coverImage')
      .populate('donation', 'amount totalAmount currency createdAt')
      .populate('user', 'name email profilePicture')
      .session(session);

    if (!coupon) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Coupon not found');
    }

    if (coupon.status !== 'active') {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Coupon is not eligible for announcement'
      );
    }

    const announcedAt = new Date();
    const award = await Award.create(
      [
        {
          coupon: coupon._id,
          donation: coupon.donation,
          fundraiser: coupon.fundraiser,
          donor: coupon.user,
          couponCode: coupon.code,
          donorName: coupon.donorName,
          donorEmail: coupon.donorEmail,
          donationAmount: coupon.donationAmount,
          currency: coupon.currency,
          selectedAt: selectedAt || announcedAt,
          announcedAt,
          announcedBy,
          notes,
        },
      ],
      { session }
    );

    await Coupon.findByIdAndUpdate(coupon._id, { status: 'used' }, { session });

    await session.commitTransaction();
    session.endSession();

    const populated = await populateAward(
      Award.findById(award[0]._id)
    ).lean<IAward>();

    if (!populated) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Award announcement failed to load summary'
      );
    }

    await sendAwardAnnouncementEmail(populated as PopulatedAward);

    return populated;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAdminAwards = async ({
  page = 1,
  limit = 20,
  fundraiserId,
  fromDate,
  toDate,
}: IGetAwardsParams) => {
  const skip = (page - 1) * limit;
  const query: FilterQuery<IAward> = {};

  if (fundraiserId) {
    query.fundraiser = fundraiserId;
  }

  if (fromDate || toDate) {
    query.announcedAt = {};
    if (fromDate) {
      query.announcedAt.$gte = fromDate;
    }
    if (toDate) {
      query.announcedAt.$lte = toDate;
    }
  }

  const [awards, total] = await Promise.all([
    populateAward(
      Award.find(query).sort({ announcedAt: -1 }).skip(skip).limit(limit)
    ).lean(),
    Award.countDocuments(query),
  ]);

  return {
    awards,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getAwardById = async (awardId: string) => {
  const award = await populateAward(Award.findById(awardId)).lean();

  if (!award) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Award not found');
  }

  return award;
};

/**
 * Retrieves donors for a specific fundraiser with weighted probability data.
 *
 * Each donor's win probability is proportional to their total donation amount.
 * Only considers completed donations with active coupons.
 *
 * @param {string} fundraiserId - The fundraiser ID to get donors for
 * @returns {Promise<Object>} Fundraiser info and weighted donors list
 */
const getFundraiserDonorsForAward = async (fundraiserId: string) => {
  // Get all active coupons for this fundraiser
  const coupons = await Coupon.find({
    fundraiser: fundraiserId,
    status: 'active',
    expiresAt: { $gt: new Date() },
  })
    .populate('donation', 'amount totalAmount currency createdAt paymentStatus')
    .populate('user', 'name email profilePicture')
    .populate(
      'fundraiser',
      'title slug coverImage goalAmount currentAmount donationCount'
    )
    .lean();

  if (coupons.length === 0) {
    return {
      fundraiser: null,
      donors: [],
      totalAmount: 0,
      totalCoupons: 0,
    };
  }

  // Calculate total donation amount for probability weighting
  const totalAmount = coupons.reduce(
    (sum, coupon) => sum + (coupon.donationAmount || 0),
    0
  );

  // Build weighted donors list
  const donors = coupons.map((coupon) => {
    const amount = coupon.donationAmount || 0;
    const probability = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;

    return {
      couponId: coupon._id,
      couponCode: coupon.code,
      donorName: coupon.donorName,
      donorEmail: coupon.donorEmail,
      donationAmount: amount,
      currency: coupon.currency,
      probability: Math.round(probability * 100) / 100, // Round to 2 decimal places
      user: coupon.user,
      donation: coupon.donation,
      createdAt: coupon.createdAt,
    };
  });

  // Sort by probability (highest first)
  donors.sort((a, b) => b.probability - a.probability);

  return {
    fundraiser: coupons[0]?.fundraiser || null,
    donors,
    totalAmount,
    totalCoupons: coupons.length,
  };
};

/**
 * Selects a random winner from fundraiser donors using weighted probability.
 *
 * The probability of winning is proportional to the donation amount.
 * Uses a weighted random selection algorithm.
 *
 * @param {string} fundraiserId - The fundraiser ID to select winner from
 * @returns {Promise<Object>} Selected winner coupon data
 */
const selectWeightedWinner = async (fundraiserId: string) => {
  const { donors, totalAmount, fundraiser } =
    await getFundraiserDonorsForAward(fundraiserId);

  if (donors.length === 0) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'No eligible donors found for this fundraiser'
    );
  }

  // Weighted random selection
  const random = Math.random() * totalAmount;
  let cumulative = 0;
  let selectedDonor = donors[0];

  for (const donor of donors) {
    cumulative += donor.donationAmount;
    if (random <= cumulative) {
      selectedDonor = donor;
      break;
    }
  }

  return {
    winner: selectedDonor,
    fundraiser,
    totalDonors: donors.length,
    totalAmount,
  };
};

export const AwardService = {
  announceAward,
  getAdminAwards,
  getAwardById,
  getFundraiserDonorsForAward,
  selectWeightedWinner,
};
