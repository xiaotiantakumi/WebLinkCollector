/**
 * Phase 2 Test - Testing utils and convenience functions
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import {
  calculateStatistics,
  exportResults,
  filterResultsByDomain,
  getTopDomains,
  analyzeCrawlEfficiency,
} from '../src/utils';
import { collect, collectMultiple } from '../src/convenience';
import type { CollectionResult, EnhancedCollectionResult } from '../src/types';

// Mock the collectLinks function
const mockCollectLinks = mock();

// Mock the main collectLinks import
mock.module('../src/index', () => ({
  collectLinks: mockCollectLinks,
}));

describe('Phase 2 - Utils and Convenience Functions', () => {
  beforeEach(() => {
    mockCollectLinks.mockClear();
  });

  describe('calculateStatistics', () => {
    it('should calculate statistics correctly', () => {
      const mockResult: CollectionResult = {
        initialUrl: 'https://example.com',
        depth: 2,
        allCollectedUrls: [
          'https://example.com',
          'https://example.com/page1',
          'https://other.com/page1',
          'https://example.com/page2',
        ],
        linkRelationships: [
          { source: 'https://example.com', found: 'https://example.com/page1' },
          { source: 'https://example.com', found: 'https://other.com/page1' },
          { source: 'https://example.com/page1', found: 'https://example.com/page2' },
        ],
        errors: [],
        stats: {
          startTime: '2025-01-01T00:00:00.000Z',
          endTime: '2025-01-01T00:01:00.000Z',
          durationMs: 60000,
          totalUrlsScanned: 4,
          totalUrlsCollected: 4,
          maxDepthReached: 2,
        },
      };

      const stats = calculateStatistics(mockResult);

      expect(stats.totalLinks).toBe(4);
      expect(stats.uniqueLinks).toBe(4);
      expect(stats.internalLinks).toBe(3); // example.com domain
      expect(stats.externalLinks).toBe(1); // other.com domain
      expect(stats.linksByDomain['example.com']).toBe(3);
      expect(stats.linksByDomain['other.com']).toBe(1);
      expect(stats.crawlEfficiency).toBe(1.0);
    });
  });

  describe('exportResults', () => {
    it('should export results as JSON', () => {
      const mockResult: EnhancedCollectionResult = {
        initialUrl: 'https://example.com',
        depth: 1,
        allCollectedUrls: ['https://example.com'],
        linkRelationships: [],
        errors: [],
        stats: {
          startTime: '2025-01-01T00:00:00.000Z',
          endTime: '2025-01-01T00:01:00.000Z',
          durationMs: 60000,
          totalUrlsScanned: 1,
          totalUrlsCollected: 1,
          maxDepthReached: 1,
        },
        statistics: {
          totalLinks: 1,
          uniqueLinks: 1,
          internalLinks: 1,
          externalLinks: 0,
          linksByDomain: { 'example.com': 1 },
          linksByDepth: { 0: 1 },
          averageLinksPerPage: 1,
          crawlEfficiency: 1.0,
        },
      };

      const exported = exportResults(mockResult, 'json');
      const parsed = JSON.parse(exported);

      expect(parsed.totalCrawls).toBe(1);
      expect(parsed.results).toHaveLength(1);
      expect(parsed.results[0].initialUrl).toBe('https://example.com');
    });

    it('should export results as CSV', () => {
      const mockResult: EnhancedCollectionResult = {
        initialUrl: 'https://example.com',
        depth: 1,
        allCollectedUrls: ['https://example.com'],
        linkRelationships: [],
        errors: [],
        stats: {
          startTime: '2025-01-01T00:00:00.000Z',
          endTime: '2025-01-01T00:01:00.000Z',
          durationMs: 60000,
          totalUrlsScanned: 1,
          totalUrlsCollected: 1,
          maxDepthReached: 1,
        },
        statistics: {
          totalLinks: 1,
          uniqueLinks: 1,
          internalLinks: 1,
          externalLinks: 0,
          linksByDomain: { 'example.com': 1 },
          linksByDepth: { 0: 1 },
          averageLinksPerPage: 1,
          crawlEfficiency: 1.0,
        },
      };

      const exported = exportResults(mockResult, 'csv');
      const lines = exported.split('\n');

      expect(lines[0]).toBe('URL,Total Links,Unique Links,Internal,External,Errors,Duration(ms)');
      expect(lines[1]).toBe('https://example.com,1,1,1,0,0,60000');
    });
  });

  describe('filterResultsByDomain', () => {
    it('should filter URLs by domain', () => {
      const mockResult: EnhancedCollectionResult = {
        initialUrl: 'https://example.com',
        depth: 1,
        allCollectedUrls: [
          'https://example.com',
          'https://github.com/user/repo',
          'https://example.com/page',
          'https://other.com/page',
        ],
        linkRelationships: [],
        errors: [],
        stats: {
          startTime: '2025-01-01T00:00:00.000Z',
          endTime: '2025-01-01T00:01:00.000Z',
          durationMs: 60000,
          totalUrlsScanned: 4,
          totalUrlsCollected: 4,
          maxDepthReached: 1,
        },
      };

      const filtered = filterResultsByDomain(mockResult, ['example.com']);
      expect(filtered).toHaveLength(2);
      expect(filtered[0]).toBe('https://example.com');
      expect(filtered[1]).toBe('https://example.com/page');
    });
  });

  describe('getTopDomains', () => {
    it('should return top domains', () => {
      const mockResult: EnhancedCollectionResult = {
        initialUrl: 'https://example.com',
        depth: 1,
        allCollectedUrls: ['https://example.com'],
        linkRelationships: [],
        errors: [],
        stats: {
          startTime: '2025-01-01T00:00:00.000Z',
          endTime: '2025-01-01T00:01:00.000Z',
          durationMs: 60000,
          totalUrlsScanned: 1,
          totalUrlsCollected: 1,
          maxDepthReached: 1,
        },
        statistics: {
          totalLinks: 3,
          uniqueLinks: 3,
          internalLinks: 2,
          externalLinks: 1,
          linksByDomain: { 'example.com': 2, 'other.com': 1 },
          linksByDepth: { 0: 3 },
          averageLinksPerPage: 1,
          crawlEfficiency: 1.0,
        },
      };

      const topDomains = getTopDomains(mockResult, 5);
      expect(topDomains).toHaveLength(2);
      expect(topDomains[0].domain).toBe('example.com');
      expect(topDomains[0].count).toBe(2);
      expect(topDomains[0].percentage).toBe(67); // 2/3 * 100 rounded
    });
  });

  describe('analyzeCrawlEfficiency', () => {
    it('should analyze crawl efficiency', () => {
      const mockResult: EnhancedCollectionResult = {
        initialUrl: 'https://example.com',
        depth: 2,
        allCollectedUrls: ['https://example.com'],
        linkRelationships: [],
        errors: [{ url: 'https://error.com', errorType: 'FetchError', message: 'Failed' }],
        stats: {
          startTime: '2025-01-01T00:00:00.000Z',
          endTime: '2025-01-01T00:01:00.000Z',
          durationMs: 60000,
          totalUrlsScanned: 5,
          totalUrlsCollected: 4,
          maxDepthReached: 1,
        },
        statistics: {
          totalLinks: 4,
          uniqueLinks: 4,
          internalLinks: 4,
          externalLinks: 0,
          linksByDomain: { 'example.com': 4 },
          linksByDepth: { 0: 4 },
          averageLinksPerPage: 1,
          crawlEfficiency: 0.8,
        },
      };

      const analysis = analyzeCrawlEfficiency(mockResult);
      expect(analysis.efficiency).toBe(0.8);
      expect(analysis.errorRate).toBe(20); // 1 error out of 5 scanned
      expect(analysis.successRate).toBe(80);
      expect(analysis.insights).toContain('Maximum depth not reached - possible early termination');
    });
  });

  describe('collect function', () => {
    it('should call collectLinks with proper options', async () => {
      const mockResult: CollectionResult = {
        initialUrl: 'https://example.com',
        depth: 2,
        allCollectedUrls: ['https://example.com'],
        linkRelationships: [],
        errors: [],
        stats: {
          startTime: '2025-01-01T00:00:00.000Z',
          endTime: '2025-01-01T00:01:00.000Z',
          durationMs: 60000,
          totalUrlsScanned: 1,
          totalUrlsCollected: 1,
          maxDepthReached: 1,
        },
      };

      mockCollectLinks.mockResolvedValue(mockResult);

      const result = await collect('https://example.com', {
        depth: 2,
        preset: 'documentation',
        includeStatistics: true,
      });

      expect(mockCollectLinks).toHaveBeenCalledWith('https://example.com', {
        depth: 2,
        filters: expect.any(Array),
      });
      expect(result.statistics).toBeDefined();
    });
  });

  describe('collectMultiple function', () => {
    it('should handle multiple URLs', async () => {
      const mockResult: CollectionResult = {
        initialUrl: 'https://example.com',
        depth: 1,
        allCollectedUrls: ['https://example.com'],
        linkRelationships: [],
        errors: [],
        stats: {
          startTime: '2025-01-01T00:00:00.000Z',
          endTime: '2025-01-01T00:01:00.000Z',
          durationMs: 60000,
          totalUrlsScanned: 1,
          totalUrlsCollected: 1,
          maxDepthReached: 1,
        },
      };

      mockCollectLinks.mockResolvedValue(mockResult);

      const results = await collectMultiple(
        ['https://example.com', 'https://other.com'],
        { depth: 1 },
        2
      );

      expect(results).toHaveLength(2);
      expect(mockCollectLinks).toHaveBeenCalledTimes(2);
    });

    it('should return empty array for empty input', async () => {
      const results = await collectMultiple([], {});
      expect(results).toHaveLength(0);
      expect(mockCollectLinks).not.toHaveBeenCalled();
    });
  });
});
