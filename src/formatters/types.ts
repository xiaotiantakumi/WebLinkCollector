/**
 * Format converter interfaces and types
 * Defines the contract for implementing format converters following SOLID principles.
 */

import type { CollectionResult } from '../types';

/**
 * Base interface for all format converters
 * Each converter is responsible for transforming CollectionResult data into a specific format
 */
export interface FormatConverter<TOptions = any> {
  /** Unique identifier for the converter */
  readonly name: string;

  /** Human-readable description of the format */
  readonly description: string;

  /**
   * Convert CollectionResult data to the target format
   * @param data The collection result to convert
   * @param options Format-specific options
   * @returns The formatted string output
   */
  convert(data: CollectionResult, options?: TOptions): string;
}

/**
 * Options for NotebookLM format conversion
 */
export interface NotebookLMOptions {
  /** Separator between URLs - either space or newline (default: newline) */
  separator?: 'space' | 'newline';
}

/**
 * Registry interface for managing format converters
 * Provides registration and retrieval of converters by name
 */
export interface ConverterRegistry {
  /**
   * Register a new format converter
   * @param converter The converter to register
   */
  register<TOptions>(converter: FormatConverter<TOptions>): void;

  /**
   * Get a converter by name
   * @param name The converter name
   * @returns The converter if found, undefined otherwise
   */
  get(name: string): FormatConverter | undefined;

  /**
   * List all registered converter names
   * @returns Array of converter names
   */
  list(): string[];

  /**
   * Check if a converter is registered
   * @param name The converter name to check
   * @returns True if the converter exists
   */
  has(name: string): boolean;
}

/**
 * Service interface for format conversion operations
 * Provides high-level API for converting data to various formats
 */
export interface FormatService {
  /**
   * Convert data to a specific format
   * @param data The collection result to convert
   * @param formatName The target format name
   * @param options Format-specific options
   * @returns The converted string
   * @throws Error if format is not supported
   */
  convert<TOptions>(data: CollectionResult, formatName: string, options?: TOptions): string;

  /**
   * Get list of available formats
   * @returns Array of available format names
   */
  getAvailableFormats(): string[];

  /**
   * Check if a format is supported
   * @param formatName The format to check
   * @returns True if the format is supported
   */
  isFormatSupported(formatName: string): boolean;
}

/**
 * Error thrown when an unsupported format is requested
 */
export class UnsupportedFormatError extends Error {
  constructor(formatName: string, availableFormats: string[]) {
    super(`Unsupported format: "${formatName}". Available formats: ${availableFormats.join(', ')}`);
    this.name = 'UnsupportedFormatError';
  }
}

/**
 * Error thrown when format conversion fails
 */
export class ConversionError extends Error {
  constructor(formatName: string, cause: string) {
    super(`Failed to convert to ${formatName} format: ${cause}`);
    this.name = 'ConversionError';
  }
}
