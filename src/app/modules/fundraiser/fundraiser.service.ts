import { StatusCodes } from 'http-status-codes';
import { FilterQuery } from 'mongoose';
import AppError from '../../error/AppError';
import type { TListOptions } from '../user/user.service';
import {
  IFundraiser,
  IFundraiserCreateRequest,
  IFundraiserUpdateRequest,
} from './fundraiser.interface';
import { Fundraiser } from './fundraiser.model';
import {
  buildFundraiserQuery,
  ensureUniqueSlug,
  slugify,
  TFundraiserFilters,
  toObjectId,
} from './fundraiser.utils';

const createDraft = async (
  ownerId: string,
  payload: IFundraiserCreateRequest
): Promise<IFundraiser> => {
  const title = (payload.title || 'Untitled fundraiser').trim();
  const baseSlug = slugify(title);
  const slug = await ensureUniqueSlug(baseSlug);

  const doc = await Fundraiser.create({
    owner: toObjectId(ownerId),
    title,
    slug,
    status: 'draft',
    coverImage: payload.coverImage,
    gallery: payload.gallery || [],
    goalAmount: payload.goalAmount,
    currentAmount: payload.currentAmount || 0,
    currency: payload.currency,
    category: payload.category,
    story: payload.story,
    description: payload.description,
    location: payload.location,
    country: payload.country,
    zipCode: payload.zipCode,
    beneficiaryType: payload.beneficiaryType,
    nonprofit: payload.nonprofit ?? null,
    automatedGoal: payload.automatedGoal,
    longTermNeed: payload.longTermNeed,
    donationCount: payload.donationCount || 0,
  });
  return doc;
};

const updateFundraiser = async (
  ownerId: string,
  id: string,
  payload: IFundraiserUpdateRequest
): Promise<IFundraiser> => {
  const doc = await Fundraiser.findOne({ _id: id, owner: ownerId });
  if (!doc) throw new AppError(StatusCodes.NOT_FOUND, 'Fundraiser not found');

  const willUpdateTitle = payload.title && payload.title.trim() !== doc.title;
  if (payload.title) doc.title = payload.title.trim();
  if (payload.coverImage !== undefined) doc.coverImage = payload.coverImage;
  if (payload.gallery !== undefined) doc.gallery = payload.gallery;
  if (payload.goalAmount !== undefined) doc.goalAmount = payload.goalAmount;
  if (payload.currency !== undefined) doc.currency = payload.currency;
  if (payload.category !== undefined) doc.category = payload.category;
  if (payload.story !== undefined) doc.story = payload.story;
  if (payload.country !== undefined) doc.country = payload.country;
  if (payload.zipCode !== undefined) doc.zipCode = payload.zipCode;
  if (payload.beneficiaryType !== undefined)
    doc.beneficiaryType = payload.beneficiaryType;
  if (payload.nonprofit !== undefined) doc.nonprofit = payload.nonprofit;
  if (payload.automatedGoal !== undefined)
    doc.automatedGoal = payload.automatedGoal;
  if (payload.longTermNeed !== undefined)
    doc.longTermNeed = payload.longTermNeed;

  if (doc.status === 'draft' && willUpdateTitle) {
    const baseSlug = slugify(doc.title);
    doc.slug = await ensureUniqueSlug(baseSlug);
  }

  await doc.save();
  await doc.populate('owner', 'name email profilePicture');
  return doc;
};

const publishFundraiser = async (
  ownerId: string,
  id: string
): Promise<IFundraiser> => {
  const doc = await Fundraiser.findOne({ _id: id, owner: ownerId });
  if (!doc) throw new AppError(StatusCodes.NOT_FOUND, 'Fundraiser not found');
  doc.status = 'published';
  doc.publishedAt = new Date();
  if (!doc.slug) {
    const baseSlug = slugify(doc.title || 'fundraiser');
    doc.slug = await ensureUniqueSlug(baseSlug);
  }
  await doc.save();
  return doc;
};

const getMine = async (
  ownerId: string,
  status?: 'draft' | 'published'
): Promise<IFundraiser[]> => {
  const query: Record<string, unknown> = { owner: ownerId };
  if (status) query.status = status;
  const items = await Fundraiser.find(query).sort({ updatedAt: -1 });
  return items;
};

