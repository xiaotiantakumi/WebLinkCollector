/**
 * Formatters module index
 * Main entry point for the format conversion system
 */

// Core types and interfaces
export type {
  FormatConverter,
  NotebookLMOptions,
  ConverterRegistry,
  FormatService,
} from './types.js';

export { UnsupportedFormatError, ConversionError } from './types.js';

// Registry and service implementations
export { DefaultConverterRegistry } from './registry.js';
export { DefaultFormatService } from './service.js';

// Available converters
export { NotebookLMConverter } from './converters/index.js';

// Convenience factory function
import { DefaultFormatService } from './service.js';
import { NotebookLMConverter } from './converters/index.js';

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
