/**
 * @fileoverview Shared query building utilities.
 *
 * Centralized query helpers used across all backend services to build
 * MongoDB filter queries consistently and reduce code duplication.
 *
 * @module app/utils/query
 */

import { Types } from 'mongoose';

/* -------------------------------------------------------------------------- */
/*                              TYPES                                         */
/* -------------------------------------------------------------------------- */

/**
 * Generic filter condition for MongoDB queries.
 */
export type FilterCondition = Record<string, unknown>;

/**
 * Date range filter options.
 *
 * @property fromDate - Start date (inclusive)
 * @property toDate - End date (inclusive)
 */
export interface DateRangeFilter {
  fromDate?: string | Date;
  toDate?: string | Date;
}

/**
 * Amount range filter options.
 *
 * @property minAmount - Minimum amount (inclusive)
 * @property maxAmount - Maximum amount (inclusive)
 */
export interface AmountRangeFilter {
  minAmount?: string | number;
  maxAmount?: string | number;
}

/* -------------------------------------------------------------------------- */
/*                           OBJECT ID HELPERS                                */
/* -------------------------------------------------------------------------- */

/**
 * Checks if a string is a valid MongoDB ObjectId.
 *
 * @param id - String to validate
 * @returns True if valid ObjectId format
 *
 * @example
 * isValidObjectId('507f1f77bcf86cd799439011') // true
 * isValidObjectId('invalid') // false
 */
export const isValidObjectId = (id: string | undefined | null): boolean => {
  if (!id) return false;
  return Types.ObjectId.isValid(id);
};

/**
 * Converts a string to MongoDB ObjectId if valid.
 *
 * @param id - String to convert
 * @returns ObjectId or null if invalid
 *
 * @example
 * toObjectId('507f1f77bcf86cd799439011') // ObjectId
 * toObjectId('invalid') // null
 */
export const toObjectId = (
  id: string | undefined | null
): Types.ObjectId | null => {
  if (!isValidObjectId(id)) return null;
  return new Types.ObjectId(id!);
};

/**
 * Converts a string to MongoDB ObjectId, throwing if invalid.
 *
 * @param id - String to convert
 * @param fieldName - Field name for error message
 * @returns ObjectId
 * @throws Error if invalid ObjectId
 *
 * @example
 * toObjectIdOrThrow('507f1f77bcf86cd799439011', 'userId') // ObjectId
 * toObjectIdOrThrow('invalid', 'userId') // throws Error
 */
export const toObjectIdOrThrow = (
  id: string,
  fieldName = 'id'
): Types.ObjectId => {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  return new Types.ObjectId(id);
};

/* -------------------------------------------------------------------------- */
/*                           DATE RANGE HELPERS                               */
/* -------------------------------------------------------------------------- */

/**
 * Parses a date string to Date object safely.
 *
 * @param dateStr - Date string to parse
 * @returns Date object or null if invalid
 *
 * @example
 * parseDate('2024-01-15') // Date object
 * parseDate('invalid') // null
 */
export const parseDate = (
  dateStr: string | Date | undefined | null
): Date | null => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;

  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Builds a MongoDB date range filter condition.
 *
 * @param filter - Date range filter options
 * @param fieldName - Field name to filter on (default: 'createdAt')
 * @returns MongoDB filter condition or null if no valid dates
 *
 * @example
 * buildDateRangeCondition({ fromDate: '2024-01-01', toDate: '2024-12-31' })
 * // { createdAt: { $gte: Date, $lte: Date } }
 */
export const buildDateRangeCondition = (
  filter: DateRangeFilter,
  fieldName = 'createdAt'
): FilterCondition | null => {
  const range: Record<string, Date> = {};

  const fromDate = parseDate(filter.fromDate);
  const toDate = parseDate(filter.toDate);

  if (fromDate) range.$gte = fromDate;
  if (toDate) range.$lte = toDate;

  if (Object.keys(range).length === 0) return null;

  return { [fieldName]: range };
};

/* -------------------------------------------------------------------------- */
/*                          AMOUNT RANGE HELPERS                              */
/* -------------------------------------------------------------------------- */

/**
 * Parses an amount string to number safely.
 *
 * @param amount - Amount string or number to parse
 * @returns Number or null if invalid
 *
 * @example
 * parseAmount('100.50') // 100.5
 * parseAmount('invalid') // null
 */
