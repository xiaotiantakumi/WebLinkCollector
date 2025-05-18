/**
 * WebLinkCollector - Main Entry Point
 * This file exports the main library functions and types.
 */

import { collectWebLinks } from './collector';
import { InitialUrlParams, CollectionResult, FilterConditions, LogLevel } from './types';

/**
 * Main public API function to collect links from a URL
 * @param initialUrl - The starting URL
 * @param options - Collection options including depth, filters, etc.
 * @returns Promise resolving to collection results
 */
export const collectLinks = async (
  initialUrl: string,
  options: {
    depth: number;
    filters?: FilterConditions;
    selector?: string;
    delayMs?: number;
    logLevel?: LogLevel;
  }
): Promise<CollectionResult> => {
  // Combine parameters for the internal collection function
  const params: InitialUrlParams = {
    initialUrl,
    ...options,
  };

  return collectWebLinks(params);
};

// Export all public types
export * from './types';
