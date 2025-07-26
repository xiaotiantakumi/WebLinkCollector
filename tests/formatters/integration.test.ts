/**
 * Integration tests for the format conversion system
 */

import { describe, it, beforeEach, expect } from 'bun:test';
import { createFormatService } from '../../src/formatters/index.js';
import type { CollectionResult } from '../../src/types.js';

describe('Format Conversion Integration', () => {
  let sampleData: CollectionResult;
  let realAnthropicData: CollectionResult;

  beforeEach(() => {
    sampleData = {
      initialUrl: 'https://example.com',
      depth: 2,
      allCollectedUrls: [
        'https://example.com',
        'https://example.com/docs',
        'https://example.com/api',
        'https://api.example.com/v1',
      ],
      linkRelationships: [
        { source: 'https://example.com', found: 'https://example.com/docs' },
        { source: 'https://example.com', found: 'https://example.com/api' },
        { source: 'https://example.com/api', found: 'https://api.example.com/v1' },
      ],
      errors: [],
      stats: {
        startTime: '2025-01-01T00:00:00.000Z',
        endTime: '2025-01-01T00:01:30.000Z',
        durationMs: 90000,
        totalUrlsScanned: 4,
        totalUrlsCollected: 4,
        maxDepthReached: 2,
      },
    };

    // Real data from the Anthropic docs example
    realAnthropicData = {
      initialUrl: 'https://docs.anthropic.com/ja/docs/claude-code/overview',
      depth: 1,
      allCollectedUrls: [
        'https://docs.anthropic.com/ja/docs/claude-code/overview',
        'https://docs.anthropic.com/ja/docs/claude-code/quickstart',
        'https://docs.anthropic.com/ja/docs/claude-code/common-workflows',
        'https://docs.anthropic.com/ja/docs/claude-code/sdk',
        'https://docs.anthropic.com/ja/docs/claude-code/hooks-guide',
      ],
      linkRelationships: [
        {
          source: 'https://docs.anthropic.com/ja/docs/claude-code/overview',
          found: 'https://docs.anthropic.com/ja/docs/claude-code/quickstart',
        },
        {
          source: 'https://docs.anthropic.com/ja/docs/claude-code/overview',
          found: 'https://docs.anthropic.com/ja/docs/claude-code/common-workflows',
        },
      ],
      errors: [],
      stats: {
        startTime: '2025-07-26T08:12:46.585Z',
        endTime: '2025-07-26T08:13:17.833Z',
        durationMs: 31248,
        totalUrlsScanned: 5,
        totalUrlsCollected: 5,
        maxDepthReached: 1,
      },
    };
  });

  describe('createFormatService', () => {
    it('should create service with all built-in converters', () => {
      const service = createFormatService();
      const formats = service.getAvailableFormats();

      expect(formats).toContain('notebooklm');
      expect(formats.length).toBeGreaterThan(0);
    });

    it('should be ready to use immediately', () => {
      const service = createFormatService();

      expect(service.isFormatSupported('notebooklm')).toBe(true);
      expect(() => service.convert(sampleData, 'notebooklm')).not.toThrow();
    });
  });

  describe('NotebookLM format with real data', () => {
    it('should convert sample data to NotebookLM format with newlines', () => {
      const service = createFormatService();
      const result = service.convert(sampleData, 'notebooklm');

      const expectedUrls = [
        'https://example.com',
        'https://example.com/docs',
        'https://example.com/api',
        'https://api.example.com/v1',
      ];

      expect(result).toBe(expectedUrls.join('\n'));

      // Verify it's properly formatted for NotebookLM
      const lines = result.split('\n');
      expect(lines).toHaveLength(4);
      lines.forEach(line => {
        expect(line).toMatch(/^https:\/\//);
        expect(line).not.toMatch(/^"/); // No quotes
        expect(line).not.toMatch(/"$/); // No quotes
      });
    });

    it('should convert sample data to NotebookLM format with spaces', () => {
      const service = createFormatService();
      const result = service.convert(sampleData, 'notebooklm', { separator: 'space' });

      const expectedUrls = [
        'https://example.com',
        'https://example.com/docs',
        'https://example.com/api',
        'https://api.example.com/v1',
      ];

      expect(result).toBe(expectedUrls.join(' '));
      expect(result).not.toContain('\n');
    });

    it('should convert real Anthropic data to NotebookLM format', () => {
      const service = createFormatService();
      const result = service.convert(realAnthropicData, 'notebooklm');

      const lines = result.split('\n');
      expect(lines).toHaveLength(5);
      expect(lines[0]).toBe('https://docs.anthropic.com/ja/docs/claude-code/overview');
      expect(lines[1]).toBe('https://docs.anthropic.com/ja/docs/claude-code/quickstart');
      expect(lines[4]).toBe('https://docs.anthropic.com/ja/docs/claude-code/hooks-guide');

      // Verify no quotes
      lines.forEach(line => {
        expect(line).not.toMatch(/^"/);
        expect(line).not.toMatch(/"$/);
      });
    });
  });

  describe('Error handling with real scenarios', () => {
    it('should handle empty URL collections gracefully', () => {
      const emptyData = { ...sampleData, allCollectedUrls: [] };
      const service = createFormatService();

      const result = service.convert(emptyData, 'notebooklm');
      expect(result).toBe('');
    });

    it('should filter out malformed URLs from real data', () => {
      const dataWithBadUrls = {
        ...sampleData,
        allCollectedUrls: [
          'https://valid.com',
          '', // empty
          'not-a-url', // invalid
          'https://another-valid.com',
          '   ', // whitespace
        ],
      };

      const service = createFormatService();
      const result = service.convert(dataWithBadUrls, 'notebooklm');

      expect(result).toBe('https://valid.com\nhttps://another-valid.com');
    });

    it('should throw meaningful errors for unsupported formats', () => {
      const service = createFormatService();

      expect(() => service.convert(sampleData, 'csv')).toThrow(
        'Unsupported format: "csv". Available formats: notebooklm'
      );
    });
  });

  describe('Extensibility demonstration', () => {
    it('should allow adding custom converters', () => {
      const service = createFormatService();

      // Add a custom CSV converter
      const csvConverter = {
        name: 'csv',
        description: 'Comma-separated values format',
        convert: (data: CollectionResult) => {
          const header = 'URL';
          const rows = data.allCollectedUrls.map(url => `"${url}"`);
          return [header, ...rows].join('\n');
        },
      };

      service.registerConverter(csvConverter);

      expect(service.isFormatSupported('csv')).toBe(true);

      const result = service.convert(sampleData, 'csv');
      const lines = result.split('\n');
      expect(lines[0]).toBe('URL');
      expect(lines[1]).toBe('"https://example.com"');
    });

    it('should maintain separation between formats', () => {
      const service = createFormatService();

      // NotebookLM format should not have quotes
      const notebookResult = service.convert(sampleData, 'notebooklm');
      expect(notebookResult).not.toContain('"');

      // Add CSV format that does have quotes
      const csvConverter = {
        name: 'csv',
        description: 'CSV format with quotes',
        convert: (data: CollectionResult) => data.allCollectedUrls.map(url => `"${url}"`).join(','),
      };

      service.registerConverter(csvConverter);

      const csvResult = service.convert(sampleData, 'csv');
      expect(csvResult).toContain('"');

      // Original format should remain unchanged
      const notebookResult2 = service.convert(sampleData, 'notebooklm');
      expect(notebookResult2).toBe(notebookResult);
    });
  });
});
