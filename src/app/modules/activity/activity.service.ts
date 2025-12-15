/**
 * @fileoverview Activity service layer.
 *
 * Contains business logic for activity-related operations including
 * creating, retrieving, and managing user activities.
 *
 * @module modules/activity/service
 */

import { Types } from 'mongoose';

import { PaginatedResponse } from '../../interface/common';
import {
  buildPaginationMeta,
  normalizePagination,
  PaginationOptions,
} from '../../utils/pagination';
import {
  buildDateRangeCondition,
  buildFieldSearchCondition,
  isValidObjectId,
  toObjectId,
} from '../../utils/query';
import { Fundraiser } from '../fundraiser/fundraiser.model';
import { User } from '../user/user.model';
import {
  ACTIVITY_FUNDRAISER_POPULATE_FIELDS,
  ACTIVITY_USER_POPULATE_FIELDS,
  DEFAULT_PAGE_SIZE,
} from './activity.constant';
import {
  AdminActivityFilters,
  CreateActivityPayload,
  IActivity,
  IActivityPopulated,
} from './activity.interface';
import { Activity } from './activity.model';

/* -------------------------------------------------------------------------- */
/*                              TYPES                                         */
/* -------------------------------------------------------------------------- */

/**
 * Options for retrieving activities.
 */
interface GetActivitiesOptions extends PaginationOptions {
  /**
   * Admin filters for activity queries.
   */
  filters?: AdminActivityFilters;
}

/**
 * Filter condition type for MongoDB queries.
 */
type FilterCondition = Record<string, unknown>;

/* -------------------------------------------------------------------------- */
/*                              HELPERS                                       */
/* -------------------------------------------------------------------------- */

/**
 * Normalizes pagination options with activity-specific defaults.
 *
 * @param options - Raw pagination options
 * @returns Normalized pagination with page, limit, and skip
 */
const normalizeActivityPagination = (options: PaginationOptions = {}) => {
  return normalizePagination(options, {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });
};

/**
 * Builds the base query for fetching activities with population.
 *
 * @param query - MongoDB filter query
 * @param skip - Number of documents to skip
 * @param limit - Maximum documents to return
 * @returns Mongoose query with population and sorting
 */
