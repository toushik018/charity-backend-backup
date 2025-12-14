import { Types } from 'mongoose';
import { Fundraiser } from '../fundraiser/fundraiser.model';
import { User } from '../user/user.model';
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
  filters?: AdminActivityListFilters;
}

interface AdminActivityListFilters {
  searchTerm?: string;
  type?: TActivityType;
  isPublic?: boolean;
  userId?: string;
  fundraiserId?: string;
  reactionType?: string;
  fromDate?: string;
  toDate?: string;
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

  const filters = options.filters || {};
  const andConditions: Record<string, unknown>[] = [];

  if (filters.type) {
    andConditions.push({ type: filters.type });
  }

  if (typeof filters.isPublic === 'boolean') {
    andConditions.push({ isPublic: filters.isPublic });
  }

  if (filters.userId && Types.ObjectId.isValid(filters.userId)) {
    andConditions.push({ user: new Types.ObjectId(filters.userId) });
  }

  if (filters.fundraiserId && Types.ObjectId.isValid(filters.fundraiserId)) {
    andConditions.push({
      fundraiser: new Types.ObjectId(filters.fundraiserId),
    });
  }

  if (filters.reactionType) {
    const rt = String(filters.reactionType).trim();
    if (rt) {
      andConditions.push({ reactionType: { $regex: rt, $options: 'i' } });
    }
  }

  if (filters.fromDate || filters.toDate) {
    const createdAt: Record<string, Date> = {};

    if (filters.fromDate) {
      const d = new Date(filters.fromDate);
      if (!Number.isNaN(d.getTime())) createdAt.$gte = d;
    }

    if (filters.toDate) {
      const d = new Date(filters.toDate);
      if (!Number.isNaN(d.getTime())) createdAt.$lte = d;
    }

    if (Object.keys(createdAt).length) {
      andConditions.push({ createdAt });
    }
  }

  const term = String(filters.searchTerm || '').trim();
  if (term) {
    const orConditions: Record<string, unknown>[] = [];

    // Only search users when a specific userId filter is not already applied.
    if (!filters.userId) {
      const users = await User.find({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } },
        ],
      })
        .select('_id')
        .limit(50)
        .lean();

      const userIds = users.map((u) => u._id);
      if (userIds.length) {
        orConditions.push({ user: { $in: userIds } });
      }
    }

    // Only search fundraisers when a specific fundraiserId filter is not already applied.
    if (!filters.fundraiserId) {
      const fundraisers = await Fundraiser.find({
        $or: [
          { title: { $regex: term, $options: 'i' } },
          { slug: { $regex: term, $options: 'i' } },
        ],
      })
        .select('_id')
        .limit(50)
        .lean();

      const fundraiserIds = fundraisers.map((f) => f._id);
      if (fundraiserIds.length) {
        orConditions.push({ fundraiser: { $in: fundraiserIds } });
      }
    }

    // If reactionType isn't explicitly filtered, allow search to match it.
    if (!filters.reactionType) {
      orConditions.push({ reactionType: { $regex: term, $options: 'i' } });
    }

    if (orConditions.length) {
      andConditions.push({ $or: orConditions });
    }
  }

  const query = andConditions.length ? { $and: andConditions } : {};

  const [activities, total] = await Promise.all([
    Activity.find(query)
      .populate('user', 'name email profilePicture')
      .populate('fundraiser', 'title slug coverImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Activity.countDocuments(query),
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
