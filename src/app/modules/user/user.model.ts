import bcrypt from 'bcrypt';
import { Document, Model, model, Schema, Types } from 'mongoose';
import config from '../../config';
import { TUser } from './user.interface';

export interface IUserDocument extends TUser, Document {
  _id: Types.ObjectId;
  username?: string;
  profilePicture?: string;
  bio?: string;
  coverImage?: string;
}

export interface IUserModel extends Model<IUserDocument> {
  isUserExistsByEmail(_email: string): Promise<IUserDocument | null>;
  isPasswordMatched(
    _givenPassword: string,
    _savedHashedPassword: string
  ): Promise<boolean>;
}

const addressSchema = new Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false }
);

const profileSchema = new Schema(
  {
    phone: { type: String, trim: true },
    avatar: { type: String, trim: true },
    address: { type: addressSchema },
    socials: {
      facebook: { type: String, trim: true },
      twitter: { type: String, trim: true },
      instagram: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      website: { type: String, trim: true },
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [1, 'User name cannot be empty'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    superPassword: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: 'Role must be either admin or user',
      },
      default: 'user',
    },
    profile: { type: profileSchema },
    profilePicture: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 500 },
    coverImage: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    pinnedFundraisers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Fundraiser',
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  const user = this as unknown as IUserDocument;

  if (user.isModified('email') && user.email) {
    user.email = user.email.toLowerCase();
  }

  if (user.isModified('password') && user.password) {
    const saltRounds = Number(config.bcrypt_salt_rounds || 10);
    user.password = await bcrypt.hash(user.password, saltRounds);
  }

  if (user.isModified('superPassword') && user.superPassword) {
    const saltRounds = Number(config.bcrypt_salt_rounds || 10);
    user.superPassword = await bcrypt.hash(user.superPassword, saltRounds);
  }

  next();
});

const commonToJSONTransforms = {
  virtuals: true,
  versionKey: false,
  transform: function (
    _doc: unknown,
    ret: Record<string, unknown>
  ): Record<string, unknown> {
    delete ret.password;
    delete ret.superPassword;
    return ret;
  },
};

userSchema.set('toJSON', commonToJSONTransforms);
userSchema.set('toObject', commonToJSONTransforms);

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });
userSchema.index({ pinnedFundraisers: 1 });

// Virtual username from email
userSchema.virtual('username').get(function () {
  const self = this as unknown as IUserDocument;
  return self.email?.split('@')[0];
});

// Statics
userSchema.static(
  'isUserExistsByEmail',
  function (this: IUserModel, email: string) {
    return this.findOne({ email: email.toLowerCase() }).select('+password');
  }
);

userSchema.static(
  'isPasswordMatched',
  async function (
    this: IUserModel,
    givenPassword: string,
    savedHashedPassword: string
  ) {
    return bcrypt.compare(givenPassword, savedHashedPassword);
  }
);

export const User = model<IUserDocument, IUserModel>('User', userSchema);
