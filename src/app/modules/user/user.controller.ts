import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../error/AppError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../auth/auth.interface';
import { TUserRole } from './user.interface';
import {
  browseUsersFromDB,
  createUserInDB,
  deleteUserFromDB,
  followUserInDB,
  getAllUsersFromDB,
  getDiscoverUsers,
  getFollowersFromDB,
  getFollowingFromDB,
  getPublicUserProfileFromDB,
  getUserByIdFromDB,
  unfollowUserInDB,
  updateHighlightsInDB,
  updateUserInDB,
} from './user.service';
import { TUserFilters } from './user.utils';

export const getAllUsers = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const requester = req.user;

    if (!requester || requester.role !== 'admin') {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'Only admins can view all users'
      );
    }

    const { searchTerm, role, isActive, page, limit, sortBy, sortOrder } =
      req.query as Record<string, string>;

    const allowedRoles = ['user', 'admin'] as const;
    const isUserRole = (val: unknown): val is TUserRole =>
      typeof val === 'string' &&
      (allowedRoles as readonly string[]).includes(val);
    const roleFilter = isUserRole(role) ? role : undefined;

    const filters: TUserFilters = {
      searchTerm,
      role: roleFilter,
      isActive:
        typeof isActive !== 'undefined' ? isActive === 'true' : undefined,
    };

    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    };

    const result = await getAllUsersFromDB(filters, options);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Users retrieved successfully',
      meta: result.meta,
      data: result.data,
    });
  }
);

export const getSingleUser = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const result = await getUserByIdFromDB(userId);
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User retrieved successfully',
      data: result,
    });
  }
);

export const updateUser = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const requester = req.user;

    if (!requester || requester.role !== 'admin') {
      throw new AppError(StatusCodes.FORBIDDEN, 'Only admins can update users');
    }

    const { userId } = req.params;
    const payload = req.body;
    const result = await updateUserInDB(userId, payload);
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User updated successfully',
      data: result,
    });
  }
);

export const createUser = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const requester = req.user;

    if (!requester || requester.role !== 'admin') {
      throw new AppError(StatusCodes.FORBIDDEN, 'Only admins can create users');
    }

    const payload = req.body;
    const user = await createUserInDB(payload);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'User created successfully',
      data: user,
    });
  }
);

export const updateMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const requester = req.user;

  if (!requester) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Authenticated user is required'
    );
  }

  const userId = requester.userId;
  const payload = req.body as Partial<{
    name: string;
    profile: {
      phone?: string;
      address?: string;
      avatar?: string;
      socials?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        website?: string;
      };
    };
  }>;

  // Only allow limited fields
  const safePayload: Record<string, unknown> = {};
  if (typeof payload.name === 'string') safePayload.name = payload.name;
  if (payload.profile && typeof payload.profile === 'object') {
    safePayload.profile = {
      ...(typeof payload.profile.phone === 'string'
        ? { phone: payload.profile.phone }
        : {}),
      ...(typeof payload.profile.address === 'string'
        ? { address: payload.profile.address }
        : {}),
      ...(typeof payload.profile.avatar === 'string'
        ? { avatar: payload.profile.avatar }
        : {}),
      ...(payload.profile.socials && typeof payload.profile.socials === 'object'
        ? { socials: payload.profile.socials }
        : {}),
    };
  }

  const result = await updateUserInDB(userId, safePayload);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

export const deleteUser = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const requester = req.user;

    if (!requester || requester.role !== 'admin') {
      throw new AppError(StatusCodes.FORBIDDEN, 'Only admins can delete users');
    }

    const { userId } = req.params;
    const result = await deleteUserFromDB(userId);
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User deleted successfully',
      data: {},
    });
  }
);

const followUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const requester = req.user;

  if (!requester) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Authenticated user is required'
    );
  }

  const { userId } = req.params;
  const result = await followUserInDB(requester.userId, userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User followed successfully',
    data: {
      followerId: result.follower._id,
      targetUserId: result.target._id,
    },
  });
});

const unfollowUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const requester = req.user;

  if (!requester) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Authenticated user is required'
    );
  }

  const { userId } = req.params;
  const result = await unfollowUserInDB(requester.userId, userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User unfollowed successfully',
    data: {
      followerId: result.follower._id,
      targetUserId: result.target._id,
    },
  });
});

const getFollowers = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const followers = await getFollowersFromDB(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Followers retrieved successfully',
    data: followers,
  });
});

const getFollowing = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const following = await getFollowingFromDB(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Following retrieved successfully',
    data: following,
  });
});

const updateMyHighlights = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const requester = req.user;

    if (!requester) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        'Authenticated user is required'
      );
    }

    const { fundraiserIds } = req.body as {
      fundraiserIds?: string[];
    };

    const updatedUser = await updateHighlightsInDB(
      requester.userId,
      fundraiserIds || []
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Highlights updated successfully',
      data: updatedUser.pinnedFundraisers || [],
    });
  }
);

const getPublicProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const result = await getPublicUserProfileFromDB(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Public profile retrieved successfully',
    data: result,
  });
});

export const UserController = {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateMe,
  deleteUser,
  createUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  updateMyHighlights,
  getPublicProfile,
  discoverUsers: catchAsync(async (req: AuthRequest, res: Response) => {
    const requester = req.user;
    const limitParam = (req.query?.limit as string) || '';
    const limit = Number(limitParam) || 10;
    const data = await getDiscoverUsers(
      requester ? requester.userId : null,
      limit
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Users discovered successfully',
      data,
    });
  }),
  browseUsers: catchAsync(async (req: AuthRequest, res: Response) => {
    const requester = req.user;
    const page = (req.query?.page ? Number(req.query.page as string) : 1) || 1;
    const limit =
      (req.query?.limit ? Number(req.query.limit as string) : 20) || 20;
    const result = await browseUsersFromDB(
      requester ? requester.userId : null,
      page,
      limit
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Users retrieved successfully',
      meta: result.meta,
      data: result.data,
    });
  }),
};
