import type { Types } from 'mongoose';

export type TUserRole = 'user' | 'admin';

export type TAddress = {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
};

export type TProfile = {
  phone?: string;
  avatar?: string;
  address?: TAddress;
  socials?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
};

export type TUser = {
  name: string;
  email: string;
  password: string;
  superPassword?: string;
  role?: TUserRole;
  profile?: TProfile;
  profilePicture?: string;
  bio?: string;
  coverImage?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  followers?: Types.ObjectId[];
  following?: Types.ObjectId[];
  pinnedFundraisers?: Types.ObjectId[];
};
