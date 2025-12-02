import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import AppError from '../../error/AppError';
import { Fundraiser } from '../fundraiser/fundraiser.model';
import type { TListOptions } from '../user/user.service';
import { TReactionType } from './fundraiser.reaction.interface';
import { FundraiserReaction } from './fundraiser.reaction.model';

export const addOrUpdateReaction = async (
  userId: string,
  fundraiserId: string,
  type: TReactionType
) => {
  const fr = await Fundraiser.findOne({
    _id: fundraiserId,
    status: 'published',
  })
    .select('_id status')
    .lean();
  if (!fr) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Fundraiser not found');
  }

  const filter = {
    fundraiser: new Types.ObjectId(fundraiserId),
    user: new Types.ObjectId(userId),
  } as const;

  const updated = await FundraiserReaction.findOneAndUpdate(
    filter,
    { $set: { type } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return updated;
};

export const removeReaction = async (userId: string, fundraiserId: string) => {
  await FundraiserReaction.findOneAndDelete({
    fundraiser: new Types.ObjectId(fundraiserId),
    user: new Types.ObjectId(userId),
  });
  return {};
};

export const getReactionsSummary = async (fundraiserId: string) => {
  const objId = new Types.ObjectId(fundraiserId);
  const grouped = await FundraiserReaction.aggregate<{
    _id: TReactionType;
    count: number;
  }>([
    { $match: { fundraiser: objId } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);

  const breakdown: Record<TReactionType, number> = {
    SENDING_LOVE: 0,
    SYMPATHIES: 0,
    HOPE: 0,
    CARE: 0,
    SUPPORTING_YOU: 0,
    INSPIRING: 0,
  };
  let total = 0;
  for (const g of grouped) {
    breakdown[g._id] = g.count;
    total += g.count;
  }
  return { fundraiserId, total, breakdown };
};

export const getMyReactions = async (userId: string, options: TListOptions) => {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    FundraiserReaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('fundraiser', 'title slug coverImage status')
      .lean(),
    FundraiserReaction.countDocuments({ user: userId }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data,
  };
};
