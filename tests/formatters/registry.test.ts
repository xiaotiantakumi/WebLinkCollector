/**
 * Tests for the converter registry
 */

import { describe, it, beforeEach, expect } from 'bun:test';
import { DefaultConverterRegistry } from '../../src/formatters/registry.js';
import type { FormatConverter } from '../../src/formatters/types.js';
import type { CollectionResult } from '../../src/types.js';

describe('DefaultConverterRegistry', () => {
  let registry: DefaultConverterRegistry;
  let mockConverter: FormatConverter;

  beforeEach(() => {
    registry = new DefaultConverterRegistry();
    mockConverter = {
      name: 'test-converter',
      description: 'Test converter for unit tests',
      convert: (data: CollectionResult) => data.allCollectedUrls.join(','),
    };
  });

  describe('register', () => {
    it('should register a converter successfully', () => {
      registry.register(mockConverter);
      expect(registry.has('test-converter')).toBe(true);
      expect(registry.size()).toBe(1);
    });

    it('should throw error when registering duplicate converter', () => {
      registry.register(mockConverter);
      expect(() => registry.register(mockConverter)).toThrow(
        'Converter "test-converter" is already registered'
      );
    });
  });

  describe('get', () => {
    it('should return registered converter', () => {
      registry.register(mockConverter);
      const retrieved = registry.get('test-converter');
      expect(retrieved).toBe(mockConverter);
    });

    it('should return undefined for non-existent converter', () => {
      const retrieved = registry.get('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should return empty array when no converters registered', () => {
      const list = registry.list();
      expect(list).toEqual([]);
    });

    it('should return all registered converter names', () => {
      const converter2 = { ...mockConverter, name: 'second-converter' };
      registry.register(mockConverter);
      registry.register(converter2);

      const list = registry.list();
      expect(list).toContain('test-converter');
      expect(list).toContain('second-converter');
      expect(list).toHaveLength(2);
    });
  });

  describe('has', () => {
    it('should return true for registered converter', () => {
      registry.register(mockConverter);
      expect(registry.has('test-converter')).toBe(true);
    });

    it('should return false for non-existent converter', () => {
      expect(registry.has('non-existent')).toBe(false);
    });
  });

  describe('unregister', () => {
    it('should remove registered converter', () => {
      registry.register(mockConverter);
      expect(registry.has('test-converter')).toBe(true);

      const result = registry.unregister('test-converter');
      expect(result).toBe(true);
      expect(registry.has('test-converter')).toBe(false);
    });

    it('should return false when removing non-existent converter', () => {
      const result = registry.unregister('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all converters', () => {
      const converter2 = { ...mockConverter, name: 'second-converter' };
      registry.register(mockConverter);
      registry.register(converter2);
      expect(registry.size()).toBe(2);

      registry.clear();
      expect(registry.size()).toBe(0);
      expect(registry.list()).toEqual([]);
    });
  });

  describe('size', () => {
    it('should return correct count of registered converters', () => {
      expect(registry.size()).toBe(0);

      registry.register(mockConverter);
      expect(registry.size()).toBe(1);

      const converter2 = { ...mockConverter, name: 'second-converter' };
      registry.register(converter2);
      expect(registry.size()).toBe(2);
    });
  });
});
