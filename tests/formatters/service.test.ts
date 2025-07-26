/**
 * Tests for the format service
 */

import { describe, it, beforeEach, expect } from 'bun:test';
import { DefaultFormatService } from '../../src/formatters/service.js';
import { DefaultConverterRegistry } from '../../src/formatters/registry.js';
import {
  UnsupportedFormatError,
  ConversionError,
  type FormatConverter,
} from '../../src/formatters/types.js';
import type { CollectionResult } from '../../src/types.js';

describe('DefaultFormatService', () => {
  let service: DefaultFormatService;
  let registry: DefaultConverterRegistry;
  let mockConverter: FormatConverter;
  let sampleData: CollectionResult;

  beforeEach(() => {
    registry = new DefaultConverterRegistry();
    service = new DefaultFormatService(registry);

    mockConverter = {
      name: 'test-format',
      description: 'Test format converter',
      convert: (data: CollectionResult) => data.allCollectedUrls.join(','),
    };

    sampleData = {
      initialUrl: 'https://example.com',
      depth: 1,
      allCollectedUrls: ['https://example.com', 'https://example.com/page1'],
      linkRelationships: [],
      errors: [],
      stats: {
        startTime: '2025-01-01T00:00:00.000Z',
        endTime: '2025-01-01T00:01:00.000Z',
        durationMs: 60000,
        totalUrlsScanned: 2,
        totalUrlsCollected: 2,
        maxDepthReached: 1,
      },
    };
  });

  describe('constructor', () => {
    it('should create with provided registry', () => {
      const customRegistry = new DefaultConverterRegistry();
      const customService = new DefaultFormatService(customRegistry);
      expect(customService.getRegistry()).toBe(customRegistry);
    });

    it('should create with default registry when none provided', () => {
      const defaultService = new DefaultFormatService();
      expect(defaultService.getRegistry()).toBeInstanceOf(DefaultConverterRegistry);
    });
  });

  describe('convert', () => {
    beforeEach(() => {
      service.registerConverter(mockConverter);
    });

    it('should convert data using registered converter', () => {
      const result = service.convert(sampleData, 'test-format');
      expect(result).toBe('https://example.com,https://example.com/page1');
    });

    it('should pass options to converter', () => {
      const optionsConverter: FormatConverter<{ separator: string }> = {
        name: 'options-format',
        description: 'Format with options',
        convert: (data, options) => data.allCollectedUrls.join(options?.separator || ','),
      };

      service.registerConverter(optionsConverter);
      const result = service.convert(sampleData, 'options-format', { separator: '|' });
      expect(result).toBe('https://example.com|https://example.com/page1');
    });

    it('should throw UnsupportedFormatError for non-existent format', () => {
      expect(() => service.convert(sampleData, 'non-existent')).toThrow(UnsupportedFormatError);
      expect(() => service.convert(sampleData, 'non-existent')).toThrow(
        'Unsupported format: "non-existent". Available formats: test-format'
      );
    });

    it('should throw ConversionError when converter throws', () => {
      const errorConverter: FormatConverter = {
        name: 'error-format',
        description: 'Format that throws errors',
        convert: () => {
          throw new Error('Conversion failed');
        },
      };

      service.registerConverter(errorConverter);
      expect(() => service.convert(sampleData, 'error-format')).toThrow(ConversionError);
      expect(() => service.convert(sampleData, 'error-format')).toThrow(
        'Failed to convert to error-format format: Conversion failed'
      );
    });

    it('should handle non-Error exceptions from converter', () => {
      const errorConverter: FormatConverter = {
        name: 'string-error-format',
        description: 'Format that throws string errors',
        convert: () => {
          throw 'String error';
        },
      };

      service.registerConverter(errorConverter);
      expect(() => service.convert(sampleData, 'string-error-format')).toThrow(
        'Failed to convert to string-error-format format: String error'
      );
    });
  });

  describe('getAvailableFormats', () => {
    it('should return empty array when no converters registered', () => {
      const formats = service.getAvailableFormats();
      expect(formats).toEqual([]);
    });

    it('should return all registered format names', () => {
      service.registerConverter(mockConverter);
      const secondConverter = { ...mockConverter, name: 'second-format' };
      service.registerConverter(secondConverter);

      const formats = service.getAvailableFormats();
      expect(formats).toContain('test-format');
      expect(formats).toContain('second-format');
      expect(formats).toHaveLength(2);
    });
  });

  describe('isFormatSupported', () => {
    beforeEach(() => {
      service.registerConverter(mockConverter);
    });

    it('should return true for registered format', () => {
      expect(service.isFormatSupported('test-format')).toBe(true);
    });

    it('should return false for non-existent format', () => {
      expect(service.isFormatSupported('non-existent')).toBe(false);
    });
  });

  describe('registerConverter', () => {
    it('should register converter successfully', () => {
      service.registerConverter(mockConverter);
      expect(service.isFormatSupported('test-format')).toBe(true);
    });

    it('should throw error when registering duplicate converter', () => {
      service.registerConverter(mockConverter);
      expect(() => service.registerConverter(mockConverter)).toThrow(
        'Converter "test-format" is already registered'
      );
    });
  });

  describe('getRegistry', () => {
    it('should return the underlying registry', () => {
      expect(service.getRegistry()).toBe(registry);
    });
  });
});
