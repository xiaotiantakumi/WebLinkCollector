/**
 * WebLinkCollector Logging Module
 * This module provides a configurable logger with multiple log levels.
 */

import { LogLevel } from './types';

/**
 * Interface for a logger object
 */
interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

/**
 * Creates a logger with the specified log level
 * @param level - The minimum log level to display
 * @returns A logger object with debug, info, warn, and error methods
 */
export const createLogger = (level: LogLevel = 'info'): Logger => {
  // Map of log levels to their priority (higher number = higher priority)
  const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4,
  };

  // Get the numeric priority for the specified level
  const currentLevelPriority = LOG_LEVELS[level];

  // Create a logger that only logs messages at or above the specified level
  return {
    debug: (message: string, ...args: any[]) => {
      if (currentLevelPriority <= LOG_LEVELS.debug) {
        console.debug(`[DEBUG] ${message}`, ...args);
      }
    },

    info: (message: string, ...args: any[]) => {
      if (currentLevelPriority <= LOG_LEVELS.info) {
        console.info(`[INFO] ${message}`, ...args);
      }
    },

    warn: (message: string, ...args: any[]) => {
      if (currentLevelPriority <= LOG_LEVELS.warn) {
        console.warn(`[WARN] ${message}`, ...args);
      }
    },

    error: (message: string, ...args: any[]) => {
      if (currentLevelPriority <= LOG_LEVELS.error) {
        console.error(`[ERROR] ${message}`, ...args);
      }
    },
  };
};
