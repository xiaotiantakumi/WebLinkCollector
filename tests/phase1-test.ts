/**
 * Phase 1 Test - Testing enhanced types and presets
 */

import { describe, it, expect } from 'bun:test';
import { getPresetFilters, getAvailablePresets, combinePresets } from '../src/presets';
import type {
  EnhancedCollectionOptions,
  CollectionStatistics,
  EnhancedCollectionResult,
} from '../src/types';

describe('Phase 1 - Enhanced Types and Presets', () => {
  describe('Filter Presets', () => {
    it('should have all expected presets', () => {
      const presets = getAvailablePresets();
      expect(presets).toContain('documentation');
      expect(presets).toContain('github');
      expect(presets).toContain('blog');
      expect(presets).toContain('ecommerce');
      expect(presets).toContain('social');
      expect(presets).toContain('media');
    });

    it('should return valid filter conditions for documentation preset', () => {
      const filters = getPresetFilters('documentation');
      expect(Array.isArray(filters)).toBe(true);
      expect(filters.length).toBeGreaterThan(0);
      expect(filters[0]).toHaveProperty('domain');
      expect(filters[0]).toHaveProperty('pathPrefix');
      expect(filters[0]).toHaveProperty('keywords');
    });

    it('should combine multiple presets correctly', () => {
      const combined = combinePresets('github', 'documentation');
      expect(Array.isArray(combined)).toBe(true);
      expect(combined.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Enhanced Types', () => {
    it('should allow creating EnhancedCollectionOptions', () => {
      const options: EnhancedCollectionOptions = {
        depth: 2,
        preset: 'documentation',
        includeStatistics: true,
        delayMs: 500,
      };

      expect(options.depth).toBe(2);
      expect(options.preset).toBe('documentation');
      expect(options.includeStatistics).toBe(true);
    });

    it('should allow creating CollectionStatistics', () => {
      const stats: CollectionStatistics = {
        totalLinks: 100,
        uniqueLinks: 80,
        internalLinks: 60,
        externalLinks: 20,
        linksByDomain: { 'example.com': 60, 'other.com': 20 },
        linksByDepth: { 1: 40, 2: 40 },
        averageLinksPerPage: 20,
        crawlEfficiency: 0.8,
      };

      expect(stats.totalLinks).toBe(100);
      expect(stats.crawlEfficiency).toBe(0.8);
    });

    it('should allow creating EnhancedCollectionResult', () => {
      const result: EnhancedCollectionResult = {
        initialUrl: 'https://example.com',
        depth: 2,
        allCollectedUrls: ['https://example.com', 'https://example.com/page'],
        linkRelationships: [{ source: 'https://example.com', found: 'https://example.com/page' }],
        errors: [],
        stats: {
          startTime: '2025-01-01T00:00:00.000Z',
          endTime: '2025-01-01T00:01:00.000Z',
          durationMs: 60000,
          totalUrlsScanned: 2,
          totalUrlsCollected: 2,
          maxDepthReached: 1,
        },
        statistics: {
          totalLinks: 2,
          uniqueLinks: 2,
          internalLinks: 2,
          externalLinks: 0,
          linksByDomain: { 'example.com': 2 },
          linksByDepth: { 1: 2 },
          averageLinksPerPage: 1,
          crawlEfficiency: 1.0,
        },
      };

      expect(result.initialUrl).toBe('https://example.com');
      expect(result.statistics?.totalLinks).toBe(2);
    });
  });
});
