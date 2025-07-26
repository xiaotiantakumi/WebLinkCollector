/**
 * NotebookLM format converter
 * Converts CollectionResult URLs to NotebookLM-compatible format
 */

import type { CollectionResult } from '../../types';
import type { FormatConverter, NotebookLMOptions } from '../types';

/**
 * Converts URLs to NotebookLM format
 * NotebookLM requires URLs to be separated by spaces or newlines without quotes
 */
export class NotebookLMConverter implements FormatConverter<NotebookLMOptions> {
  readonly name = 'notebooklm';
  readonly description =
    'Format URLs for NotebookLM import (space or newline separated, no quotes)';

  /**
   * Convert collection result to NotebookLM format
   * @param data The collection result containing URLs
   * @param options Conversion options
   * @returns URLs formatted for NotebookLM
   */
  convert(data: CollectionResult, options?: NotebookLMOptions): string {
    if (!data) {
      throw new Error('Data is required for conversion');
    }

    if (!Array.isArray(data.allCollectedUrls)) {
      throw new Error('allCollectedUrls must be an array');
    }

    // Handle empty array
    if (data.allCollectedUrls.length === 0) {
      return '';
    }

    // Determine separator
    const separator = this.getSeparator(options?.separator);

    // Validate URLs and join them
    const validUrls = this.validateAndFilterUrls(data.allCollectedUrls);

    return validUrls.join(separator);
  }

  /**
   * Get the appropriate separator based on options
   */
  private getSeparator(separatorOption?: 'space' | 'newline'): string {
    switch (separatorOption) {
      case 'space':
        return ' ';
      case 'newline':
      default:
        return '\n';
    }
  }

  /**
   * Validate and filter URLs
   * Ensures all URLs are strings and filters out invalid ones
   */
  private validateAndFilterUrls(urls: string[]): string[] {
    return urls
      .filter((url): url is string => {
        // Check if URL is a non-empty string
        if (typeof url !== 'string' || url.trim().length === 0) {
          return false;
        }

        // Basic URL validation - should start with http:// or https://
        try {
          const parsedUrl = new URL(url);
          return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
        } catch {
          return false;
        }
      })
      .map(url => url.trim());
  }
}
