/**
 * Integration Test - Testing the complete enhanced API
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import {
  collect,
  collectMultiple,
  collectDocs,
  collectGitHub,
  FILTER_PRESETS,
  createFilter,
  createFilterFromPreset,
  calculateStatistics,
  exportResults,
  analyzeCrawlEfficiency,
} from '../src/index';
import type { CollectionResult } from '../src/types';

// Mock the core collectLinks function
const mockCollectLinks = mock();

// Mock the main collectLinks import
mock.module('../src/index', () => ({
  ...require('../src/index'),
  collectLinks: mockCollectLinks,
}));

describe('Integration Test - Complete Enhanced API', () => {
  let mockResult: CollectionResult;

  beforeEach(() => {
    mockCollectLinks.mockClear();

    // Standard mock result
    mockResult = {
      initialUrl: 'https://example.com',
      depth: 2,
      allCollectedUrls: [
        'https://example.com',
        'https://example.com/docs',
        'https://example.com/api',
        'https://github.com/user/repo',
        'https://docs.example.com/guide',
      ],
      linkRelationships: [
        { source: 'https://example.com', found: 'https://example.com/docs' },
        { source: 'https://example.com', found: 'https://example.com/api' },
        { source: 'https://example.com', found: 'https://github.com/user/repo' },
        { source: 'https://example.com/docs', found: 'https://docs.example.com/guide' },
      ],
      errors: [],
      stats: {
        startTime: '2025-01-01T00:00:00.000Z',
        endTime: '2025-01-01T00:01:00.000Z',
        durationMs: 60000,
        totalUrlsScanned: 5,
        totalUrlsCollected: 5,
        maxDepthReached: 2,
      },
    };

    mockCollectLinks.mockResolvedValue(mockResult);
  });

  describe('Enhanced Collect Function', () => {
    it('should work with presets', async () => {
      const result = await collect('https://docs.example.com', {
        depth: 2,
        preset: 'documentation',
        includeStatistics: true,
      });

      expect(mockCollectLinks).toHaveBeenCalledWith('https://docs.example.com', {
        depth: 2,
        filters: expect.any(Array),
      });

      expect(result.statistics).toBeDefined();
      expect(result.statistics!.totalLinks).toBe(5);
      expect(result.statistics!.uniqueLinks).toBe(5);
    });

    it('should combine presets with additional filters', async () => {
      const result = await collect('https://example.com', {
        depth: 1,
        preset: 'github',
        additionalFilters: [{ domain: ['custom.com'] }],
        includeStatistics: true,
      });

      expect(mockCollectLinks).toHaveBeenCalledWith('https://example.com', {
        depth: 1,
        filters: expect.arrayContaining([
          expect.objectContaining({ domain: expect.arrayContaining(['github.com']) }),
          expect.objectContaining({ domain: ['custom.com'] }),
        ]),
      });

      expect(result.statistics).toBeDefined();
    });

    it('should work without statistics', async () => {
      const result = await collect('https://example.com', {
        depth: 1,
        includeStatistics: false,
      });

      expect(result.statistics).toBeUndefined();
    });
  });

  describe('Convenience Functions', () => {
    it('should work with collectDocs', async () => {
      const result = await collectDocs('https://docs.example.com');

      expect(mockCollectLinks).toHaveBeenCalledWith('https://docs.example.com', {
        depth: 2,
        delayMs: 500,
        filters: expect.any(Array),
      });

      expect(result.statistics).toBeDefined();
    });

    it('should work with collectGitHub', async () => {
      const result = await collectGitHub('https://github.com/user/repo');

      expect(mockCollectLinks).toHaveBeenCalledWith('https://github.com/user/repo', {
        depth: 2,
        delayMs: 1000,
        filters: expect.any(Array),
      });

      expect(result.statistics).toBeDefined();
    });

    it('should work with collectMultiple', async () => {
      const urls = ['https://example.com', 'https://other.com'];
      const results = await collectMultiple(urls, { depth: 1 }, 2);

      expect(results).toHaveLength(2);
      expect(mockCollectLinks).toHaveBeenCalledTimes(2);
      expect(results[0].statistics).toBeDefined();
      expect(results[1].statistics).toBeDefined();
    });
  });

  describe('Filter Builder Integration', () => {
    it('should work with simple filter builder', async () => {
      const filters = createFilter().addDomain('example.com').addPathPrefix('/api/').build();

      const result = await collect('https://example.com', {
        depth: 1,
        additionalFilters: filters,
      });

      expect(mockCollectLinks).toHaveBeenCalledWith('https://example.com', {
        depth: 1,
        filters: expect.arrayContaining([
          expect.objectContaining({ domain: ['example.com'] }),
          expect.objectContaining({ pathPrefix: ['/api/'] }),
        ]),
      });

      expect(result).toBeDefined();
    });

    it('should work with preset-based filter builder', async () => {
      const filters = createFilterFromPreset('documentation').addDomain('custom.com').build();

      const result = await collect('https://example.com', {
        depth: 1,
        additionalFilters: filters,
      });

      expect(mockCollectLinks).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('Statistics and Analysis', () => {
    it('should calculate comprehensive statistics', async () => {
      const result = await collect('https://example.com', {
        depth: 2,
        includeStatistics: true,
      });

      const stats = result.statistics!;
      expect(stats.totalLinks).toBe(5);
      expect(stats.uniqueLinks).toBe(5);
      expect(stats.internalLinks).toBe(3); // example.com domain
      expect(stats.externalLinks).toBe(2); // github.com and docs.example.com
      expect(Object.keys(stats.linksByDomain)).toContain('example.com');
      expect(Object.keys(stats.linksByDomain)).toContain('github.com');
      expect(Object.keys(stats.linksByDomain)).toContain('docs.example.com');
      expect(stats.crawlEfficiency).toBe(1.0);
    });

    it('should analyze crawl efficiency', async () => {
      const result = await collect('https://example.com', {
        depth: 2,
        includeStatistics: true,
      });

      const analysis = analyzeCrawlEfficiency(result);
      expect(analysis.efficiency).toBe(1.0);
      expect(analysis.successRate).toBe(100);
      expect(analysis.errorRate).toBe(0);
      expect(analysis.insights).toContain('High crawl efficiency - filters are well-tuned');
    });

    it('should export results in JSON format', async () => {
      const result = await collect('https://example.com', {
        depth: 1,
        includeStatistics: true,
      });

      const exported = exportResults(result, 'json');
      const parsed = JSON.parse(exported);

      expect(parsed.totalCrawls).toBe(1);
      expect(parsed.results[0].initialUrl).toBe('https://example.com');
      expect(parsed.results[0].statistics).toBeDefined();
    });

    it('should export results in CSV format', async () => {
      const result = await collect('https://example.com', {
        depth: 1,
        includeStatistics: true,
      });

      const exported = exportResults(result, 'csv');
      const lines = exported.split('\n');

      expect(lines[0]).toContain('URL');
      expect(lines[0]).toContain('Total Links');
      expect(lines[1]).toContain('https://example.com');
    });
  });

  describe('Error Handling', () => {
    it('should handle collection errors gracefully', async () => {
      mockCollectLinks.mockRejectedValue(new Error('Network error'));

      await expect(collect('https://example.com', { depth: 1 })).rejects.toThrow('Network error');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain backward compatibility with original API', () => {
      // Verify original exports are still available
      expect(FILTER_PRESETS).toBeDefined();
      expect(typeof collect).toBe('function');
      expect(typeof collectMultiple).toBe('function');
      expect(typeof createFilter).toBe('function');
      expect(typeof calculateStatistics).toBe('function');
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should handle documentation crawling scenario', async () => {
      const result = await collectDocs('https://docs.example.com', 3);

      expect(mockCollectLinks).toHaveBeenCalledWith('https://docs.example.com', {
        depth: 3,
        delayMs: 500,
        filters: expect.any(Array),
      });

      expect(result.statistics).toBeDefined();
      expect(Object.keys(result.statistics!.linksByDomain)).toContain('example.com');
    });

    it('should handle multi-site analysis scenario', async () => {
      const sites = [
        'https://docs.example.com',
        'https://api.example.com',
        'https://blog.example.com',
      ];

      const results = await collectMultiple(
        sites,
        {
          preset: 'documentation',
          depth: 2,
        },
        3
      );

      expect(results).toHaveLength(3);
      expect(mockCollectLinks).toHaveBeenCalledTimes(3);

      // Verify each result has statistics
      results.forEach(result => {
        expect(result.statistics).toBeDefined();
        expect(result.statistics!.totalLinks).toBeGreaterThan(0);
      });
    });

    it('should handle complex filter building scenario', async () => {
      const complexFilters = createFilter()
        .fromPreset('documentation')
        .addDomain(['internal.com', 'trusted.com'])
        .addPathPrefix(['/v1/', '/v2/', '/latest/'])
        .addKeywords(['api', 'reference', 'guide'])
        .addRegex(['/\\.(md|html)$/i'])
        .build();

      const result = await collect('https://internal.com', {
        depth: 3,
        additionalFilters: complexFilters,
        delayMs: 800,
      });

      expect(mockCollectLinks).toHaveBeenCalledWith('https://internal.com', {
        depth: 3,
        delayMs: 800,
        filters: expect.any(Array),
      });

      expect(result.statistics).toBeDefined();
    });
  });
});
