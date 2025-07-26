/**
 * WebLinkCollector Utility Functions
 * This file contains utility functions for analyzing collection results and exporting data.
 */

import type { CollectionResult, CollectionStatistics, EnhancedCollectionResult } from './types';

/**
 * Calculate detailed statistics from a collection result
 * @param result - The collection result to analyze
 * @returns Detailed statistics about the collection
 */
export function calculateStatistics(result: CollectionResult): CollectionStatistics {
  const uniqueLinks = new Set(result.allCollectedUrls);
  const sourceHostname = new globalThis.URL(result.initialUrl).hostname;

  let internalLinks = 0;
  const linksByDomain: Record<string, number> = {};

  // Analyze each collected URL
  for (const url of uniqueLinks) {
    try {
      const hostname = new globalThis.URL(url).hostname;
      if (hostname === sourceHostname) {
        internalLinks++;
      }
      linksByDomain[hostname] = (linksByDomain[hostname] || 0) + 1;
    } catch {
      // Handle invalid URLs
      linksByDomain['invalid'] = (linksByDomain['invalid'] || 0) + 1;
    }
  }

  // Estimate depth distribution from link relationships
  const linksByDepth: Record<number, number> = {};

  // Create a depth map based on link relationships
  const urlDepthMap = new Map<string, number>();
  urlDepthMap.set(result.initialUrl, 0);

  // Process relationships to determine approximate depths
  for (const relationship of result.linkRelationships) {
    const sourceDepth = urlDepthMap.get(relationship.source) || 0;
    const targetDepth = sourceDepth + 1;

    if (
      !urlDepthMap.has(relationship.found) ||
      urlDepthMap.get(relationship.found)! > targetDepth
    ) {
      urlDepthMap.set(relationship.found, targetDepth);
    }
  }

  // Count links by depth
  for (const [, depth] of urlDepthMap) {
    linksByDepth[depth] = (linksByDepth[depth] || 0) + 1;
  }

  return {
    totalLinks: result.allCollectedUrls.length,
    uniqueLinks: uniqueLinks.size,
    internalLinks,
    externalLinks: uniqueLinks.size - internalLinks,
    linksByDomain,
    linksByDepth,
    averageLinksPerPage:
      result.stats.totalUrlsScanned > 0
        ? Math.round(result.allCollectedUrls.length / result.stats.totalUrlsScanned)
        : 0,
    crawlEfficiency:
      result.stats.totalUrlsScanned > 0
        ? Math.round((result.stats.totalUrlsCollected / result.stats.totalUrlsScanned) * 100) / 100
        : 0,
  };
}

/**
 * Export collection results in various formats
 * @param results - Single result or array of results to export
 * @param format - Export format ('json' or 'csv')
 * @returns Formatted string ready for file output
 */
