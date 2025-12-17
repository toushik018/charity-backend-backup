/**
 * @fileoverview User module type definitions.
 *
 * Defines TypeScript interfaces and types for the user module,
 * including user roles, profiles, addresses, and social links.
 *
 * @module modules/user/interface
 */

import type { Types } from 'mongoose';

/* -------------------------------------------------------------------------- */
/*                              ROLE TYPES                                    */
/* -------------------------------------------------------------------------- */

/**
 * User role type.
 *
 * Defines the possible roles a user can have in the system.
 *
 * @property user - Regular user with standard permissions
 * @property admin - Administrator with elevated permissions
 */
export type TUserRole = 'user' | 'admin';

/**
 * Array of valid user roles for validation.
 */
export const USER_ROLES: TUserRole[] = ['user', 'admin'];

/* -------------------------------------------------------------------------- */
/*                              ADDRESS TYPES                                 */
/* -------------------------------------------------------------------------- */

/**
 * User address structure.
 *
 * Represents a physical address with standard components.
 */
export type TAddress = {
  /**
   * Street address (line 1).
   */
  street?: string;

  /**
   * City name.
   */
  city?: string;

  /**
   * State or province.
   */
  state?: string;

  /**
   * Postal/ZIP code.
   */
  zipCode?: string;

  /**
   * Country name or code.
   */
  country?: string;
};

/* -------------------------------------------------------------------------- */
/*                              SOCIAL TYPES                                  */
/* -------------------------------------------------------------------------- */

/**
 * Social media links structure.
 *
 * Contains URLs to user's social media profiles.
 */
export type TSocials = {
  /**
   * Facebook profile URL.
   */
  facebook?: string;

  /**
   * Twitter/X profile URL.
   */
  twitter?: string;

  /**
   * Instagram profile URL.
   */
  instagram?: string;

  /**
   * LinkedIn profile URL.
   */
  linkedin?: string;

  /**
   * Personal website URL.
   */
  website?: string;
};

/* -------------------------------------------------------------------------- */
/*                              PROFILE TYPES                                 */
/* -------------------------------------------------------------------------- */

/**
 * User profile structure.
 *
 * Contains extended user information beyond basic account details.
 */
export type TProfile = {
  /**
   * Phone number.
   */
  phone?: string;

  /**
   * Avatar image URL.
   */
  avatar?: string;

  /**
   * Physical address.
   */
  address?: TAddress;

  /**
   * Social media links.
   */
  socials?: TSocials;
};

/* -------------------------------------------------------------------------- */
/*                              USER TYPES                                    */
/* -------------------------------------------------------------------------- */

/**
 * Base user type.
 *
 * Represents the core user data structure used throughout the application.
 */
export type TUser = {
  /**
   * User's display name.
   */
  name: string;

  /**
   * User's email address (unique identifier).
   */
  email: string;

  /**
   * Hashed password (never exposed in responses).
   */
  password: string;

  /**
   * Super password for admin operations (never exposed).
   */
  superPassword?: string;

  /**
   * User's role in the system.
   * @default 'user'
   */
  role?: TUserRole;

  /**
   * Extended profile information.
   */
  profile?: TProfile;

  /**
   * Profile picture URL.
   */
  profilePicture?: string;

  /**
   * User biography/description.
   */
  bio?: string;

  /**
   * Cover/banner image URL.
   */
  coverImage?: string;

  /**
   * Whether the user account is active.
   * @default true
   */
  isActive?: boolean;

  /**
   * Account creation timestamp.
   */
  createdAt?: Date;

  /**
   * Last update timestamp.
   */
  updatedAt?: Date;

  /**
   * Array of user IDs following this user.
   */
  followers?: Types.ObjectId[];

  /**
   * Array of user IDs this user is following.
   */
  following?: Types.ObjectId[];

  /**
   * Array of fundraiser IDs pinned to profile.
   */
  pinnedFundraisers?: Types.ObjectId[];
};

/* -------------------------------------------------------------------------- */
/*                              FILTER TYPES                                  */
/* -------------------------------------------------------------------------- */

/**
 * Filter options for user list queries.
 */
export interface TUserFilters {
  /**
   * Search term for name, email, or phone.
   */
  searchTerm?: string;

  /**
   * Filter by user role.
   */
  role?: TUserRole;

  /**
   * Filter by active status.
   */
  isActive?: boolean;
}
