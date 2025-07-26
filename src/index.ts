/**
 * WebLinkCollector - Main Entry Point
 * This file exports the main library functions and types.
 * Optimized for Bun runtime with enhanced performance.
 */

import { collectWebLinks } from './collector';
import type { InitialUrlParams, CollectionResult, FilterConditions, LogLevel } from './types';

/**
 * Collection options interface for better type safety
 */
export interface CollectionOptions {
  depth: number;
  filters?: FilterConditions;
  selector?: string;
  delayMs?: number;
  logLevel?: LogLevel;
}

/**
 * Main public API function to collect links from a URL
 * Enhanced for Bun runtime with improved error handling and performance
 * @param initialUrl - The starting URL
 * @param options - Collection options including depth, filters, etc.
 * @returns Promise resolving to collection results
 */
export const collectLinks = async (
  initialUrl: string,
  options: CollectionOptions
): Promise<CollectionResult> => {
  if (!initialUrl?.trim()) {
    throw new Error('initialUrl は必須で、空でない文字列である必要があります');
  }

  if (options.depth < 0) {
    throw new Error('depth は 0 以上の値である必要があります');
  }

  // Combine parameters for the internal collection function
  const params: InitialUrlParams = {
    initialUrl: initialUrl.trim(),
    ...options,
  };

  try {
    return await collectWebLinks(params);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`リンク収集中にエラーが発生しました: ${errorMessage}`);
  }
};

// Export all public types (backward compatibility)
export * from './types';

// Export utility functions for external use (backward compatibility)
export { createLogger } from './logger';
export { extractLinksFromHtml } from './parser';
export { isUrlAllowed, isUrlInQueryParams } from './filter';

// Export new enhanced functionality
export {
  collect,
  collectMultiple,
  collectWithRetry,
  collectDocs,
  collectGitHub,
  collectBlog,
  collectEcommerce,
  collectInternal,
  collectByKeywords,
  collectFromDomains,
} from './convenience';

export { FILTER_PRESETS, getPresetFilters, getAvailablePresets, combinePresets } from './presets';

export {
  FilterBuilder,
  createFilter,
  createFilterFromPreset,
  createFilterFromPresets,
  createDomainFilter,
  createPathFilter,
  createKeywordFilter,
  createRegexFilter,
} from './builder';

export {
  calculateStatistics,
  exportResults,
  filterResultsByDomain,
  getTopDomains,
  analyzeCrawlEfficiency,
  mergeCollectionResults,
} from './utils';

// Export format conversion system
export {
  createFormatService,
  DefaultFormatService,
  DefaultConverterRegistry,
  NotebookLMConverter,
  UnsupportedFormatError,
  ConversionError,
} from './formatters/index.js';

export type {
  FormatConverter,
  NotebookLMOptions,
  ConverterRegistry,
  FormatService,
} from './formatters/index.js';
