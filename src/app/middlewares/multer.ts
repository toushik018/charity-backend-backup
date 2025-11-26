import { v2 as cloudinary } from 'cloudinary';
import type { Request } from 'express';
import fs from 'fs';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import config from '../config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// Cloudinary storage configuration
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (_req, file) => {
    const baseName = path
      .parse(file.originalname || 'upload')
      .name.replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase();

    return {
      folder: 'aromiq-bd',
      resource_type: 'image',
      public_id: `${Date.now()}-${baseName}`,
      transformation: [
        {
          fetch_format: 'auto',
          quality: 'auto',
          crop: 'limit',
          width: 1600,
        },
      ],
      allowed_formats: [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'bmp',
        'webp',
        'svg',
        'pdf',
      ],
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  },
});

// Fallback local storage (for development or backup)
const uploadDir = path.join(process.cwd(), 'uploads');
const imagesDir = path.join(uploadDir, 'images');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    const uniqueFilename = `${timestamp}-${randomString}${ext}`;
    cb(null, uniqueFilename);
  },
});

// Choose storage based on environment or configuration
const useCloudinary =
  process.env.USE_CLOUDINARY === 'true' ||
  (process.env.NODE_ENV === 'production' && !!config.cloudinary.cloud_name);
const storage = useCloudinary ? cloudinaryStorage : localStorage;

// File filter
const fileFilter = (
  req: Request,
  file: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  cb: multer.FileFilterCallback
) => {
  // Accept images only
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf'
  ) {
    return cb(null, true);
  }
  if (
    file.originalname.match(
      /\.(jpg|jpeg|png|gif|bmp|webp|tif|tiff|ico|svg|pdf|avif|jp2|j2k|jpf|jpx|jxr|wdp|heic|heif)$/i
    )
  ) {
    return cb(null, true);
  }
  return cb(new Error('Only image files are allowed!'));
};

// Export the multer instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
});

// Export cloudinary instance for direct use
export { cloudinary };
