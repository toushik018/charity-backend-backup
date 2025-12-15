/**
 * @fileoverview Authentication module type definitions.
 *
 * Defines TypeScript interfaces and types for the authentication module,
 * including JWT payloads, user types, and request/response structures.
 *
 * @module modules/auth/interface
 */

import { Request } from 'express';
import { Document } from 'mongoose';

/* -------------------------------------------------------------------------- */
/*                              BASE TYPES                                    */
/* -------------------------------------------------------------------------- */

/**
 * Base document interface with common fields.
 *
 * @extends Document
 */
export interface IBaseDocument extends Document {
  /**
   * Unique identifier.
   */
  _id: string;

  /**
   * Creation timestamp.
   */
  createdAt: Date;

  /**
   * Last update timestamp.
   */
  updatedAt: Date;
}

/* -------------------------------------------------------------------------- */
/*                              JWT TYPES                                     */
/* -------------------------------------------------------------------------- */

/**
 * JWT payload structure.
 *
 * Contains user information encoded in access/refresh tokens.
 */
export interface IJWTPayload {
  /**
   * User's unique identifier.
   */
  userId: string;

  /**
   * User's email address.
   */
  email: string;

  /**
   * User's role (user or admin).
   */
  role: string;

  /**
   * User's username (derived from email).
   */
  username?: string;

  /**
   * Token issued at timestamp (seconds since epoch).
   */
  iat?: number;

  /**
   * Token expiration timestamp (seconds since epoch).
   */
  exp?: number;
}

/* -------------------------------------------------------------------------- */
/*                              SOCIAL TYPES                                  */
/* -------------------------------------------------------------------------- */

/**
 * Supported social platforms.
 */
export type TSocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'linkedin';

/**
 * Social account connection details.
 */
export interface ISocialAccount {
  /**
   * Social platform identifier.
   */
  platform: TSocialPlatform;

  /**
   * Account ID on the platform.
   */
  accountId: string;

  /**
   * Display name on the platform.
   */
  accountName: string;

  /**
   * OAuth access token.
   */
  accessToken: string;

  /**
   * OAuth refresh token.
   */
  refreshToken?: string;

  /**
   * Token expiration date.
   */
  expiresAt?: Date;

  /**
   * Whether the connection is active.
   */
  isActive: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              USER TYPES                                    */
/* -------------------------------------------------------------------------- */

/**
 * User role type.
 */
export type TAuthUserRole = 'user' | 'admin';

/**
 * User notification preferences.
 */
export interface INotificationPreferences {
  /**
   * Email notification enabled.
   */
  email: boolean;

  /**
   * Push notification enabled.
   */
  push: boolean;
}

/**
 * User preferences structure.
 */
export interface IUserPreferences {
  /**
   * User's timezone.
   */
  timezone?: string;

  /**
   * Preferred language.
   */
  language?: string;

  /**
   * UI theme preference.
   */
  theme?: string;

  /**
   * Notification settings.
   */
  notifications: INotificationPreferences;
}

/**
 * Auth user document interface.
 *
 * @extends IBaseDocument
 */
export interface IUser extends IBaseDocument {
  /**
   * User's email address (unique).
   */
  email: string;

  /**
   * Hashed password.
   */
  password: string;

  /**
   * User's first name.
   */
  firstName?: string;

  /**
   * User's last name.
   */
  lastName?: string;

  /**
   * Profile picture URL.
   */
  profilePicture?: string;

  /**
   * User biography.
   */
  bio?: string;

  /**
   * Personal website URL.
   */
  website?: string;

  /**
   * User's location.
   */
  location?: string;

  /**
   * Whether email is verified.
   */
  isEmailVerified: boolean;

  /**
   * Whether account is active.
   */
  isActive: boolean;

  /**
   * User's role.
   */
  role: TAuthUserRole;

  /**
   * Last login timestamp.
   */
  lastLogin?: Date;

  /**
   * Last logout timestamp.
   */
  lastLogout?: Date;

  /**
   * Password last changed timestamp.
   */
  passwordChangedAt?: Date;

  /**
   * User preferences.
   */
  preferences: IUserPreferences;

  /**
   * Compares a plain password with the stored hash.
   *
   * @param _password - Plain text password to compare
   * @returns True if passwords match
   */
  comparePassword(_password: string): Promise<boolean>;

  /**
   * Virtual username derived from email.
   */
  username?: string;

  /**
   * Virtual full name.
   */
  name?: string;
}

/* -------------------------------------------------------------------------- */
/*                              REQUEST TYPES                                 */
/* -------------------------------------------------------------------------- */

/**
 * Login request payload.
 */
export interface ILoginRequest {
  /**
   * User's email address.
   */
  email: string;

  /**
   * User's password.
   */
  password: string;
}

/**
 * Registration request payload.
 */
export interface IRegisterRequest {
  /**
   * User's email address.
   */
  email: string;

  /**
   * User's password.
   */
  password: string;

  /**
   * User's role.
   */
  role: TAuthUserRole;

  /**
   * Display name.
   */
  name?: string;

  /**
   * First name.
   */
  firstName?: string;

  /**
   * Last name.
   */
  lastName?: string;
}

/**
 * Change password request payload.
 */
export interface IChangePasswordRequest {
  /**
   * Current password for verification.
   */
  currentPassword: string;

  /**
   * New password to set.
   */
  newPassword: string;
}

/**
 * User profile update request payload.
 */
export interface IUserUpdateRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  coverImage?: string;
  bio?: string;
  website?: string;
  location?: string;
  preferences?: Partial<IUserPreferences>;
}

/**
 * Social account connection request payload.
 */
export interface ISocialAccountRequest {
  platform: TSocialPlatform;
  accountId: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

/* -------------------------------------------------------------------------- */
/*                              RESPONSE TYPES                                */
/* -------------------------------------------------------------------------- */

/**
 * Authentication response structure.
 *
 * Returned after successful login or registration.
 */
export interface IAuthResponse {
  /**
   * User data (excluding sensitive fields).
   */
  user: Partial<Omit<IUser, 'password' | 'comparePassword'>>;

  /**
   * JWT access token.
   */
  accessToken: string;

  /**
   * JWT refresh token.
   */
  refreshToken?: string;

  /**
   * Token expiration timestamp.
   */
  expiresAt: number;
}

/* -------------------------------------------------------------------------- */
/*                              EXPRESS TYPES                                 */
/* -------------------------------------------------------------------------- */

/**
 * Authenticated Express request.
 *
 * Extends the standard Express Request with user information
 * attached by the auth middleware.
 *
 * @extends Request
 */
export interface AuthRequest extends Request {
  /**
   * Authenticated user's JWT payload.
   */
  user?: IJWTPayload;
}
