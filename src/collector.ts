/**
 * WebLinkCollector Main Collection Logic
 * This module implements the core recursive link collection logic.
 */

import { fetchUrlContent } from './fetcher';
import { extractLinksFromHtml } from './parser';
import { isUrlAllowed } from './filter';
import { createLogger } from './logger';
import type {
  InitialUrlParams,
  CollectionResult,
  LinkRelationship,
  ErrorEntry,
  Stats,
} from './types';

/**
 * Main function to collect web links recursively
 * @param params - The collection parameters
 * @returns Promise resolving to the collection result
 */
export const collectWebLinks = async (params: InitialUrlParams): Promise<CollectionResult> => {
  const {
    initialUrl,
    depth,
    filters,
    selector,
    element,
    delayMs = 1000,
    logLevel = 'info',
  } = params;

  // Create logger
  const logger = createLogger(logLevel);

  // デバッグのために渡されたオプションをログに出力
  logger.debug(
    `Collector options: initialUrl=${initialUrl}, depth=${depth}, delayMs=${delayMs}, logLevel=${logLevel}`
  );
  if (filters) {
    logger.debug(`Filters: ${JSON.stringify(filters)}`);
  }
  if (selector) {
    logger.debug(`Selector: ${selector}`);
  }
  if (element) {
    logger.debug(`Element: ${element}`);
  }

  // Data structures to track collection
  const visitedUrls = new Set<string>();
  const allCollectedUrls = new Set<string>();
  const linkRelationships: LinkRelationship[] = [];
  const errors: ErrorEntry[] = [];

  // Stats tracking
  const stats: Stats = {
    startTime: '',
    endTime: '',
    durationMs: 0,
    totalUrlsScanned: 0,
    totalUrlsCollected: 0,
    maxDepthReached: 0,
  };

  // Maximum recursion depth (cap at 5)
  const maxDepth = Math.min(depth, 5);

  // 開始時刻を記録
  const startTime = Date.now();
  const startTimeISO = new Date(startTime).toISOString();
  stats.startTime = startTimeISO;

  logger.info(
    `Starting web link collection from ${initialUrl} with depth ${maxDepth} at ${startTimeISO}`
  );

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
    // 各リンクの処理を開始する前に、リクエスト間のディレイを適用
    // 深度1の場合は1ページのみなのでディレイは不要、深度2以上でのみ適用
    if (currentDepth > 0 && maxDepth > 1 && delayMs > 0) {
      logger.debug(`Applying delay of ${delayMs}ms before processing ${url}`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    // Skip if we've already visited this URL
    if (visitedUrls.has(url)) {
      logger.debug(`Skipping already visited URL: ${url}`);
      return;
    }

    // Mark as visited to avoid cycles
    visitedUrls.add(url);
    stats.totalUrlsScanned++;

    // Add to collected URLs if it passes the filter OR if it's the initial URL (depth 0)
    let allowedByFilter = true;
    if (currentDepth > 0) {
      // Only apply filter if not the initial URL
      allowedByFilter = isUrlAllowed(url, filters);
    }

    if (allowedByFilter) {
      allCollectedUrls.add(url);
      stats.totalUrlsCollected++;

      // Progress logging every 10 collected URLs
      if (stats.totalUrlsCollected % 10 === 0) {
        logger.info(
          `Progress: Collected ${stats.totalUrlsCollected} URLs (scanned ${stats.totalUrlsScanned}, depth ${currentDepth})`
        );
      }

      // Record link relationship if there's a source
      if (sourceUrl) {
        linkRelationships.push({
          source: sourceUrl,
          found: url,
        });
      }

      // Update max depth reached
      if (currentDepth > stats.maxDepthReached) {
        stats.maxDepthReached = currentDepth;
      }
    } else {
      logger.debug(`URL filtered out: ${url}`);
      return; // Do not proceed if filtered out and not initial URL
    }

    // Stop recursion if we've reached the maximum depth
    if (currentDepth >= maxDepth) {
      logger.debug(`Max depth reached for URL: ${url}`);
      return;
    }

    // Fetch the URL content
    logger.debug(`Fetching URL: ${url}`);
    const result = await fetchUrlContent(url, delayMs, logLevel);

    if (!result) {
      // Log error if fetch failed
      logger.error(`Failed to fetch URL: ${url}`);
      errors.push({
        url,
        errorType: 'FetchError',
        message: 'Failed to fetch URL content',
      });
      return;
    }

    const { html, finalUrl } = result;

    try {
      // Use selector and element only for the initial page (depth 0)
      const useSelector = currentDepth === 0 ? selector : undefined;
      const useElement = currentDepth === 0 ? element : undefined;

      // Extract links from the HTML content
      const links = extractLinksFromHtml(html, finalUrl, useSelector, logger, useElement);
      logger.debug(`Extracted ${links.size} links from ${finalUrl}`);

      // Process each extracted link sequentially to ensure proper delay between requests
      for (const link of links) {
        // Process each link one at a time to ensure delays work properly
        await collectLinks(link, currentDepth + 1, finalUrl);
      }
    } catch (error) {
      // Log error if parsing failed
      logger.error(`Error parsing HTML from ${finalUrl}:`, error);
      errors.push({
        url: finalUrl,
        errorType: 'ParseError',
        message: `Error parsing HTML: ${error instanceof Error ? error.message : String(error)}`,
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
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  // Calculate duration and complete stats
  const endTime = Date.now();
  const endTimeISO = new Date(endTime).toISOString();
  stats.durationMs = endTime - startTime;
  stats.endTime = endTimeISO;

  logger.info(
    `Collection completed at ${endTimeISO}. Collected ${stats.totalUrlsCollected} URLs, encountered ${errors.length} errors. Duration: ${stats.durationMs}ms`
  );

  // Prepare and return the final result
  return {
    initialUrl,
    depth: maxDepth,
    allCollectedUrls: Array.from(allCollectedUrls),
    linkRelationships,
    errors,
    stats,
  };
};
