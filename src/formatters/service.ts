/**
 * Format service implementation
 * Provides high-level API for format conversion operations
 */

import type { CollectionResult } from '../types';
import {
  UnsupportedFormatError,
  ConversionError,
  type FormatService,
  type ConverterRegistry,
} from './types';
import { DefaultConverterRegistry } from './registry';

/**
 * Default implementation of FormatService
 * Uses a ConverterRegistry to manage format converters
 */
export class DefaultFormatService implements FormatService {
  private registry: ConverterRegistry;

  constructor(registry?: ConverterRegistry) {
    this.registry = registry ?? new DefaultConverterRegistry();
  }

  /**
   * Convert data to a specific format
   * @param data The collection result to convert
   * @param formatName The target format name
   * @param options Format-specific options
   * @returns The converted string
   * @throws UnsupportedFormatError if format is not supported
   * @throws ConversionError if conversion fails
   */
  convert<TOptions>(data: CollectionResult, formatName: string, options?: TOptions): string {
    const converter = this.registry.get(formatName);

    if (!converter) {
      throw new UnsupportedFormatError(formatName, this.getAvailableFormats());
    }

    try {
      return converter.convert(data, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ConversionError(formatName, errorMessage);
    }
  }

  /**
   * Get list of available formats
   * @returns Array of available format names
   */
  getAvailableFormats(): string[] {
    return this.registry.list();
  }

  /**
   * Check if a format is supported
   * @param formatName The format to check
   * @returns True if the format is supported
   */
  isFormatSupported(formatName: string): boolean {
    return this.registry.has(formatName);
  }

  /**
   * Get the underlying registry (useful for testing and advanced usage)
   * @returns The converter registry
   */
  getRegistry(): ConverterRegistry {
    return this.registry;
  }

  /**
   * Register a new converter
   * @param converter The converter to register
   */
  registerConverter<TOptions>(converter: import('./types').FormatConverter<TOptions>): void {
    this.registry.register(converter);
  }
}
