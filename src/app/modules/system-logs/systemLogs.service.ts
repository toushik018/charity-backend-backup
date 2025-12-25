/**
 * @fileoverview System logs service for admin dashboard.
 *
 * Provides functionality to:
 * - Read log files from disk
 * - Parse and filter log entries
 * - Return paginated log data for admin viewing
 *
 * @module modules/system-logs/service
 */

import fs from 'fs/promises';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  service?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: string;
  ip?: string;
  userId?: string;
  error?: string;
  stack?: string;
  [key: string]: unknown;
}

export interface LogFilters {
  level?: 'error' | 'warn' | 'info' | 'debug';
  search?: string;
  date?: string; // YYYY-MM-DD format
}

/**
 * Get list of available log files.
 */
const getLogFiles = async (): Promise<string[]> => {
  try {
    const files = await fs.readdir(LOG_DIR);
    return files
      .filter((f) => f.endsWith('.log') && !f.startsWith('.'))
      .sort()
      .reverse();
  } catch {
    return [];
  }
};

/**
 * Parse a single log line (JSON format).
 */
const parseLogLine = (line: string): LogEntry | null => {
  try {
    const trimmed = line.trim();
    if (!trimmed) return null;
    return JSON.parse(trimmed) as LogEntry;
  } catch {
    return null;
  }
};

/**
 * Read and parse logs from a specific file.
 */
const readLogFile = async (
  filename: string,
  filters?: LogFilters,
  page = 1,
  limit = 50
): Promise<{ logs: LogEntry[]; total: number; filename: string }> => {
  const filepath = path.join(LOG_DIR, filename);

  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);

    let entries = lines
      .map(parseLogLine)
      .filter((entry): entry is LogEntry => entry !== null);

    // Apply filters
    if (filters?.level) {
      entries = entries.filter((e) => e.level === filters.level);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.message?.toLowerCase().includes(searchLower) ||
          e.url?.toLowerCase().includes(searchLower) ||
          e.error?.toLowerCase().includes(searchLower) ||
          e.userId?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp descending (newest first)
    entries.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    const total = entries.length;
    const skip = (page - 1) * limit;
    const paginatedLogs = entries.slice(skip, skip + limit);

    return { logs: paginatedLogs, total, filename };
  } catch {
    return { logs: [], total: 0, filename };
  }
};

/**
 * Get logs for admin dashboard.
 * Reads from error logs by default, or combined logs.
 */
const getLogs = async (
  type: 'error' | 'combined' | 'exceptions' = 'error',
  filters?: LogFilters,
  page = 1,
  limit = 50
) => {
  const files = await getLogFiles();

  // Determine which file to read based on type and date
  const dateStr = filters?.date || new Date().toISOString().split('T')[0];
  const targetFilename = `${type}-${dateStr}.log`;

  // Check if target file exists, otherwise use most recent
  const fileToRead = files.includes(targetFilename)
    ? targetFilename
    : files.find((f) => f.startsWith(type)) || files[0];

  if (!fileToRead) {
    return {
      logs: [],
      total: 0,
      pagination: { page, limit, total: 0, totalPages: 0 },
      availableFiles: [],
      currentFile: null,
    };
  }

  const result = await readLogFile(fileToRead, filters, page, limit);

  return {
    logs: result.logs,
    total: result.total,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
    availableFiles: files,
    currentFile: fileToRead,
  };
};

/**
 * Get log statistics for dashboard.
 */
const getLogStats = async () => {
  const files = await getLogFiles();
  const today = new Date().toISOString().split('T')[0];

  let todayErrors = 0;
  let todayWarnings = 0;
  let todayRequests = 0;

  // Read today's error log
  const errorFile = `error-${today}.log`;
  if (files.includes(errorFile)) {
    const result = await readLogFile(errorFile);
    todayErrors = result.total;
  }

  // Read today's combined log for warnings and requests
  const combinedFile = `combined-${today}.log`;
  if (files.includes(combinedFile)) {
    const result = await readLogFile(combinedFile);
    todayRequests = result.logs.filter((l) => l.url).length;
    todayWarnings = result.logs.filter((l) => l.level === 'warn').length;
  }

  return {
    todayErrors,
    todayWarnings,
    todayRequests,
    totalLogFiles: files.length,
    availableDates: [
      ...new Set(
        files
          .map((f) => {
            const match = f.match(/\d{4}-\d{2}-\d{2}/);
            return match ? match[0] : null;
          })
          .filter(Boolean)
      ),
    ]
      .sort()
      .reverse(),
  };
};

export const SystemLogsService = {
  getLogs,
  getLogFiles,
  getLogStats,
};
