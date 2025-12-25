/**
 * @fileoverview System logs routes for admin dashboard.
 *
 * @module modules/system-logs/route
 */

import { Router } from 'express';
import auth from '../../middlewares/auth';
import { SystemLogsController } from './systemLogs.controller';

const router = Router();

// All routes require admin authentication
router.use(auth('admin'));

// GET /api/system-logs - Get logs with filters
router.get('/', SystemLogsController.getLogs);

// GET /api/system-logs/stats - Get log statistics
router.get('/stats', SystemLogsController.getLogStats);

// GET /api/system-logs/files - Get available log files
router.get('/files', SystemLogsController.getLogFiles);

export const SystemLogsRoute = router;
