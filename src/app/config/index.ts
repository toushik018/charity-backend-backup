/**
 * @fileoverview Application configuration.
 *
 * Centralized configuration management for the application, loading
 * environment variables and providing typed access to configuration values.
 *
 * @module app/config
 */

import dotenv from 'dotenv';
import path from 'path';

/* -------------------------------------------------------------------------- */
/*                              INITIALIZATION                                */
/* -------------------------------------------------------------------------- */

/**
 * Load environment variables from .env file.
 */
dotenv.config({ path: path.join(process.cwd(), '.env') });

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

/**
 * Returns the value if non-empty, otherwise returns the fallback.
 *
 * @param value - Environment variable value
 * @param fallback - Default value if empty
 * @returns Resolved value
 */
const withDefault = (value: string | undefined, fallback: string): string =>
  value && value.trim().length > 0 ? value : fallback;

/**
 * Parses a string environment variable to a number.
 *
 * @param value - String value to parse
 * @returns Parsed number or undefined
 */
const parseNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

/**
 * Parses a string environment variable to a boolean.
 *
 * @param value - String value ('true' or 'false')
 * @returns Parsed boolean or undefined
 */
const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (!value) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

/**
 * Parses a comma-separated string to an array.
 *
 * @param value - Comma-separated string
 * @returns Array of trimmed strings or undefined
 */
const parseCSV = (value: string | undefined): string[] | undefined => {
  if (!value) return undefined;
  const items = value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
  return items.length > 0 ? items : undefined;
};

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATION                                 */
/* -------------------------------------------------------------------------- */

/**
 * Application configuration object.
 *
 * Provides typed access to all environment variables and configuration
 * settings used throughout the application.
 *
 * @example
 * import config from './config';
 *
 * // Access database URL
 * mongoose.connect(config.database_url);
 *
 * // Access JWT settings
 * jwt.sign(payload, config.jwt_access_secret);
 */
const config = {
  /* -------------------------------- GENERAL --------------------------------- */

  /**
   * Node environment (development, production, test).
   */
  NODE_ENV: process.env.NODE_ENV,

  /**
   * Server port number.
   */
  port: process.env.PORT,

  /**
   * MongoDB connection URL.
   */
  database_url: process.env.DATABASE_URL,

  /* -------------------------------- SECURITY -------------------------------- */

  /**
   * Number of bcrypt salt rounds for password hashing.
   */
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,

  /**
   * Default password for seeded users.
   */
  default_password: process.env.DEFAULT_PASSWORD,

  /* ---------------------------------- JWT ----------------------------------- */

  /**
   * Secret key for signing JWT access tokens.
   */
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,

  /**
   * Secret key for signing JWT refresh tokens.
   */
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,

  /**
   * Access token expiration time.
   * @default '1d'
   */
  jwt_access_expires_in: withDefault(process.env.JWT_ACCESS_EXPIRES_IN, '1d'),

  /**
   * Refresh token expiration time.
   * @default '7d'
   */
  jwt_refresh_expires_in: withDefault(process.env.JWT_REFRESH_EXPIRES_IN, '7d'),

  /* ---------------------------------- URLS ---------------------------------- */

  /**
   * Frontend application URL.
   */
  frontend_url: process.env.FRONTEND_URL,

  /**
   * Cookie domain for cross-subdomain cookies.
   */
  cookie_domain: process.env.COOKIE_DOMAIN,

  /**
   * Allowed CORS origins (comma-separated in env).
   */
  cors_origins: parseCSV(process.env.CORS_ORIGINS),

  /* --------------------------------- ADMIN ---------------------------------- */

  /**
   * Default admin user credentials for seeding.
   */
  admin: {
    /**
     * Admin email address.
     */
    email: process.env.ADMIN_EMAIL,

    /**
     * Admin password.
     */
    password: process.env.ADMIN_PASSWORD,

    /**
     * Admin display name.
     */
    name: process.env.ADMIN_NAME,
  },

  /**
   * Setup configuration for initial deployment.
   */
  setup: {
    /**
     * Super password for admin operations.
     * @default 'smsami.dev'
     */
    super_password: withDefault(process.env.SUPER_PASSWORD, 'smsami.dev'),
  },

  /* ------------------------------- CLOUDINARY ------------------------------- */

  /**
   * Cloudinary configuration for image uploads.
   */
  cloudinary: {
    /**
     * Cloudinary cloud name.
     */
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    /**
     * Cloudinary API key.
     */
    api_key: process.env.CLOUDINARY_API_KEY,

    /**
     * Cloudinary API secret.
     */
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },

  /**
   * Whether to use Cloudinary for uploads.
   */
  use_cloudinary: process.env.USE_CLOUDINARY,

  /* --------------------------------- EMAIL ---------------------------------- */

  /**
   * Email service configuration.
   */
  email: {
    /**
     * SMTP host address.
     */
    host: process.env.EMAIL_HOST,

    /**
     * SMTP port number.
     */
    port: parseNumber(process.env.EMAIL_PORT),

    /**
     * SMTP username.
     */
    user: process.env.EMAIL_USER,

    /**
     * SMTP password.
     */
    pass: process.env.EMAIL_PASS,

    /**
     * Whether to use secure connection (TLS).
     */
    secure: parseBoolean(process.env.EMAIL_SECURE),

    /**
     * Default "from" email address.
     */
    from: process.env.EMAIL_FROM,
  },

  /* --------------------------------- STRIPE --------------------------------- */

  /**
   * Stripe payment configuration.
   */
  stripe: {
    /**
     * Stripe secret API key.
     */
    secret_key: process.env.STRIPE_SECRET_KEY,

    /**
     * Stripe webhook signing secret.
     */
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,

    /**
     * Stripe publishable API key.
     */
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
  },
};

export default config;
