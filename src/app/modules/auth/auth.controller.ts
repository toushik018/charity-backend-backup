import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';
import AppError from '../../error/AppError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AUTH_MESSAGES } from './auth.constant';
import { AuthRequest } from './auth.interface';
import { AuthService } from './auth.service';

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.createUser(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: AUTH_MESSAGES.REGISTRATION_SUCCESS,
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt,
    },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  const { refreshToken, accessToken, user, expiresAt } = result;

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    domain: config.cookie_domain || 'localhost',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: AUTH_MESSAGES.LOGIN_SUCCESS,
    data: {
      accessToken,
      refreshToken,
      expiresAt,
      user,
    },
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  await AuthService.logoutUser(refreshToken);

  res.clearCookie('refreshToken', {
    domain: config.cookie_domain || 'localhost',
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: AUTH_MESSAGES.LOGOUT_SUCCESS,
    data: null,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  // Try to get refresh token from cookie first, then from body
  const refreshTokenValue = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshTokenValue) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Refresh token is required');
  }

  const result = await AuthService.refreshToken(refreshTokenValue);

  // Set new refresh token as cookie if we got one
  if (result.refreshToken) {
    res.cookie('refreshToken', result.refreshToken, {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      domain: config.cookie_domain || 'localhost',
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: AUTH_MESSAGES.TOKEN_REFRESH_SUCCESS,
    data: {
      accessToken: result.accessToken,
      ...(result.refreshToken && { refreshToken: result.refreshToken }),
      expiresAt: result.expiresAt,
    },
  });
});

const verifyToken = catchAsync(async (req: AuthRequest, res: Response) => {
  // If we reach here, the token is valid (auth middleware passed)
  const user = req.user!;

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
      expiresAt: user.exp ? new Date(user.exp * 1000).toISOString() : null,
    },
  });
});

const getProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const result = await AuthService.getUserProfile(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const result = await AuthService.updateUserProfile(userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: AUTH_MESSAGES.PROFILE_UPDATE_SUCCESS,
    data: result,
  });
});

const changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  await AuthService.changePassword(userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: AUTH_MESSAGES.PASSWORD_CHANGE_SUCCESS,
    data: null,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  verifyToken,
  getProfile,
  updateProfile,
  changePassword,
};