const buildActivityQuery = (
  query: FilterCondition,
  skip: number,
  limit: number
) => {
  return Activity.find(query)
    .populate('user', ACTIVITY_USER_POPULATE_FIELDS)
    .populate('fundraiser', ACTIVITY_FUNDRAISER_POPULATE_FIELDS)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

/**
 * Executes a paginated activity query.
 *
 * @param query - MongoDB filter query
 * @param options - Pagination options
 * @returns Paginated response with activities and metadata
 */
const executePaginatedQuery = async (
  query: FilterCondition,
  options: PaginationOptions = {}
): Promise<PaginatedResponse<IActivityPopulated>> => {
  const { page, limit, skip } = normalizeActivityPagination(options);

  const [activities, total] = await Promise.all([
    buildActivityQuery(query, skip, limit),
    Activity.countDocuments(query),
  ]);

  return {
    data: activities as unknown as IActivityPopulated[],
    meta: buildPaginationMeta(total, page, limit),
  };
};

/* -------------------------------------------------------------------------- */
/*                              CREATE                                        */
/* -------------------------------------------------------------------------- */

/**
 * Creates a new activity record.
 *
 * @param payload - Activity creation payload
 * @returns Created activity document
 *
 * @example
 * const activity = await createActivity({
 *   userId: '507f1f77bcf86cd799439011',
 *   type: 'DONATION',
 *   fundraiserId: '507f1f77bcf86cd799439012',
 *   donationAmount: 100,
 *   donationCurrency: 'EUR',
 * });
 */
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

/* -------------------------------------------------------------------------- */
/*                              READ - USER                                   */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves activities for a specific user.
 *
 * Returns only public activities for the specified user.
 *
 * @param userId - User ID to fetch activities for
 * @param options - Pagination options
 * @returns Paginated list of user activities
 */
export const getUserActivities = async (
  userId: string,
  options: GetActivitiesOptions = {}
): Promise<PaginatedResponse<IActivityPopulated>> => {
  const query = {
    user: new Types.ObjectId(userId),
    isPublic: true,
  };

  return executePaginatedQuery(query, options);
};

/**
 * Retrieves public activities for a user profile.
 *
 * Same as getUserActivities but explicitly for public profile views.
 *
 * @param userId - User ID to fetch activities for
 * @param options - Pagination options
 * @returns Paginated list of public user activities
 */
export const getPublicUserActivities = async (
  userId: string,
  options: GetActivitiesOptions = {}
): Promise<PaginatedResponse<IActivityPopulated>> => {
  return getUserActivities(userId, options);
};

/* -------------------------------------------------------------------------- */
/*                              READ - FUNDRAISER                             */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves activities for a specific fundraiser.
 *
 * Returns only public activities associated with the fundraiser.
 *
 * @param fundraiserId - Fundraiser ID to fetch activities for
 * @param options - Pagination options
 * @returns Paginated list of fundraiser activities
 */
export const getFundraiserActivities = async (
  fundraiserId: string,
  options: GetActivitiesOptions = {}
): Promise<PaginatedResponse<IActivityPopulated>> => {
  const query = {
    fundraiser: new Types.ObjectId(fundraiserId),
    isPublic: true,
  };

  return executePaginatedQuery(query, options);
};

/* -------------------------------------------------------------------------- */
/*                              READ - ADMIN                                  */
/* -------------------------------------------------------------------------- */

/**
 * Builds admin activity filter conditions.
 *
 * @param filters - Admin filter options
 * @returns Array of MongoDB filter conditions
 */
const buildAdminFilterConditions = async (
  filters: AdminActivityFilters
): Promise<FilterCondition[]> => {
  const conditions: FilterCondition[] = [];

  // Type filter
  if (filters.type) {
    conditions.push({ type: filters.type });
  }

  // Public visibility filter
  if (typeof filters.isPublic === 'boolean') {
    conditions.push({ isPublic: filters.isPublic });
  }

  // User ID filter
  if (isValidObjectId(filters.userId)) {
    conditions.push({ user: toObjectId(filters.userId) });
  }

  // Fundraiser ID filter
  if (isValidObjectId(filters.fundraiserId)) {
    conditions.push({ fundraiser: toObjectId(filters.fundraiserId) });
  }

  // Reaction type filter
  const reactionCondition = buildFieldSearchCondition(
    filters.reactionType,
    'reactionType'
  );
  if (reactionCondition) {
    conditions.push(reactionCondition);
  }

  // Date range filter
  const dateCondition = buildDateRangeCondition({
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  });
  if (dateCondition) {
    conditions.push(dateCondition);
  }

  // Search term filter (searches users, fundraisers, and reaction types)
  const searchConditions = await buildSearchConditions(filters);
  if (searchConditions) {
    conditions.push(searchConditions);
  }

  return conditions;
};

/**
 * Builds search conditions for admin activity queries.
 *
 * Searches across users, fundraisers, and reaction types.
 *
 * @param filters - Admin filter options
 * @returns MongoDB $or condition or null
 */
const buildSearchConditions = async (
  filters: AdminActivityFilters
): Promise<FilterCondition | null> => {
  const term = filters.searchTerm?.trim();
  if (!term) return null;

  const orConditions: FilterCondition[] = [];

  // Search users by name/email (if not already filtered by userId)
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

    if (users.length) {
      orConditions.push({ user: { $in: users.map((u) => u._id) } });
    }
  }

  // Search fundraisers by title/slug (if not already filtered by fundraiserId)
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

    if (fundraisers.length) {
      orConditions.push({ fundraiser: { $in: fundraisers.map((f) => f._id) } });
    }
  }

  // Search reaction type (if not already filtered)
  if (!filters.reactionType) {
    orConditions.push({ reactionType: { $regex: term, $options: 'i' } });
  }

  return orConditions.length ? { $or: orConditions } : null;
};

/**
 * Retrieves all activities for admin dashboard.
 *
 * Supports advanced filtering, searching, and pagination.
 *
 * @param options - Query options with filters and pagination
 * @returns Paginated list of activities with full details
 *
 * @example
 * const result = await getAllActivities({
 *   page: 1,
 *   limit: 20,
 *   filters: {
 *     type: 'DONATION',
 *     fromDate: '2024-01-01',
 *     searchTerm: 'john',
 *   },
 * });
 */
export const getAllActivities = async (
  options: GetActivitiesOptions = {}
): Promise<PaginatedResponse<IActivityPopulated>> => {
  const { page, limit, skip } = normalizeActivityPagination(options);
  const filters = options.filters || {};

  // Build filter conditions
  const conditions = await buildAdminFilterConditions(filters);
  const query = conditions.length ? { $and: conditions } : {};

  // Execute query with admin-specific population
  const [activities, total] = await Promise.all([
    Activity.find(query)
      .populate('user', ACTIVITY_USER_POPULATE_FIELDS)
      .populate('fundraiser', ACTIVITY_FUNDRAISER_POPULATE_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Activity.countDocuments(query),
  ]);

  return {
    data: activities as unknown as IActivityPopulated[],
    meta: buildPaginationMeta(total, page, limit),
  };
};

/* -------------------------------------------------------------------------- */
/*                              DELETE                                        */
/* -------------------------------------------------------------------------- */

/**
 * Deletes a reaction activity for a user and fundraiser.
 *
 * Used when a user removes their reaction from a fundraiser.
 *
 * @param userId - User ID who created the reaction
 * @param fundraiserId - Fundraiser ID the reaction was on
 */
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

/**
 * Deletes an activity by ID.
 *
 * Admin-only operation for removing activities.
 *
 * @param activityId - Activity ID to delete
 */
export const deleteActivity = async (activityId: string): Promise<void> => {
  await Activity.findByIdAndDelete(activityId);
};
