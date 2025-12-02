import { StatusCodes } from 'http-status-codes';
import { FilterQuery, PipelineStage } from 'mongoose';
import config from '../../config';
import AppError from '../../error/AppError';
import { Fundraiser } from '../fundraiser/fundraiser.model';
import { TProfile, TUser, TUserRole } from './user.interface';
import { IUserDocument, User } from './user.model';
import { TUserFilters, buildUserQuery } from './user.utils';

export type TListOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export const getAllUsersFromDB = async (
  filters: TUserFilters,
  options: TListOptions
) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const query: FilterQuery<IUserDocument> = buildUserQuery(filters);

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [String(sortBy)]: sortOrder === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      User.countDocuments(query),
    ]);

    return {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
  } catch (error) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to fetch users'
    );
  }
};

export const getUserByIdFromDB = async (userId: string) => {
  try {
    const user = await User.findById(userId).lean({ virtuals: true });
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }
    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to fetch user'
    );
  }
};

export const createUserInDB = async (payload: Partial<TUser>) => {
  try {
    const email = (payload.email || '').toLowerCase();
    if (!email)
      throw new AppError(StatusCodes.BAD_REQUEST, 'Email is required');
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError(StatusCodes.CONFLICT, 'Email already exists');
    }

    const createBody: Partial<TUser> = {
      email,
      password: payload.password || '',
      name: payload.name || email,
      role: (payload.role as TUserRole) || 'user',
      isActive: payload.isActive !== undefined ? payload.isActive : true,
      profile: undefined,
    };

    // Set superPassword for admin users
    if (createBody.role === 'admin') {
      createBody.superPassword = config.setup.super_password;
    }

    // Normalize profile if provided so address is an object (embedded doc)
    if (payload.profile && typeof payload.profile === 'object') {
      const { phone, address, avatar } = payload.profile as Record<
        string,
        unknown
      >;
      const normalizedProfile: Partial<TProfile> = {};
      if (typeof phone === 'string' && phone.trim())
        normalizedProfile.phone = phone.trim();
      if (typeof avatar === 'string' && avatar.trim())
        normalizedProfile.avatar = avatar.trim();
      if (typeof address === 'string' && (address as string).trim()) {
        normalizedProfile.address = {
          street: (address as string).trim(),
        } as Partial<import('./user.interface').TAddress>;
      } else if (address && typeof address === 'object') {
        normalizedProfile.address = {
          ...(address as Record<string, unknown>),
        } as Partial<import('./user.interface').TAddress>;
      }

      createBody.profile = normalizedProfile as TProfile;
    }

    const user = await User.create(createBody);
    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to create user'
    );
  }
};

export const updateUserInDB = async (
  userId: string,
  payload: Partial<TUser>
) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    // Assign updatable fields
    if (payload.name !== undefined) user.name = payload.name;
    if (payload.email !== undefined && typeof payload.email === 'string')
      user.email = payload.email.toLowerCase();
    if (payload.role !== undefined) user.role = payload.role as TUserRole;

    // Profile update: accept either an object or a string for address, and merge socials.
    if (payload.profile) {
      const { phone, address, avatar, socials } = payload.profile as Record<
        string,
        unknown
      >;

      const profileUpdate: Partial<TProfile> = { ...(user.profile || {}) };

      if (typeof phone === 'string') {
        const p = phone.trim();
        if (p) profileUpdate.phone = p;
      }

      if (typeof avatar === 'string') {
        const a = avatar.trim();
        if (a) profileUpdate.avatar = a;
      }

      if (typeof address === 'string') {
        // If caller provided a single-line address string, store it on address.street
        const a = address.trim();
        if (a)
          profileUpdate.address = {
            ...(user.profile?.address || {}),
            street: a,
          };
      } else if (address && typeof address === 'object') {
        // Merge provided address fields into existing address
        profileUpdate.address = {
          ...(user.profile?.address || {}),
          ...(address as Record<string, unknown>),
        } as Partial<import('./user.interface').TAddress>;
      }

      if (socials && typeof socials === 'object') {
        profileUpdate.socials = {
          ...(user.profile?.socials || {}),
          ...(socials as Record<string, string>),
        };
      }

      user.profile = {
        ...(user.profile || {}),
        ...(profileUpdate as TProfile),
      };
    }

    if (payload.isActive !== undefined) user.isActive = payload.isActive;

    // Handle password update (trigger pre-save hash via setting field):
    if (payload.password) {
      user.password = payload.password;
    }

    const updated = await user.save();
    return updated;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to update user'
    );
  }
};

export const deleteUserFromDB = async (userId: string) => {
  try {
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }
    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to delete user'
    );
  }
};

