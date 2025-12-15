/**
 * @fileoverview Authentication validation schemas using Zod.
 *
 * Provides request validation for all authentication-related API endpoints,
 * ensuring data integrity and type safety for user registration, login,
 * profile updates, and social authentication.
 *
 * @module modules/auth/validation
 */

import { z } from 'zod';

import { zOptionalDatetime } from '../../utils/zod';

/* -------------------------------------------------------------------------- */
/*                              SHARED ENUMS                                  */
/* -------------------------------------------------------------------------- */

/**
 * User role enum values.
 */
const userRoleEnum = z.enum(['admin', 'user'], {
  required_error: 'Role is required',
  invalid_type_error: 'Role must be either admin or user',
});

/**
 * Social platform enum values.
 */
const socialPlatformEnum = z.enum(
  ['facebook', 'instagram', 'twitter', 'linkedin'],
  { required_error: 'Platform is required' }
);

/* -------------------------------------------------------------------------- */
/*                           SHARED FIELD SCHEMAS                             */
/* -------------------------------------------------------------------------- */

/**
 * Email field schema with required error.
 */
const emailField = z
  .string({ required_error: 'Email is required' })
  .email('Please provide a valid email address');

/**
 * Password field schema with required error and minimum length.
 */
const passwordField = z
  .string({ required_error: 'Password is required' })
  .min(6, 'Password must be at least 6 characters');

/**
 * Name field schema with length constraints.
 */
const nameField = z
  .string()
  .min(1, 'Name cannot be empty')
  .max(100, 'Name cannot exceed 100 characters')
  .optional();

/**
 * First name field schema with length constraints.
 */
const firstNameField = z
  .string()
  .min(1, 'First name cannot be empty')
  .max(50, 'First name cannot exceed 50 characters')
  .optional();

/**
 * Last name field schema with length constraints.
 */
const lastNameField = z
  .string()
  .min(1, 'Last name cannot be empty')
  .max(50, 'Last name cannot exceed 50 characters')
  .optional();

/* -------------------------------------------------------------------------- */
/*                              REGISTER                                      */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for user registration.
 *
 * Required fields:
 * - email: Valid email address
 * - password: Minimum 6 characters
 *
 * Optional fields:
 * - role: User role (defaults to 'user')
 * - name: Display name
 * - firstName: First name
 * - lastName: Last name
 */
const registerValidationSchema = z.object({
  body: z.object({
    email: emailField,
    password: passwordField,
    role: userRoleEnum.optional(),
    name: nameField,
    firstName: firstNameField,
    lastName: lastNameField,
  }),
});

/* -------------------------------------------------------------------------- */
/*                                LOGIN                                       */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for user login.
 *
 * Required fields:
 * - email: Valid email address
 * - password: User's password
 */
const loginValidationSchema = z.object({
  body: z.object({
    email: emailField,
    password: z.string({ required_error: 'Password is required' }),
  }),
});

/* -------------------------------------------------------------------------- */
/*                           UPDATE PROFILE                                   */
/* -------------------------------------------------------------------------- */

/**
 * Notification preferences schema.
 */
const notificationPreferencesSchema = z
  .object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
  })
  .optional();

/**
 * User preferences schema.
 */
const preferencesSchema = z
  .object({
    timezone: z.string().optional(),
    language: z.string().optional(),
    notifications: notificationPreferencesSchema,
  })
  .optional();

/**
 * Validation schema for updating user profile.
 *
 * All fields are optional to support partial updates.
 *
 * Updatable fields:
 * - name, firstName, lastName: Name fields
 * - profilePicture, coverImage: Image URLs
 * - bio: User biography (max 500 chars)
 * - website: Personal website URL
 * - location: User location
 * - preferences: Timezone, language, notification settings
 */
const updateProfileValidationSchema = z.object({
  body: z.object({
    name: nameField,
    firstName: firstNameField,
    lastName: lastNameField,
    profilePicture: z.string().url('Invalid profile picture URL').optional(),
    coverImage: z.string().url('Invalid cover image URL').optional(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
    website: z
      .string()
      .max(200, 'Website URL cannot exceed 200 characters')
      .optional(),
    location: z
      .string()
      .max(100, 'Location cannot exceed 100 characters')
      .optional(),
    preferences: preferencesSchema,
  }),
});

/* -------------------------------------------------------------------------- */
/*                          CHANGE PASSWORD                                   */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for changing user password.
 *
 * Required fields:
 * - currentPassword: User's current password for verification
 * - newPassword: New password (minimum 6 characters)
 */
const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: 'Current password is required',
    }),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'New password must be at least 6 characters'),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          SOCIAL ACCOUNT                                    */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for linking a social media account.
 *
 * Required fields:
 * - platform: Social platform (facebook, instagram, twitter, linkedin)
 * - accountId: Platform-specific account ID
 * - accountName: Display name on the platform
 * - accessToken: OAuth access token
 *
 * Optional fields:
 * - refreshToken: OAuth refresh token
 * - expiresAt: Token expiration datetime
 */
const socialAccountValidationSchema = z.object({
  body: z.object({
    platform: socialPlatformEnum,
    accountId: z.string({ required_error: 'Account ID is required' }),
    accountName: z.string({ required_error: 'Account name is required' }),
    accessToken: z.string({ required_error: 'Access token is required' }),
    refreshToken: z.string().optional(),
    expiresAt: zOptionalDatetime(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                           SOCIAL LOGIN                                     */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for social login (OAuth callback).
 *
 * Required fields:
 * - email: Email from social provider
 *
 * Optional fields:
 * - name: Display name from social provider
 * - image: Profile image URL from social provider
 */
const socialLoginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email'),
    name: z.string().optional(),
    image: z.string().url().optional(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                              EXPORTS                                       */
/* -------------------------------------------------------------------------- */

/**
 * Grouped export of all authentication validation schemas.
 *
 * Provides a convenient namespace for importing all schemas at once.
 */
export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  updateProfileValidationSchema,
  changePasswordValidationSchema,
  socialAccountValidationSchema,
  socialLoginValidationSchema,
};