export const parseAmount = (
  amount: string | number | undefined | null
): number | null => {
  if (amount === undefined || amount === null) return null;
  if (typeof amount === 'number') return amount;

  const parsed = parseFloat(amount);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Builds a MongoDB amount range filter condition.
 *
 * @param filter - Amount range filter options
 * @param fieldName - Field name to filter on (default: 'amount')
 * @returns MongoDB filter condition or null if no valid amounts
 *
 * @example
 * buildAmountRangeCondition({ minAmount: '10', maxAmount: '100' }, 'totalAmount')
 * // { totalAmount: { $gte: 10, $lte: 100 } }
 */
export const buildAmountRangeCondition = (
  filter: AmountRangeFilter,
  fieldName = 'amount'
): FilterCondition | null => {
  const range: Record<string, number> = {};

  const minAmount = parseAmount(filter.minAmount);
  const maxAmount = parseAmount(filter.maxAmount);

  if (minAmount !== null) range.$gte = minAmount;
  if (maxAmount !== null) range.$lte = maxAmount;

  if (Object.keys(range).length === 0) return null;

  return { [fieldName]: range };
};

/* -------------------------------------------------------------------------- */
/*                          SEARCH HELPERS                                    */
/* -------------------------------------------------------------------------- */

/**
 * Builds a case-insensitive regex search condition.
 *
 * @param searchTerm - Search term
 * @param fields - Fields to search in
 * @returns MongoDB $or condition or null if no search term
 *
 * @example
 * buildSearchCondition('john', ['name', 'email'])
 * // { $or: [{ name: { $regex: 'john', $options: 'i' } }, { email: { $regex: 'john', $options: 'i' } }] }
 */
export const buildSearchCondition = (
  searchTerm: string | undefined | null,
  fields: string[]
): FilterCondition | null => {
  const term = searchTerm?.trim();
  if (!term || fields.length === 0) return null;

  const orConditions = fields.map((field) => ({
    [field]: { $regex: term, $options: 'i' },
  }));

  return { $or: orConditions };
};

/**
 * Builds a single field regex search condition.
 *
 * @param searchTerm - Search term
 * @param field - Field to search in
 * @returns MongoDB filter condition or null if no search term
 *
 * @example
 * buildFieldSearchCondition('john', 'name')
 * // { name: { $regex: 'john', $options: 'i' } }
 */
export const buildFieldSearchCondition = (
  searchTerm: string | undefined | null,
  field: string
): FilterCondition | null => {
  const term = searchTerm?.trim();
  if (!term) return null;

  return { [field]: { $regex: term, $options: 'i' } };
};

/* -------------------------------------------------------------------------- */
/*                          QUERY BUILDER                                     */
/* -------------------------------------------------------------------------- */

/**
 * Query builder class for constructing MongoDB filter queries.
 *
 * Provides a fluent API for building complex queries with multiple conditions.
 *
 * @example
 * const query = new QueryBuilder()
 *   .addCondition({ status: 'active' })
 *   .addObjectIdCondition('userId', userId)
 *   .addDateRange({ fromDate, toDate })
 *   .addSearch(searchTerm, ['name', 'email'])
 *   .build();
 */
export class QueryBuilder {
  private conditions: FilterCondition[] = [];

  /**
   * Adds a raw condition to the query.
   *
   * @param condition - MongoDB filter condition
   * @returns This builder for chaining
   */
  addCondition(condition: FilterCondition | null | undefined): this {
    if (condition && Object.keys(condition).length > 0) {
      this.conditions.push(condition);
    }
    return this;
  }

  /**
   * Adds an ObjectId condition if the ID is valid.
   *
   * @param field - Field name
   * @param id - ObjectId string
   * @returns This builder for chaining
   */
  addObjectIdCondition(field: string, id: string | undefined | null): this {
    const objectId = toObjectId(id);
    if (objectId) {
      this.conditions.push({ [field]: objectId });
    }
    return this;
  }

  /**
   * Adds a boolean condition if the value is defined.
   *
   * @param field - Field name
   * @param value - Boolean value
   * @returns This builder for chaining
   */
  addBooleanCondition(field: string, value: boolean | undefined): this {
    if (typeof value === 'boolean') {
      this.conditions.push({ [field]: value });
    }
    return this;
  }

  /**
   * Adds an enum/string condition if the value is defined.
   *
   * @param field - Field name
   * @param value - String value
   * @returns This builder for chaining
   */
  addEnumCondition(field: string, value: string | undefined | null): this {
    if (value && value.trim()) {
      this.conditions.push({ [field]: value });
    }
    return this;
  }

  /**
   * Adds a date range condition.
   *
   * @param filter - Date range filter options
   * @param field - Field name (default: 'createdAt')
   * @returns This builder for chaining
   */
  addDateRange(filter: DateRangeFilter, field = 'createdAt'): this {
    const condition = buildDateRangeCondition(filter, field);
    return this.addCondition(condition);
  }

  /**
   * Adds an amount range condition.
   *
   * @param filter - Amount range filter options
   * @param field - Field name (default: 'amount')
   * @returns This builder for chaining
   */
  addAmountRange(filter: AmountRangeFilter, field = 'amount'): this {
    const condition = buildAmountRangeCondition(filter, field);
    return this.addCondition(condition);
  }

  /**
   * Adds a search condition across multiple fields.
   *
   * @param searchTerm - Search term
   * @param fields - Fields to search in
   * @returns This builder for chaining
   */
  addSearch(searchTerm: string | undefined | null, fields: string[]): this {
    const condition = buildSearchCondition(searchTerm, fields);
    return this.addCondition(condition);
  }

  /**
   * Adds a field-specific search condition.
   *
   * @param searchTerm - Search term
   * @param field - Field to search in
   * @returns This builder for chaining
   */
  addFieldSearch(searchTerm: string | undefined | null, field: string): this {
    const condition = buildFieldSearchCondition(searchTerm, field);
    return this.addCondition(condition);
  }

  /**
   * Adds an $in condition for array matching.
   *
   * @param field - Field name
   * @param values - Array of values to match
   * @returns This builder for chaining
   */
  addInCondition<T>(field: string, values: T[] | undefined | null): this {
    if (values && values.length > 0) {
      this.conditions.push({ [field]: { $in: values } });
    }
    return this;
  }

  /**
   * Builds the final MongoDB query object.
   *
   * @returns MongoDB filter query
   */
  build(): FilterCondition {
    if (this.conditions.length === 0) return {};
    if (this.conditions.length === 1) return this.conditions[0];
    return { $and: this.conditions };
  }

  /**
   * Resets the builder for reuse.
   *
   * @returns This builder for chaining
   */
  reset(): this {
    this.conditions = [];
    return this;
  }
}

/**
 * Creates a new QueryBuilder instance.
 *
 * @returns New QueryBuilder
 *
 * @example
 * const query = createQueryBuilder()
 *   .addCondition({ status: 'active' })
 *   .build();
 */
export const createQueryBuilder = (): QueryBuilder => new QueryBuilder();