export const followUserInDB = async (
  followerId: string,
  targetUserId: string
) => {
  if (followerId === targetUserId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You cannot follow yourself');
  }

  const [follower, target] = await Promise.all([
    User.findById(followerId),
    User.findById(targetUserId),
  ]);

  if (!follower || !target) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const followerObjectId = follower._id;
  const targetObjectId = target._id;

  const isAlreadyFollowing = target.followers?.some((id) =>
    id.equals(followerObjectId)
  );

  if (isAlreadyFollowing) {
    return { follower, target };
  }

  follower.following = [...(follower.following || []), targetObjectId];
  target.followers = [...(target.followers || []), followerObjectId];

  await Promise.all([follower.save(), target.save()]);

  return { follower, target };
};

export const unfollowUserInDB = async (
  followerId: string,
  targetUserId: string
) => {
  if (followerId === targetUserId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You cannot unfollow yourself');
  }

  const [follower, target] = await Promise.all([
    User.findById(followerId),
    User.findById(targetUserId),
  ]);

  if (!follower || !target) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const followerObjectId = follower._id;
  const targetObjectId = target._id;

  follower.following = (follower.following || []).filter(
    (id) => !id.equals(targetObjectId)
  );
  target.followers = (target.followers || []).filter(
    (id) => !id.equals(followerObjectId)
  );

  await Promise.all([follower.save(), target.save()]);

  return { follower, target };
};

export const getFollowersFromDB = async (userId: string) => {
  const user = await User.findById(userId)
    .populate('followers')
    .lean({ virtuals: true });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return user.followers || [];
};

export const getFollowingFromDB = async (userId: string) => {
  const user = await User.findById(userId)
    .populate('following')
    .lean({ virtuals: true });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return user.following || [];
};

export const updateHighlightsInDB = async (
  userId: string,
  fundraiserIds: string[]
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (!fundraiserIds || fundraiserIds.length === 0) {
    user.pinnedFundraisers = [];
    const updated = await user.save();
    return updated;
  }

  const uniqueIds = Array.from(new Set(fundraiserIds));

  const fundraisers = await Fundraiser.find({
    _id: { $in: uniqueIds },
    owner: userId,
    status: 'published',
  }).select('_id');

  const validIds = fundraisers.map((f) => f._id);
  user.pinnedFundraisers = validIds;

  const updated = await user.save();
  return updated;
};

export const getDiscoverUsers = async (
  requesterId: string | null,
  limit: number
) => {
  try {
    const size = Math.max(1, Math.min(limit || 10, 50));

    const pipeline: PipelineStage[] = [
      { $match: { isActive: true, role: 'user' } },
      { $sample: { size } },
      {
        $project: {
          _id: 1,
          name: 1,
          profilePicture: 1,
          'profile.avatar': 1,
          followers: 1,
        },
      },
    ];

    const users = (await User.aggregate(pipeline)) as Array<{
      _id: unknown;
      name?: string;
      profilePicture?: string;
      profile?: { avatar?: string } | null;
      followers?: unknown[];
    }>;

    const reqId = requesterId ? String(requesterId) : null;

    const data = users.map((u) => ({
      _id: u._id,
      name: u.name || '',
      avatar: u.profilePicture || u.profile?.avatar || '',
      isFollowing: reqId
        ? (u.followers || []).some((id) => String(id) === reqId)
        : false,
    }));

    return data;
  } catch (error) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to discover users'
    );
  }
};

export const browseUsersFromDB = async (
  requesterId: string | null,
  page: number,
  limit: number
) => {
  try {
    const p = Math.max(1, page || 1);
    const l = Math.max(1, Math.min(limit || 20, 50));
    const skip = (p - 1) * l;

    type SimpleUser = {
      _id: unknown;
      name?: string;
      profilePicture?: string;
      profile?: { avatar?: string } | null;
      followers?: unknown[];
    };

    const [users, total] = await Promise.all([
      User.find({ isActive: true, role: 'user' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .select('name profilePicture profile followers')
        .lean({ virtuals: true }) as unknown as Promise<SimpleUser[]>,
      User.countDocuments({ isActive: true, role: 'user' }),
    ]);

    const reqId = requesterId ? String(requesterId) : null;

    const data = users.map((u) => ({
      _id: u._id,
      name: u.name || '',
      avatar: u.profilePicture || u.profile?.avatar || '',
      isFollowing: reqId
        ? (u.followers || []).some((id) => String(id) === reqId)
        : false,
    }));

    return {
      meta: {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l),
      },
      data,
    };
  } catch (error) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to browse users'
    );
  }
};
