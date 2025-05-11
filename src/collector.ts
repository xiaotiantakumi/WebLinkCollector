/**
 * WebLinkCollector Main Collection Logic
 * This module implements the core recursive link collection logic.
 */

import { fetchUrlContent } from './fetcher';
import { extractLinksFromHtml } from './parser';
import { isUrlAllowed } from './filter';
import { createLogger } from './logger';
import {
  InitialUrlParams,
  CollectionResult,
  LinkRelationship,
  ErrorEntry,
  Stats
} from './types';

/**
 * Main function to collect web links recursively
 * @param params - The collection parameters
 * @returns Promise resolving to the collection result
 */
export const collectWebLinks = async (
  params: InitialUrlParams
): Promise<CollectionResult> => {
  const {
    initialUrl,
    depth,
    filters,
    selector,
    delayMs = 1000,
    logLevel = 'info'
  } = params;
  
  // Create logger
  const logger = createLogger(logLevel);
  
  // Data structures to track collection
  const visitedUrls = new Set<string>();
  const allCollectedUrls = new Set<string>();
  const linkRelationships: LinkRelationship[] = [];
  const errors: ErrorEntry[] = [];
  
  // Stats tracking
  const stats: Stats = {
    startTime: new Date().toISOString(),
    endTime: '',
    durationMs: 0,
    totalUrlsScanned: 0,
    totalUrlsCollected: 0,
    maxDepthReached: 0
  };
  
  // Maximum recursion depth (cap at 5)
  const maxDepth = Math.min(depth, 5);
  
  logger.info(`Starting web link collection from ${initialUrl} with depth ${maxDepth}`);
  const startTime = Date.now();
  
  /**
   * Recursive function to collect links from a URL
   * @param url - The URL to collect links from
   * @param currentDepth - The current recursion depth
   * @param sourceUrl - The source URL that linked to this URL
   */
  const collectLinks = async (
    url: string,
    currentDepth: number,
    sourceUrl: string | null
  ): Promise<void> => {
    // Skip if we've already visited this URL
    if (visitedUrls.has(url)) {
      logger.debug(`Skipping already visited URL: ${url}`);
      return;
    }
    
    // Mark as visited to avoid cycles
    visitedUrls.add(url);
    stats.totalUrlsScanned++;
    
    // Add to collected URLs if it passes the filter
    if (isUrlAllowed(url, filters)) {
      allCollectedUrls.add(url);
      stats.totalUrlsCollected++;
      
      // Record link relationship if there's a source
      if (sourceUrl) {
        linkRelationships.push({
          source: sourceUrl,
          found: url
        });
      }
      
      // Update max depth reached
      if (currentDepth > stats.maxDepthReached) {
        stats.maxDepthReached = currentDepth;
      }
    } else {
      logger.debug(`URL filtered out: ${url}`);
      return;
    }
    
    // Stop recursion if we've reached the maximum depth
    if (currentDepth >= maxDepth) {
      logger.debug(`Max depth reached for URL: ${url}`);
      return;
    }
    
    // Fetch the URL content
    logger.debug(`Fetching URL: ${url}`);
    const result = await fetchUrlContent(url, delayMs);
    
    if (!result) {
      // Log error if fetch failed
      logger.error(`Failed to fetch URL: ${url}`);
      errors.push({
        url,
        errorType: 'FetchError',
        message: 'Failed to fetch URL content'
      });
      return;
    }
    
    const { html, finalUrl } = result;
    
    try {
      // Use selector only for the initial page (depth 0)
      const useSelector = currentDepth === 0 ? selector : undefined;
      
      // Extract links from the HTML content
      const links = extractLinksFromHtml(html, finalUrl, useSelector);
      logger.debug(`Extracted ${links.size} links from ${finalUrl}`);
      
      // Process each extracted link recursively
      for (const link of links) {
        await collectLinks(link, currentDepth + 1, finalUrl);
      }
    } catch (error) {
      // Log error if parsing failed
      logger.error(`Error parsing HTML from ${finalUrl}:`, error);
      errors.push({
        url: finalUrl,
        errorType: 'ParseError',
        message: `Error parsing HTML: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };
  
  // Start collection from the initial URL
  try {
    await collectLinks(initialUrl, 0, null);
  } catch (error) {
    logger.error('Unexpected error during collection:', error);
    errors.push({
      url: initialUrl,
      errorType: 'CollectionError',
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
  
  // Calculate duration and complete stats
  const endTime = Date.now();
  stats.durationMs = endTime - startTime;
  stats.endTime = new Date(endTime).toISOString();
  
  logger.info(`Collection completed. Collected ${stats.totalUrlsCollected} URLs, encountered ${errors.length} errors. Duration: ${stats.durationMs}ms`);
  
  // Prepare and return the final result
  return {
    initialUrl,
    depth: maxDepth,
    allCollectedUrls: Array.from(allCollectedUrls),
    linkRelationships,
    errors,
    stats
  };
};