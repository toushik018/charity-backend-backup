/**
 * @fileoverview System logs controller for admin dashboard.
 *
 * @module modules/system-logs/controller
 */

import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../auth/auth.interface';
import { SystemLogsService } from './systemLogs.service';

/**
 * Get logs for admin dashboard.
 */
const getLogs = catchAsync(async (req: AuthRequest, res: Response) => {
  const {
    type = 'error',
    level,
    search,
    date,
    page = 1,
    limit = 50,
  } = req.query;

  const filters = {
    level: level as 'error' | 'warn' | 'info' | 'debug' | undefined,
    search: search as string | undefined,
    date: date as string | undefined,
  };

  const result = await SystemLogsService.getLogs(
    type as 'error' | 'combined' | 'exceptions',
    filters,
    Number(page),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Logs retrieved successfully',
    data: result,
  });
});

/**
 * Get log statistics.
 */
const getLogStats = catchAsync(async (_req: AuthRequest, res: Response) => {
  const stats = await SystemLogsService.getLogStats();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Log stats retrieved successfully',
    data: stats,
  });
});

/**
 * Get available log files.
 */
const getLogFiles = catchAsync(async (_req: AuthRequest, res: Response) => {
  const files = await SystemLogsService.getLogFiles();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Log files retrieved successfully',
    data: files,
  });
});

export const SystemLogsController = {
  getLogs,
  getLogStats,
  getLogFiles,
};
