/**
 * Formatters module index
 * Main entry point for the format conversion system
 */

// Core types and interfaces
export type { FormatConverter, NotebookLMOptions, ConverterRegistry, FormatService } from './types';

export { UnsupportedFormatError, ConversionError } from './types';

// Registry and service implementations
export { DefaultConverterRegistry } from './registry';
export { DefaultFormatService } from './service';

// Available converters
export { NotebookLMConverter } from './converters/index';

// Convenience factory function
import { DefaultFormatService } from './service';
import { NotebookLMConverter } from './converters/index';

/**
 * Create a format service with all built-in converters registered
 * @returns Configured format service ready to use
 */
export function createFormatService(): DefaultFormatService {
  const service = new DefaultFormatService();

  // Register built-in converters
  service.registerConverter(new NotebookLMConverter());

  return service;
}
