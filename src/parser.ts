/**
 * WebLinkCollector HTML Parser Module
 * This module handles parsing HTML content and extracting links.
 */

import * as cheerio from 'cheerio';
import { URL } from 'url';

/**
 * Converts a relative URL to an absolute URL
 * @param relativeUrl - The relative URL to convert
 * @param baseUrl - The base URL to resolve against
 * @returns The absolute URL, or null if invalid
 */
const resolveUrl = (relativeUrl: string, baseUrl: string): string | null => {
  try {
    const url = new URL(relativeUrl, baseUrl);
    return url.toString();
  } catch {
    // Invalid URL or cannot be resolved
    return null;
  }
};

/**
 * Determines if a URL is valid (not javascript:, mailto:, tel:, etc.)
 * @param url - The URL to check
 * @returns Boolean indicating if the URL is valid for collection
 */
const isValidUrl = (url: string): boolean => {
  if (!url) return false;

  // Skip URLs with these protocols
  const invalidProtocols = ['javascript:', 'mailto:', 'tel:', 'sms:', 'file:', 'data:'];
  for (const protocol of invalidProtocols) {
    if (url.startsWith(protocol)) {
      return false;
    }
  }

  return true;
};

/**
 * Extracts links from HTML content
 * @param htmlContent - The HTML content to parse
 * @param baseUrl - The base URL to resolve relative URLs against
 * @param cssSelector - Optional CSS selector to limit extraction scope
 * @returns A Set of absolute URLs
 */
export const extractLinksFromHtml = (
  htmlContent: string,
  baseUrl: string,
  cssSelector?: string
): Set<string> => {
  const links = new Set<string>();

  // Parse HTML with cheerio
  const $ = cheerio.load(htmlContent);

  // Prepare the selector for links
  const linkElements = cssSelector
    ? $(`${cssSelector} a[href], ${cssSelector} link[href]`)
    : $('a[href], link[href]');

  // Extract href attributes
  linkElements.each((_, element) => {
    const href = $(element).attr('href');

    if (href && isValidUrl(href)) {
      const absoluteUrl = resolveUrl(href, baseUrl);
      if (absoluteUrl) {
        links.add(absoluteUrl);
      }
    }
  });

  return links;
};
