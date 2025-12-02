import { FilterQuery, Types } from 'mongoose';
import { IFundraiser } from './fundraiser.interface';
import { Fundraiser } from './fundraiser.model';

export type TFundraiserFilters = {
  searchTerm?: string;
  status?: 'draft' | 'published';
  owner?: string;
  category?: string;
  country?: string;
};

export const toObjectId = (id: string) => new Types.ObjectId(id);

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const ensureUniqueSlug = async (base: string): Promise<string> => {
  const normalized = base || 'fundraiser';
  let attempt = 0;
  let candidate = normalized;
  for (;;) {
    const exists = await Fundraiser.exists({ slug: candidate });
    if (!exists) return candidate;
    attempt += 1;
    candidate = `${normalized}-${attempt}`;
  }
};

export const buildFundraiserQuery = (
  filters: TFundraiserFilters
): FilterQuery<IFundraiser> => {
  const query: FilterQuery<IFundraiser> = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.owner) {
    if (Types.ObjectId.isValid(filters.owner)) {
      query.owner = toObjectId(filters.owner);
    }
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.country) {
    query.country = filters.country;
  }

  if (filters.searchTerm) {
    const regex = new RegExp(filters.searchTerm, 'i');
    query.$or = [{ title: { $regex: regex } }, { story: { $regex: regex } }];
  }

  return query;
};