const getBySlug = async (
  slug: string,
  viewerId?: string
): Promise<IFundraiser | null> => {
  const doc = await Fundraiser.findOne({ slug });
  if (!doc) return null;
  if (doc.status === 'published') return doc;
  if (viewerId && String(doc.owner) === String(viewerId)) return doc;
  return null;
};

const getAllFundraisers = async (
  filters: TFundraiserFilters,
  options: TListOptions
) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options || {};

  const query: FilterQuery<IFundraiser> = buildFundraiserQuery(filters);

  const skip = (page - 1) * limit;
  const sort: Record<string, 1 | -1> = {
    [String(sortBy)]: sortOrder === 'asc' ? 1 : -1,
  };

  const [data, total] = await Promise.all([
    Fundraiser.find(query)
      .populate('owner', 'name email profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Fundraiser.countDocuments(query),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
};

const getPublicFundraisers = async (
  filters: Omit<TFundraiserFilters, 'status'>,
  options: TListOptions
) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'publishedAt',
    sortOrder = 'desc',
  } = options || {};

  const query: FilterQuery<IFundraiser> = buildFundraiserQuery({
    ...filters,
    status: 'published',
  } as TFundraiserFilters);
  query.status = 'published';

  const skip = (page - 1) * limit;
  const sort: Record<string, 1 | -1> = {
    [String(sortBy)]: sortOrder === 'asc' ? 1 : -1,
  };

  const [data, total] = await Promise.all([
    Fundraiser.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Fundraiser.countDocuments(query),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
};

const adminCreateFundraiser = async (
  ownerId: string,
  payload: IFundraiserCreateRequest
): Promise<IFundraiser> => {
  return createDraft(ownerId, payload);
};

const adminUpdateFundraiser = async (
  id: string,
  payload: IFundraiserUpdateRequest
): Promise<IFundraiser> => {
  const doc = await Fundraiser.findById(id);
  if (!doc) throw new AppError(StatusCodes.NOT_FOUND, 'Fundraiser not found');

  const willUpdateTitle = payload.title && payload.title.trim() !== doc.title;
  if (payload.title) doc.title = payload.title.trim();
  if (payload.coverImage !== undefined) doc.coverImage = payload.coverImage;
  if (payload.gallery !== undefined) doc.gallery = payload.gallery;
  if (payload.goalAmount !== undefined) doc.goalAmount = payload.goalAmount;
  if (payload.currency !== undefined) doc.currency = payload.currency;
  if (payload.category !== undefined) doc.category = payload.category;
  if (payload.story !== undefined) doc.story = payload.story;
  if (payload.country !== undefined) doc.country = payload.country;
  if (payload.zipCode !== undefined) doc.zipCode = payload.zipCode;
  if (payload.beneficiaryType !== undefined)
    doc.beneficiaryType = payload.beneficiaryType;
  if (payload.automatedGoal !== undefined)
    doc.automatedGoal = payload.automatedGoal;
  if (payload.longTermNeed !== undefined)
    doc.longTermNeed = payload.longTermNeed;

  if (doc.status === 'draft' && willUpdateTitle) {
    const baseSlug = slugify(doc.title);
    doc.slug = await ensureUniqueSlug(baseSlug);
  }

  await doc.save();
  return doc;
};

const adminDeleteFundraiser = async (id: string): Promise<void> => {
  const result = await Fundraiser.findByIdAndDelete(id);
  if (!result)
    throw new AppError(StatusCodes.NOT_FOUND, 'Fundraiser not found');
};

const adminGetById = async (id: string): Promise<IFundraiser | null> => {
  return Fundraiser.findById(id).populate('owner', 'name email profilePicture');
};

export const FundraiserService = {
  createDraft,
  updateFundraiser,
  publishFundraiser,
  getMine,
  getBySlug,
  getAllFundraisers,
  getPublicFundraisers,
  adminCreateFundraiser,
  adminUpdateFundraiser,
  adminDeleteFundraiser,
  adminGetById,
};
