import { Router } from 'express';
import auth from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import {
  createUserValidation,
  getUserByIdParamValidation,
  getUsersQueryValidation,
  updateMeValidation,
  updateUserValidation,
} from './user.validation';

const router = Router();

router.get(
  '/',
  auth('admin'),
  validateRequest(getUsersQueryValidation),
  UserController.getAllUsers
);
// Admin create user
router.post(
  '/',
  auth('admin'),
  validateRequest(createUserValidation),
  UserController.createUser
);
// Allow authenticated users to update their own basic fields (name, profile)
router.patch(
  '/me',
  auth('admin', 'user'),
  validateRequest(updateMeValidation),
  UserController.updateMe
);
router.get(
  '/:userId',
  auth('admin', 'user'),
  validateRequest(getUserByIdParamValidation),
  UserController.getSingleUser
);
router.patch(
  '/:userId',
  auth('admin'),
  validateRequest(updateUserValidation),
  UserController.updateUser
);
router.delete(
  '/:userId',
  auth('admin'),
  validateRequest(getUserByIdParamValidation),
  UserController.deleteUser
);

export const UserRoutes = router;
