import { FilterQuery } from 'mongoose';
import { TUser } from './user.interface';

export type TUserFilters = {
  searchTerm?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
};

export function buildUserQuery(filters: TUserFilters): FilterQuery<TUser> {
  const query: FilterQuery<TUser> = {};

  if (typeof filters.isActive === 'boolean') {
    query.isActive = filters.isActive;
  }

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.searchTerm) {
    const regex = new RegExp(filters.searchTerm, 'i');
    query.$or = [
      { name: { $regex: regex } },
      { email: { $regex: regex } },
      { 'profile.phone': { $regex: regex } },
    ];
  }

  return query;
}
