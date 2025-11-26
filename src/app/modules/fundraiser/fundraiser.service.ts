import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import AppError from '../../error/AppError';
import {
  IFundraiser,
  IFundraiserCreateRequest,
  IFundraiserUpdateRequest,
} from './fundraiser.interface';
import { Fundraiser } from './fundraiser.model';

const toObjectId = (id: string) => new Types.ObjectId(id);

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureUniqueSlug = async (base: string): Promise<string> => {
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
    currency: payload.currency,
    category: payload.category,
    story: payload.story,
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

  if (doc.status === 'draft' && willUpdateTitle) {
    const baseSlug = slugify(doc.title);
    doc.slug = await ensureUniqueSlug(baseSlug);
  }

  await doc.save();
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

export const FundraiserService = {
  createDraft,
  updateFundraiser,
  publishFundraiser,
  getMine,
  getBySlug,
};
