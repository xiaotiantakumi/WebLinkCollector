/**
 * Format converter registry implementation
 * Manages registration and retrieval of format converters
 */

import type { FormatConverter, ConverterRegistry } from './types.js';

/**
 * Default implementation of ConverterRegistry
 * Stores converters in a Map for efficient lookup
 */
export class DefaultConverterRegistry implements ConverterRegistry {
  private converters = new Map<string, FormatConverter>();

  /**
   * Register a new format converter
   * @param converter The converter to register
   * @throws Error if a converter with the same name already exists
   */
  register<TOptions>(converter: FormatConverter<TOptions>): void {
    if (this.converters.has(converter.name)) {
      throw new Error(`Converter "${converter.name}" is already registered`);
    }

    this.converters.set(converter.name, converter);
  }

  /**
   * Get a converter by name
   * @param name The converter name
   * @returns The converter if found, undefined otherwise
   */
  get(name: string): FormatConverter | undefined {
    return this.converters.get(name);
  }

  /**
   * List all registered converter names
   * @returns Array of converter names
   */
  list(): string[] {
    return Array.from(this.converters.keys());
  }

  /**
   * Check if a converter is registered
   * @param name The converter name to check
   * @returns True if the converter exists
   */
  has(name: string): boolean {
    return this.converters.has(name);
  }

  /**
   * Unregister a converter (useful for testing)
   * @param name The converter name to remove
   * @returns True if the converter was removed, false if it didn't exist
   */
  unregister(name: string): boolean {
    return this.converters.delete(name);
  }

  /**
   * Clear all registered converters (useful for testing)
   */
  clear(): void {
    this.converters.clear();
  }

  /**
   * Get the number of registered converters
   */
  size(): number {
    return this.converters.size;
  }
}
