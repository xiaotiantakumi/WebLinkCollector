/**
 * WebLinkCollector URL Filtering Module
 * This module handles filtering URLs based on provided conditions.
 */

import { URL } from 'url';
import { FilterConditions } from './types';

// Common paths to exclude by default (both exact matches and paths containing these)
const DEFAULT_EXCLUDED_PATHS = [
  '/admin',
  '/login',
  '/logout',
  '/signin',
  '/signout',
  '/register',
  '/account',
  '/wp-admin',
  '/wp-login',
  '/cart',
  '/checkout',
];

/**
 * Checks if a URL matches any of the filter conditions
 * @param url - The URL to check
 * @param filters - Array of filter conditions
 * @returns Boolean indicating if the URL is allowed according to filters
 */
export const isUrlAllowed = (url: string, filters?: FilterConditions): boolean => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const pathname = parsedUrl.pathname;

    // Check against common excluded paths first
    for (const excludedPath of DEFAULT_EXCLUDED_PATHS) {
      if (pathname.includes(excludedPath)) {
        return false;
      }
    }

    // If no filters provided, allow all URLs (except excluded paths)
    if (!filters || filters.length === 0) {
      return true;
    }

    // For each filter condition, all specified criteria must match (AND logic)
    // But we only need one filter condition to pass (OR logic between different filter objects)
    for (const filter of filters) {
      let conditionMatches = true;

      // Domain filter
      if (filter.domain) {
        if (Array.isArray(filter.domain)) {
          if (!filter.domain.some((domain: string) => hostname.includes(domain))) {
            conditionMatches = false;
          }
        } else if (!hostname.includes(filter.domain)) {
          conditionMatches = false;
        }
      }

      // Path prefix filter
      if (conditionMatches && filter.pathPrefix) {
        if (Array.isArray(filter.pathPrefix)) {
          if (!filter.pathPrefix.some((prefix: string) => pathname.startsWith(prefix))) {
            conditionMatches = false;
          }
        } else if (!pathname.startsWith(filter.pathPrefix)) {
          conditionMatches = false;
        }
      }

      // Regex filter
      if (conditionMatches && filter.regex) {
        if (Array.isArray(filter.regex)) {
          if (!filter.regex.some((pattern: string) => new RegExp(pattern).test(url))) {
            conditionMatches = false;
          }
        } else if (!new RegExp(filter.regex).test(url)) {
          conditionMatches = false;
        }
      }

      // Keywords filter
      if (conditionMatches && filter.keywords) {
        if (Array.isArray(filter.keywords)) {
          if (!filter.keywords.some((keyword: string) => url.includes(keyword))) {
            conditionMatches = false;
          }
        } else if (!url.includes(filter.keywords)) {
          conditionMatches = false;
        }
      }

      // If all conditions for this filter match, allow the URL
      if (conditionMatches) {
        return true;
      }
    }

    // If no filter conditions matched, disallow the URL
    return false;
  } catch (error) {
    // If URL is invalid, disallow it
    console.error(`Invalid URL: ${url}`, error);
    return false;
  }
};
