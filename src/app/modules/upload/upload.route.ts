import { Router } from 'express';
import auth from '../../middlewares/auth';
import { upload } from '../../middlewares/multer';
import { UploadController } from './upload.controller';

const router = Router();

// Upload profile picture (multipart/form-data)
router.post(
  '/profile-picture',
  auth('admin', 'user'),
  upload.single('image'),
  UploadController.uploadProfilePicture
);

// Upload base64 image
router.post(
  '/base64-image',
  auth('admin', 'user'),
  UploadController.uploadBase64Image
);

export const UploadRoute = router;
