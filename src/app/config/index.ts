import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const withDefault = (value: string | undefined, fallback: string): string =>
  value && value.trim().length > 0 ? value : fallback;

const parseNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (!value) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const parseCSV = (value: string | undefined): string[] | undefined => {
  if (!value) return undefined;
  const items = value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
  return items.length > 0 ? items : undefined;
};

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  default_password: process.env.DEFAULT_PASSWORD,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: withDefault(process.env.JWT_ACCESS_EXPIRES_IN, '1d'),
  jwt_refresh_expires_in: withDefault(process.env.JWT_REFRESH_EXPIRES_IN, '7d'),
  // Preferred generic frontend URL
  frontend_url: process.env.FRONTEND_URL,
  // Legacy key kept for compatibility
  shop_frontend_url: process.env.SHOP_FRONTEND_URL,
  cookie_domain: process.env.COOKIE_DOMAIN,
  cors_origins: parseCSV(process.env.CORS_ORIGINS),
  // Deprecated: multi-shop removed
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME,
  },
  setup: {
    super_password: withDefault(process.env.SUPER_PASSWORD, 'smsami.dev'),
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  use_cloudinary: process.env.USE_CLOUDINARY,
  email: {
    host: process.env.EMAIL_HOST,
    port: parseNumber(process.env.EMAIL_PORT),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    secure: parseBoolean(process.env.EMAIL_SECURE),
    from: process.env.EMAIL_FROM,
  },
};
