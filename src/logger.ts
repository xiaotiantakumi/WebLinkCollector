/**
 * WebLinkCollector Logging Module
 * This module provides a configurable logger with multiple log levels.
 * Optimized for Bun runtime with enhanced performance.
 */

import type { LogLevel, Logger } from './types';

/**
 * Map of log levels to their priority (higher number = higher priority)
 * Made const for better optimization
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
} as const;

/**
 * Creates a logger with the specified log level using Bun optimizations
 * @param level - The minimum log level to display
 * @returns A logger object with debug, info, warn, and error methods
 */
export const createLogger = (level: LogLevel = 'info'): Logger => {
  // Get the numeric priority for the specified level (computed once)
  const currentLevelPriority = LOG_LEVELS[level];

  // Early return for 'none' level to avoid unnecessary function creation
  if (level === 'none') {
    return {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    };
  }

  // Create optimized logger functions with pre-computed level checks
  const shouldLogDebug = currentLevelPriority <= LOG_LEVELS.debug;
  const shouldLogInfo = currentLevelPriority <= LOG_LEVELS.info;
  const shouldLogWarn = currentLevelPriority <= LOG_LEVELS.warn;
  const shouldLogError = currentLevelPriority <= LOG_LEVELS.error;

  return {
    debug: shouldLogDebug
      ? (message: string, ...args: any[]) => console.debug(`[DEBUG] ${message}`, ...args)
      : () => {},

    info: shouldLogInfo
      ? (message: string, ...args: any[]) => console.info(`[INFO] ${message}`, ...args)
      : () => {},

    warn: shouldLogWarn
      ? (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args)
      : () => {},

    error: shouldLogError
      ? (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args)
      : () => {},
  };
};
