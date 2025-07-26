/**
 * Phase 3 Test - Testing FilterBuilder pattern
 */

import { describe, it, expect } from 'bun:test';
import {
  FilterBuilder,
  createFilter,
  createFilterFromPreset,
  createFilterFromPresets,
  createDomainFilter,
  createPathFilter,
  createKeywordFilter,
  createRegexFilter,
} from '../src/builder';

describe('Phase 3 - FilterBuilder Pattern', () => {
  describe('FilterBuilder Class', () => {
    it('should create empty builder', () => {
      const builder = new FilterBuilder();
      expect(builder.count()).toBe(0);
      expect(builder.hasFilters()).toBe(false);
      expect(builder.build()).toEqual([]);
    });

    it('should add domain filters', () => {
      const builder = new FilterBuilder();
      builder.addDomain('example.com');

      expect(builder.count()).toBe(1);
      expect(builder.hasFilters()).toBe(true);

      const filters = builder.build();
      expect(filters[0]).toEqual({ domain: ['example.com'] });
    });

    it('should add multiple domain filters at once', () => {
      const builder = new FilterBuilder();
      builder.addDomain(['example.com', 'github.com']);

      const filters = builder.build();
      expect(filters[0]).toEqual({ domain: ['example.com', 'github.com'] });
    });

    it('should add path prefix filters', () => {
      const builder = new FilterBuilder();
      builder.addPathPrefix('/docs/');

      const filters = builder.build();
      expect(filters[0]).toEqual({ pathPrefix: ['/docs/'] });
    });

    it('should add keyword filters', () => {
      const builder = new FilterBuilder();
      builder.addKeywords(['api', 'documentation']);

      const filters = builder.build();
      expect(filters[0]).toEqual({ keywords: ['api', 'documentation'] });
    });

    it('should add regex filters', () => {
      const builder = new FilterBuilder();
      builder.addRegex('/\\.pdf$/i');

      const filters = builder.build();
      expect(filters[0]).toEqual({ regex: ['/\\.pdf$/i'] });
    });

    it('should chain multiple filter types', () => {
      const builder = new FilterBuilder();
      builder.addDomain('example.com').addPathPrefix('/api/').addKeywords('docs');

      expect(builder.count()).toBe(3);

      const filters = builder.build();
      expect(filters[0]).toEqual({ domain: ['example.com'] });
      expect(filters[1]).toEqual({ pathPrefix: ['/api/'] });
      expect(filters[2]).toEqual({ keywords: ['docs'] });
    });

    it('should add filters from preset', () => {
      const builder = new FilterBuilder();
      builder.fromPreset('documentation');

      expect(builder.count()).toBeGreaterThan(0);
      expect(builder.hasFilters()).toBe(true);

      const filters = builder.build();
      expect(filters[0]).toHaveProperty('domain');
      expect(filters[0]).toHaveProperty('pathPrefix');
      expect(filters[0]).toHaveProperty('keywords');
    });

    it('should add filters from multiple presets', () => {
      const builder = new FilterBuilder();
      builder.fromPresets('github', 'documentation');

      expect(builder.count()).toBeGreaterThanOrEqual(2);

      const filters = builder.build();
      // Should have both GitHub and documentation filters
      expect(filters.length).toBeGreaterThanOrEqual(2);
    });

    it('should add custom filters', () => {
      const customFilter = {
        domain: ['custom.com'],
        pathPrefix: ['/custom/'],
      };

      const builder = new FilterBuilder();
      builder.addCustomFilter(customFilter);

      const filters = builder.build();
      expect(filters[0]).toEqual(customFilter);
    });

    it('should add multiple custom filters', () => {
      const customFilters = [{ domain: ['custom1.com'] }, { domain: ['custom2.com'] }];

      const builder = new FilterBuilder();
      builder.addCustomFilters(customFilters);

      expect(builder.count()).toBe(2);

      const filters = builder.build();
      expect(filters[0]).toEqual({ domain: ['custom1.com'] });
      expect(filters[1]).toEqual({ domain: ['custom2.com'] });
    });

    it('should clear all filters', () => {
      const builder = new FilterBuilder();
      builder.addDomain('example.com').addKeywords('test');

      expect(builder.count()).toBe(2);

      builder.clear();

      expect(builder.count()).toBe(0);
      expect(builder.hasFilters()).toBe(false);
    });

    it('should clone builder', () => {
      const original = new FilterBuilder();
      original.addDomain('example.com').addKeywords('test');

      const cloned = original.clone();

      expect(cloned.count()).toBe(original.count());
      expect(cloned.build()).toEqual(original.build());

      // Ensure they are independent
      cloned.addPathPrefix('/new/');
      expect(cloned.count()).toBe(3);
      expect(original.count()).toBe(2);
    });

    it('should convert to/from JSON', () => {
      const builder = new FilterBuilder();
      builder.addDomain('example.com').addKeywords('test');

      const json = builder.toJSON();
      expect(json).toContain('example.com');
      expect(json).toContain('test');

      const newBuilder = FilterBuilder.fromJSON(json);
      expect(newBuilder.count()).toBe(builder.count());
      expect(newBuilder.build()).toEqual(builder.build());
    });
  });

  describe('Helper Functions', () => {
    it('should create filter with createFilter', () => {
      const builder = createFilter();
      expect(builder).toBeInstanceOf(FilterBuilder);
      expect(builder.count()).toBe(0);
    });

    it('should create filter from preset', () => {
      const builder = createFilterFromPreset('documentation');
      expect(builder.count()).toBeGreaterThan(0);

      const filters = builder.build();
      expect(filters[0]).toHaveProperty('domain');
    });

    it('should create filter from multiple presets', () => {
      const builder = createFilterFromPresets('github', 'blog');
      expect(builder.count()).toBeGreaterThanOrEqual(2);
    });

    it('should create domain filter', () => {
      const builder = createDomainFilter('example.com');
      const filters = builder.build();
      expect(filters[0]).toEqual({ domain: ['example.com'] });
    });

    it('should create domain filter with multiple domains', () => {
      const builder = createDomainFilter(['example.com', 'github.com']);
      const filters = builder.build();
      expect(filters[0]).toEqual({ domain: ['example.com', 'github.com'] });
    });

    it('should create path filter', () => {
      const builder = createPathFilter('/docs/');
      const filters = builder.build();
      expect(filters[0]).toEqual({ pathPrefix: ['/docs/'] });
    });

    it('should create keyword filter', () => {
      const builder = createKeywordFilter(['api', 'docs']);
      const filters = builder.build();
      expect(filters[0]).toEqual({ keywords: ['api', 'docs'] });
    });

    it('should create regex filter', () => {
      const builder = createRegexFilter('/\\.pdf$/i');
      const filters = builder.build();
      expect(filters[0]).toEqual({ regex: ['/\\.pdf$/i'] });
    });
  });

  describe('Complex Filter Building', () => {
    it('should build complex filters with chaining', () => {
      const builder = createFilter()
        .fromPreset('documentation')
        .addDomain('custom.com')
        .addPathPrefix('/special/')
        .addKeywords('important')
        .addRegex('/\\.md$/');

      expect(builder.count()).toBeGreaterThanOrEqual(5);

      const filters = builder.build();
      // Should have at least preset + 4 additional filters
      expect(filters.length).toBeGreaterThanOrEqual(5);
    });

    it('should combine presets with custom filters', () => {
      const builder = createFilterFromPresets('github', 'documentation')
        .addDomain('mysite.com')
        .addCustomFilter({
          pathPrefix: ['/v1/', '/v2/'],
          keywords: ['version'],
        });

      expect(builder.count()).toBeGreaterThanOrEqual(4);

      const filters = builder.build();
      // Should contain preset filters plus custom ones
      expect(filters.length).toBeGreaterThanOrEqual(4);
    });
  });
});