export function exportResults(
  results: EnhancedCollectionResult | EnhancedCollectionResult[],
  format: 'json' | 'csv' = 'json'
): string {
  const data = Array.isArray(results) ? results : [results];

  if (format === 'json') {
    return JSON.stringify(
      {
        exportTime: new Date().toISOString(),
        totalCrawls: data.length,
        results: data,
      },
      null,
      2
    );
  }

  // CSV format for basic statistics
  const csvHeaders = 'URL,Total Links,Unique Links,Internal,External,Errors,Duration(ms)';
  const csvRows = data.map(result =>
    [
      result.initialUrl,
      result.statistics?.totalLinks || 0,
      result.statistics?.uniqueLinks || 0,
      result.statistics?.internalLinks || 0,
      result.statistics?.externalLinks || 0,
      result.errors.length,
      result.stats.durationMs,
    ].join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Filter collected URLs by domain
 * @param result - Collection result to filter
 * @param domains - Array of domains to match (partial matches allowed)
 * @returns Array of URLs that match the specified domains
 */
export function filterResultsByDomain(
  result: EnhancedCollectionResult,
  domains: string[]
): string[] {
  return result.allCollectedUrls.filter(url => {
    try {
      const hostname = new globalThis.URL(url).hostname;
      return domains.some(domain => hostname.includes(domain));
    } catch {
      return false;
    }
  });
}

/**
 * Find the most linked domains in a collection result
 * @param result - Collection result to analyze
 * @param limit - Maximum number of domains to return
 * @returns Array of domain objects sorted by link count
 */
export function getTopDomains(
  result: EnhancedCollectionResult,
  limit: number = 10
): Array<{ domain: string; count: number; percentage: number }> {
  if (!result.statistics) {
    return [];
  }

  const totalLinks = result.statistics.uniqueLinks;

  return Object.entries(result.statistics.linksByDomain)
    .map(([domain, count]) => ({
      domain,
      count,
      percentage: Math.round((count / totalLinks) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Analyze crawl efficiency and provide insights
 * @param result - Collection result to analyze
 * @returns Analysis object with efficiency metrics and recommendations
 */
export function analyzeCrawlEfficiency(result: EnhancedCollectionResult): {
  efficiency: number;
  successRate: number;
  errorRate: number;
  insights: string[];
  recommendations: string[];
} {
  const { stats, errors, statistics } = result;
  const efficiency = statistics?.crawlEfficiency || 0;
  const errorRate =
    stats.totalUrlsScanned > 0 ? Math.round((errors.length / stats.totalUrlsScanned) * 100) : 0;
  const successRate = 100 - errorRate;

  const insights: string[] = [];
  const recommendations: string[] = [];

  // Generate insights
  if (efficiency < 0.3) {
    insights.push('Low crawl efficiency - many filtered URLs');
    recommendations.push('Consider adjusting filters to be more permissive');
  } else if (efficiency > 0.8) {
    insights.push('High crawl efficiency - filters are well-tuned');
  }

  if (errorRate > 20) {
    insights.push('High error rate detected');
    recommendations.push('Check network connectivity and target site availability');
  }

  if (statistics && statistics.externalLinks > statistics.internalLinks * 2) {
    insights.push('Many external links found');
    recommendations.push('Consider adding domain filters to focus on internal content');
  }

  if (stats.maxDepthReached < result.depth) {
    insights.push('Maximum depth not reached - possible early termination');
    recommendations.push('Check for filtering or connectivity issues');
  }

  return {
    efficiency,
    successRate,
    errorRate,
    insights,
    recommendations,
  };
}

/**
 * Merge multiple collection results into a single comprehensive result
 * @param results - Array of collection results to merge
 * @returns Merged result with combined statistics
 */
export function mergeCollectionResults(
  results: EnhancedCollectionResult[]
): EnhancedCollectionResult {
  if (results.length === 0) {
    throw new Error('Cannot merge empty results array');
  }

  if (results.length === 1) {
    return results[0]!;
  }

  // Combine all URLs and relationships
  const allUrls = new Set<string>();
  const allRelationships = [];
  const allErrors = [];
  let totalDuration = 0;
  let totalScanned = 0;
  let totalCollected = 0;

  for (const result of results) {
    result.allCollectedUrls.forEach(url => allUrls.add(url));
    allRelationships.push(...result.linkRelationships);
    allErrors.push(...result.errors);
    totalDuration += result.stats.durationMs;
    totalScanned += result.stats.totalUrlsScanned;
    totalCollected += result.stats.totalUrlsCollected;
  }

  // Create merged result
  const mergedResult: EnhancedCollectionResult = {
    initialUrl: `Multiple URLs (${results.length} crawls)`,
    depth: Math.max(...results.map(r => r.depth)),
    allCollectedUrls: Array.from(allUrls),
    linkRelationships: allRelationships,
    errors: allErrors,
    stats: {
      startTime: results[0]!.stats.startTime,
      endTime: results[results.length - 1]!.stats.endTime,
      durationMs: totalDuration,
      totalUrlsScanned: totalScanned,
      totalUrlsCollected: totalCollected,
      maxDepthReached: Math.max(...results.map(r => r.stats.maxDepthReached)),
    },
  };

  // Calculate merged statistics
  mergedResult.statistics = calculateStatistics(mergedResult);

  return mergedResult;
}
