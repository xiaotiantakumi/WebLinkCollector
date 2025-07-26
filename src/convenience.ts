/**
 * WebLinkCollector Convenience API
 * This file provides high-level, user-friendly functions for common use cases.
 */

import pLimit from 'p-limit';
import { collectLinks } from './index';
import { FILTER_PRESETS } from './presets';
import { calculateStatistics } from './utils';
import type {
  EnhancedCollectionOptions,
  EnhancedCollectionResult,
  CollectionOptions,
  FilterConditions,
} from './types';

/**
 * Enhanced collect function with preset support and automatic statistics
 * @param url - The URL to collect links from
 * @param options - Enhanced collection options
 * @returns Promise resolving to enhanced collection result
 */
export async function collect(
  url: string,
  options: EnhancedCollectionOptions = {}
): Promise<EnhancedCollectionResult> {
  const {
    preset,
    additionalFilters = [],
    includeStatistics = true,
    depth = 2,
    ...coreOptions
  } = options;

  // Get preset filters if specified
  const presetFilters: FilterConditions = preset ? FILTER_PRESETS[preset] || [] : [];

  // Combine preset filters with additional filters
  const allFilters: FilterConditions = [...presetFilters, ...additionalFilters];

  // Prepare options for the core collectLinks function
  const collectOptions: CollectionOptions = {
    depth,
    ...coreOptions,
    filters: allFilters.length > 0 ? allFilters : undefined,
  };

  // Perform the collection
  const result = await collectLinks(url, collectOptions);

  // Create enhanced result
  const enhancedResult: EnhancedCollectionResult = {
    ...result,
    statistics: includeStatistics ? calculateStatistics(result) : undefined,
  };

  return enhancedResult;
}

/**
 * Collect links from multiple URLs with concurrency control
 * @param urls - Array of URLs to collect from
 * @param options - Enhanced collection options
 * @param concurrency - Maximum number of concurrent requests (default: 3)
 * @returns Promise resolving to array of enhanced collection results
 */
export async function collectMultiple(
  urls: string[],
  options: EnhancedCollectionOptions = { depth: 2 },
  concurrency: number = 3
): Promise<EnhancedCollectionResult[]> {
  if (urls.length === 0) {
    return [];
  }

  // Create a limit function for concurrency control
  const limit = pLimit(Math.max(1, concurrency));

  // Create promises for each URL collection
  const promises = urls.map(url => limit(() => collect(url, options)));

  // Wait for all collections to complete
  return Promise.all(promises);
}

/**
 * Collect links with automatic retry on failure
 * @param url - The URL to collect links from
 * @param options - Enhanced collection options
 * @param retries - Number of retry attempts (default: 2)
 * @param retryDelay - Delay between retries in milliseconds (default: 1000)
 * @returns Promise resolving to enhanced collection result
 */
export async function collectWithRetry(
  url: string,
  options: EnhancedCollectionOptions = { depth: 2 },
  retries: number = 2,
  retryDelay: number = 1000
): Promise<EnhancedCollectionResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await collect(url, options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // If all retries failed, throw the last error
  throw lastError || new Error('Collection failed after all retries');
}

/**
 * Quick collect function for common documentation sites
 * @param url - The documentation URL to collect from
 * @param depth - Crawl depth (default: 2)
 * @returns Promise resolving to enhanced collection result
 */
export async function collectDocs(
  url: string,
  depth: number = 2
): Promise<EnhancedCollectionResult> {
  return collect(url, {
    preset: 'documentation',
    depth,
    includeStatistics: true,
    delayMs: 500, // Faster for documentation sites
  });
}

/**
 * Quick collect function for GitHub repositories
 * @param url - The GitHub URL to collect from
 * @param depth - Crawl depth (default: 2)
 * @returns Promise resolving to enhanced collection result
 */
export async function collectGitHub(
  url: string,
  depth: number = 2
): Promise<EnhancedCollectionResult> {
  return collect(url, {
    preset: 'github',
    depth,
    includeStatistics: true,
    delayMs: 1000, // Respect GitHub's rate limits
  });
}

/**
 * Quick collect function for blog and article content
 * @param url - The blog/news URL to collect from
 * @param depth - Crawl depth (default: 1)
 * @returns Promise resolving to enhanced collection result
 */
export async function collectBlog(
  url: string,
  depth: number = 1
): Promise<EnhancedCollectionResult> {
  return collect(url, {
    preset: 'blog',
    depth,
    includeStatistics: true,
    delayMs: 800,
  });
}

/**
 * Quick collect function for e-commerce sites
 * @param url - The e-commerce URL to collect from
 * @param depth - Crawl depth (default: 2)
 * @returns Promise resolving to enhanced collection result
 */
export async function collectEcommerce(
  url: string,
  depth: number = 2
): Promise<EnhancedCollectionResult> {
  return collect(url, {
    preset: 'ecommerce',
    depth,
    includeStatistics: true,
    delayMs: 1200, // Be respectful to commercial sites
  });
}

/**
 * Collect only internal links (same domain)
 * @param url - The URL to collect internal links from
 * @param options - Enhanced collection options
 * @returns Promise resolving to enhanced collection result
 */
export async function collectInternal(
  url: string,
  options: EnhancedCollectionOptions = { depth: 2 }
): Promise<EnhancedCollectionResult> {
  const domain = new globalThis.URL(url).hostname;

  return collect(url, {
    ...options,
    additionalFilters: [...(options.additionalFilters || []), { domain: [domain] }],
  });
}

/**
 * Collect links matching specific keywords
 * @param url - The URL to collect links from
 * @param keywords - Array of keywords to match
 * @param options - Enhanced collection options
 * @returns Promise resolving to enhanced collection result
 */
export async function collectByKeywords(
  url: string,
  keywords: string[],
  options: EnhancedCollectionOptions = { depth: 2 }
): Promise<EnhancedCollectionResult> {
  return collect(url, {
    ...options,
    additionalFilters: [...(options.additionalFilters || []), { keywords }],
  });
}

/**
 * Collect links from specific domains only
 * @param url - The URL to collect links from
 * @param domains - Array of allowed domains
 * @param options - Enhanced collection options
 * @returns Promise resolving to enhanced collection result
 */
export async function collectFromDomains(
  url: string,
  domains: string[],
  options: EnhancedCollectionOptions = { depth: 2 }
): Promise<EnhancedCollectionResult> {
  return collect(url, {
    ...options,
    additionalFilters: [...(options.additionalFilters || []), { domain: domains }],
  });
}
