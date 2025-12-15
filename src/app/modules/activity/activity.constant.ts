/**
 * @fileoverview Activity module constants.
 *
 * Centralized constants for the activity module including activity types,
 * display messages, and pagination defaults.
 *
 * @module modules/activity/constant
 */

/* -------------------------------------------------------------------------- */
/*                              ACTIVITY TYPES                                */
/* -------------------------------------------------------------------------- */

/**
 * Activity type constants.
 *
 * Defines all possible activity types that can be recorded in the system.
 *
 * @property DONATION - User made a donation to a fundraiser
 * @property REACTION - User reacted to a fundraiser
 * @property FUNDRAISER_CREATED - User created a new fundraiser
 * @property SHARE - User shared a fundraiser
 */
export const ACTIVITY_TYPES = {
  DONATION: 'DONATION',
  REACTION: 'REACTION',
  FUNDRAISER_CREATED: 'FUNDRAISER_CREATED',
  SHARE: 'SHARE',
} as const;

/**
 * Type representing valid activity type values.
 */
export type ActivityType = (typeof ACTIVITY_TYPES)[keyof typeof ACTIVITY_TYPES];

/**
 * Array of all activity type values for validation.
 */
export const ACTIVITY_TYPE_VALUES = Object.values(ACTIVITY_TYPES);

/* -------------------------------------------------------------------------- */
/*                              DISPLAY MESSAGES                              */
/* -------------------------------------------------------------------------- */

/**
 * Human-readable messages for each activity type.
 *
 * Used for generating activity feed descriptions.
 *
 * @example
 * // "John donated to Save the Rainforest"
 * `${userName} ${ACTIVITY_MESSAGES.DONATION} ${fundraiserTitle}`
 */
export const ACTIVITY_MESSAGES = {
  DONATION: 'donated to',
  REACTION: 'reacted to',
  FUNDRAISER_CREATED: 'created a fundraiser',
  SHARE: 'shared',
} as const;

/* -------------------------------------------------------------------------- */
/*                              PAGINATION                                    */
/* -------------------------------------------------------------------------- */

/**
 * Default number of activities per page.
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Maximum number of activities per page.
 */
export const MAX_PAGE_SIZE = 50;

/* -------------------------------------------------------------------------- */
/*                              POPULATE FIELDS                               */
/* -------------------------------------------------------------------------- */

/**
 * Fields to populate for user reference in activities.
 */
export const ACTIVITY_USER_POPULATE_FIELDS = 'name email profilePicture';

/**
 * Fields to populate for fundraiser reference in activities.
 */
export const ACTIVITY_FUNDRAISER_POPULATE_FIELDS = 'title slug coverImage';
