import { Types } from 'mongoose';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './activity.constant';
import { IActivity, TActivityType } from './activity.interface';
import { Activity } from './activity.model';

interface CreateActivityPayload {
  userId: string;
  type: TActivityType;
  fundraiserId: string;
  donationAmount?: number;
  donationCurrency?: string;
  reactionType?: string;
  isPublic?: boolean;
}

interface GetActivitiesOptions {
  page?: number;
  limit?: number;
}

export const createActivity = async (
  payload: CreateActivityPayload
): Promise<IActivity> => {
  const activity = await Activity.create({
    user: new Types.ObjectId(payload.userId),
    type: payload.type,
    fundraiser: new Types.ObjectId(payload.fundraiserId),
    donationAmount: payload.donationAmount,
    donationCurrency: payload.donationCurrency || 'EUR',
    reactionType: payload.reactionType,
    isPublic: payload.isPublic ?? true,
  });

  return activity;
};

export const getUserActivities = async (
  userId: string,
  options: GetActivitiesOptions = {}
) => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, options.limit || DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    Activity.find({ user: new Types.ObjectId(userId), isPublic: true })
      .populate('user', 'name profilePicture')
      .populate('fundraiser', 'title slug coverImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Activity.countDocuments({
      user: new Types.ObjectId(userId),
      isPublic: true,
    }),
  ]);

  return {
    data: activities,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPublicUserActivities = async (
  userId: string,
  options: GetActivitiesOptions = {}
) => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, options.limit || DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    Activity.find({ user: new Types.ObjectId(userId), isPublic: true })
      .populate('user', 'name profilePicture')
      .populate('fundraiser', 'title slug coverImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Activity.countDocuments({
      user: new Types.ObjectId(userId),
      isPublic: true,
    }),
  ]);

  return {
    data: activities,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getFundraiserActivities = async (
  fundraiserId: string,
  options: GetActivitiesOptions = {}
) => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, options.limit || DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    Activity.find({
      fundraiser: new Types.ObjectId(fundraiserId),
      isPublic: true,
    })
      .populate('user', 'name profilePicture')
      .populate('fundraiser', 'title slug coverImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Activity.countDocuments({
      fundraiser: new Types.ObjectId(fundraiserId),
      isPublic: true,
    }),
  ]);

  return {
    data: activities,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const deleteActivityByReaction = async (
  userId: string,
  fundraiserId: string
): Promise<void> => {
  await Activity.deleteOne({
    user: new Types.ObjectId(userId),
    fundraiser: new Types.ObjectId(fundraiserId),
    type: 'REACTION',
  });
};

// Admin: Get all activities
export const getAllActivities = async (options: GetActivitiesOptions = {}) => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, options.limit || DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    Activity.find()
      .populate('user', 'name email profilePicture')
      .populate('fundraiser', 'title slug coverImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Activity.countDocuments(),
  ]);

  return {
    data: activities,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Admin: Delete activity
export const deleteActivity = async (activityId: string): Promise<void> => {
  await Activity.findByIdAndDelete(activityId);
};
