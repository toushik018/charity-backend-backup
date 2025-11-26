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
};

export type TUser = {
  name: string;
  email: string;
  password: string;
  superPassword?: string;
  role?: TUserRole;
  profile?: TProfile;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
