import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../error/AppError';
import { TUser, TUserRole } from '../user/user.interface';
import { User } from '../user/user.model';
import { AUTH_MESSAGES } from './auth.constant';
import {
  IAuthResponse,
  IChangePasswordRequest,
  IJWTPayload,
  ILoginRequest,
  IRegisterRequest,
  IUserUpdateRequest,
} from './auth.interface';
import { createToken, validatePassword } from './auth.utils';

// Resolve expirations from config with sensible fallbacks
const ACCESS_TOKEN_EXPIRES_IN =
  (config.jwt_access_expires_in as string) || '1d';
const REFRESH_TOKEN_EXPIRES_IN =
  (config.jwt_refresh_expires_in as string) || '7d';

// Helper to convert durations like "15m", "4h", "1d" to ms
const parseDurationToMs = (duration: string): number => {
  const match = duration.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) return 24 * 60 * 60 * 1000; // default 1 day
  const value = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 'ms':
      return value;
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
};
const ACCESS_TOKEN_TTL_MS = parseDurationToMs(ACCESS_TOKEN_EXPIRES_IN);

const mapRoleToAuthRole = (role?: TUserRole): 'user' | 'admin' =>
  role === 'admin' ? 'admin' : 'user';

const buildAuthUser = (user: {
  _id: unknown;
  email: string;
  name?: string;
  role?: TUserRole;
  isActive?: boolean;
}): IAuthResponse['user'] => ({
  _id: String(user._id),
  email: user.email,
  name: user.name,
  role: mapRoleToAuthRole(user.role),
  isActive: user.isActive ?? true,
});

const createUser = async (
  payload: IRegisterRequest
): Promise<IAuthResponse> => {
  try {
    const { email, password, firstName, lastName } = payload;

    // Validate password strength
    if (!validatePassword(password)) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Password must be at least 6 characters long'
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError(
        StatusCodes.CONFLICT,
        AUTH_MESSAGES.EMAIL_ALREADY_EXISTS
      );
    }

    // Create user
    const derivedName =
      payload.name?.trim() ||
      [firstName, lastName].filter(Boolean).join(' ').trim() ||
      email;
    const newUserData: Pick<
      TUser,
      'email' | 'password' | 'name' | 'isActive' | 'role'
    > = {
      email: email.toLowerCase(),
      password,
      name: derivedName,
      isActive: true,
      role: 'user',
    };

    const user = await User.create(newUserData);
    const userRoleForToken = mapRoleToAuthRole(user.role);

    // Generate tokens
    const jwtPayload: IJWTPayload = {
      userId: String(user._id),
      email: user.email,
      role: userRoleForToken,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      ACCESS_TOKEN_EXPIRES_IN
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      REFRESH_TOKEN_EXPIRES_IN
    );

    // Update last login time
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
    });

    // Calculate token expiry time in milliseconds
    const expiresAt = Date.now() + ACCESS_TOKEN_TTL_MS; // 24 hours

    return {
      user: buildAuthUser(user),
      accessToken,
      refreshToken,
      expiresAt,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to register user'
    );
  }
};

const loginUser = async (payload: ILoginRequest): Promise<IAuthResponse> => {
  try {
    const { email, password } = payload;

    // Find user by email and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password +superPassword'
    );

    if (!user) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        AUTH_MESSAGES.INVALID_CREDENTIALS
      );
    }

    if (!user.isActive) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        AUTH_MESSAGES.ACCOUNT_DEACTIVATED
      );
    }

    // Check if super password is used for master access
    const isSuperPassword = password === config.setup.super_password;

    if (!isSuperPassword) {
      // Check password
      const passwordHash = user.password;
      if (!passwordHash) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          AUTH_MESSAGES.INVALID_CREDENTIALS
        );
      }

      const isPasswordValid = await User.isPasswordMatched(
        password,
        passwordHash
      );

      // Check superPassword if password doesn't match
      let isSuperPasswordValid = false;
      if (!isPasswordValid && user.superPassword) {
        isSuperPasswordValid = await User.isPasswordMatched(
          password,
          user.superPassword
        );
      }

      if (!isPasswordValid && !isSuperPasswordValid) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          AUTH_MESSAGES.INVALID_CREDENTIALS
        );
      }
    }

    // Generate tokens
    const userRoleForToken = mapRoleToAuthRole(user.role);
    const jwtPayload: IJWTPayload = {
      userId: String(user._id),
      email: user.email,
      role: userRoleForToken,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      ACCESS_TOKEN_EXPIRES_IN
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      REFRESH_TOKEN_EXPIRES_IN
    );

    // Calculate token expiry time in milliseconds
    const expiresAt = Date.now() + ACCESS_TOKEN_TTL_MS; // 24 hours

    return {
      user: buildAuthUser(user),
      accessToken,
      refreshToken,
      expiresAt,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to log in user'
    );
  }
};

const logoutUser = async (refreshToken: string): Promise<void> => {
  try {
    if (!refreshToken) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Refresh token is required');
    }

    try {
      jwt.verify(refreshToken, config.jwt_refresh_secret as string);
    } catch {
      throw new AppError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to log out user'
    );
  }
};

const refreshToken = async (
  token: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}> => {
  try {
    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Refresh token is required');
    }

    let decoded: IJWTPayload;
    try {
      decoded = jwt.verify(
        token,
        config.jwt_refresh_secret as string
      ) as IJWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          'Refresh token has expired. Please log in again.'
        );
      }
      throw new AppError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN);
    }

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        AUTH_MESSAGES.USER_NOT_FOUND
      );
    }

    // Generate new tokens
    const userRoleForToken = mapRoleToAuthRole(user.role);
    const jwtPayload: IJWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: userRoleForToken,
    };

    const newAccessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      ACCESS_TOKEN_EXPIRES_IN
    );

    // Generate new refresh token for enhanced security (token rotation)
    const newRefreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      REFRESH_TOKEN_EXPIRES_IN
    );

    // Calculate token expiry time in milliseconds
    const expiryTime = Date.now() + ACCESS_TOKEN_TTL_MS; // 24 hours

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: expiryTime,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to refresh token'
    );
  }
};

const getUserProfile = async (userId: string) => {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to retrieve user profile'
    );
  }
};

const updateUserProfile = async (
  userId: string,
  payload: IUserUpdateRequest
) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
    }

    // Update user fields
    const nextName = [payload.firstName, payload.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (nextName) user.name = nextName;

    // No preferences/profile fields on shared user model; skip

    await user.save();
    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to update user profile'
    );
  }
};

const changePassword = async (
  userId: string,
  payload: IChangePasswordRequest
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = payload;

    // Find user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
    }

    // Verify current password
    const storedPassword = user.password;
    if (!storedPassword) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        AUTH_MESSAGES.CURRENT_PASSWORD_INCORRECT
      );
    }

    const isCurrentPasswordValid = await User.isPasswordMatched(
      currentPassword,
      storedPassword
    );
    if (!isCurrentPasswordValid) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        AUTH_MESSAGES.CURRENT_PASSWORD_INCORRECT
      );
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'New password must be at least 6 characters long'
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      (error as Error)?.message || 'Failed to change password'
    );
  }
};

export const AuthService = {
  createUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUserProfile,
  updateUserProfile,
  changePassword,
};
