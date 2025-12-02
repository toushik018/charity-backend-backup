import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { cloudinary } from '../../middlewares/multer';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

const uploadProfilePicture = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: 'No file uploaded',
      data: null,
    });
  }

  // If using Cloudinary, the file path will be the Cloudinary URL
  const imageUrl =
    (req.file as unknown as { path?: string }).path || req.file.filename;

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: imageUrl,
    },
  });
});

const uploadBase64Image = catchAsync(async (req: Request, res: Response) => {
  const { image } = req.body;

  if (!image) {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: 'No image data provided',
      data: null,
    });
  }

  try {
    // Upload base64 image to Cloudinary, preserve aspect ratio
    const result = await cloudinary.uploader.upload(image, {
      folder: 'fundsus',
      resource_type: 'image',
      transformation: [
        {
          width: 1920,
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch {
    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Failed to upload image',
      data: null,
    });
  }
});

export const UploadController = {
  uploadProfilePicture,
  uploadBase64Image,
};
