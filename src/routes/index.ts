import { Router } from 'express';
import { AuthRoute } from '../app/modules/auth/auth.route';

import { UserRoutes } from '../app/modules/user/user.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoute,
  },

  {
    path: '/users',
    route: UserRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
