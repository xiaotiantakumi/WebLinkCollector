/**
 * Tests for the NotebookLM format converter
 */

import { describe, it, beforeEach, expect } from 'bun:test';
import { NotebookLMConverter } from '../../src/formatters/converters/notebooklm.js';
import type { CollectionResult } from '../../src/types.js';

describe('NotebookLMConverter', () => {
  let converter: NotebookLMConverter;
  let sampleData: CollectionResult;

  beforeEach(() => {
    converter = new NotebookLMConverter();
    sampleData = {
      initialUrl: 'https://example.com',
      depth: 1,
      allCollectedUrls: [
        'https://example.com',
        'https://example.com/page1',
        'https://example.com/page2',
      ],
      linkRelationships: [],
      errors: [],
      stats: {
        startTime: '2025-01-01T00:00:00.000Z',
        endTime: '2025-01-01T00:01:00.000Z',
        durationMs: 60000,
        totalUrlsScanned: 3,
        totalUrlsCollected: 3,
        maxDepthReached: 1,
      },
    };
  });

  describe('converter properties', () => {
    it('should have correct name and description', () => {
      expect(converter.name).toBe('notebooklm');
      expect(converter.description).toContain('NotebookLM');
    });
  });

  describe('convert', () => {
    it('should convert URLs to newline-separated format by default', () => {
      const result = converter.convert(sampleData);
      const expected = [
        'https://example.com',
        'https://example.com/page1',
        'https://example.com/page2',
      ].join('\n');

      expect(result).toBe(expected);
    });

    it('should convert URLs to space-separated format when specified', () => {
      const result = converter.convert(sampleData, { separator: 'space' });
      const expected = [
        'https://example.com',
        'https://example.com/page1',
        'https://example.com/page2',
      ].join(' ');

      expect(result).toBe(expected);
    });

    it('should convert URLs to newline-separated format when explicitly specified', () => {
      const result = converter.convert(sampleData, { separator: 'newline' });
      const expected = [
        'https://example.com',
        'https://example.com/page1',
        'https://example.com/page2',
      ].join('\n');

      expect(result).toBe(expected);
    });

    it('should handle empty URL array', () => {
      const emptyData = { ...sampleData, allCollectedUrls: [] };
      const result = converter.convert(emptyData);
      expect(result).toBe('');
    });

    it('should filter out invalid URLs', () => {
      const dataWithInvalidUrls = {
        ...sampleData,
        allCollectedUrls: [
          'https://example.com',
          '', // empty string
          'not-a-url', // invalid URL
          '   ', // whitespace only
          'https://valid.com',
          'ftp://invalid-protocol.com', // invalid protocol for URL constructor
        ],
      };

      const result = converter.convert(dataWithInvalidUrls);
      expect(result).toBe('https://example.com\nhttps://valid.com');
    });

    it('should trim whitespace from URLs', () => {
      const dataWithWhitespace = {
        ...sampleData,
        allCollectedUrls: ['  https://example.com  ', '\t\nhttps://example.com/page1\n\t'],
      };

      const result = converter.convert(dataWithWhitespace);
      expect(result).toBe('https://example.com\nhttps://example.com/page1');
    });

    it('should throw error when data is null or undefined', () => {
      expect(() => converter.convert(null as any)).toThrow('Data is required for conversion');
      expect(() => converter.convert(undefined as any)).toThrow('Data is required for conversion');
    });

    it('should throw error when allCollectedUrls is not an array', () => {
      const invalidData = { ...sampleData, allCollectedUrls: 'not-an-array' as any };
      expect(() => converter.convert(invalidData)).toThrow('allCollectedUrls must be an array');
    });

    it('should handle real-world Anthropic docs data', () => {
      const anthropicData: CollectionResult = {
        initialUrl: 'https://docs.anthropic.com/ja/docs/claude-code/overview',
        depth: 1,
        allCollectedUrls: [
          'https://docs.anthropic.com/ja/docs/claude-code/overview',
          'https://docs.anthropic.com/ja/docs/claude-code/quickstart',
          'https://docs.anthropic.com/ja/docs/claude-code/common-workflows',
        ],
        linkRelationships: [],
        errors: [],
        stats: {
          startTime: '2025-07-26T08:12:46.585Z',
          endTime: '2025-07-26T08:13:17.833Z',
          durationMs: 31248,
          totalUrlsScanned: 3,
          totalUrlsCollected: 3,
          maxDepthReached: 1,
        },
      };

      const result = converter.convert(anthropicData);
      const lines = result.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe('https://docs.anthropic.com/ja/docs/claude-code/overview');
      expect(lines[1]).toBe('https://docs.anthropic.com/ja/docs/claude-code/quickstart');
      expect(lines[2]).toBe('https://docs.anthropic.com/ja/docs/claude-code/common-workflows');
    });

    it('should handle URLs with special characters', () => {
      const dataWithSpecialChars = {
        ...sampleData,
        allCollectedUrls: [
          'https://example.com/path?query=value&param=test',
          'https://example.com/path#fragment',
          'https://example.com/path%20with%20spaces',
        ],
      };

      const result = converter.convert(dataWithSpecialChars);
      const lines = result.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toContain('query=value');
      expect(lines[1]).toContain('#fragment');
      expect(lines[2]).toContain('%20');
    });
  });
});
