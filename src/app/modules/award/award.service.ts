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

export const AwardService = {
  announceAward,
  getAdminAwards,
  getAwardById,
};
