/**
 * WebLinkCollector Filter Builder
 * This file provides a builder pattern for creating complex filter configurations.
 */

import { FILTER_PRESETS, type PresetName } from './presets';
import type { FilterConditions, Filter } from './types';

/**
 * Builder class for creating filter configurations using a fluent API
 */
export class FilterBuilder {
  private filters: Filter[] = [];

  /**
   * Add domain filter(s)
   * @param domain - Single domain or array of domains to include
   * @returns This builder instance for chaining
   */
  addDomain(domain: string | string[]): this {
    const domains = Array.isArray(domain) ? domain : [domain];
    this.filters.push({ domain: domains });
    return this;
  }

  /**
   * Add path prefix filter(s)
   * @param pathPrefix - Single path prefix or array of path prefixes to include
   * @returns This builder instance for chaining
   */
  addPathPrefix(pathPrefix: string | string[]): this {
    const pathPrefixes = Array.isArray(pathPrefix) ? pathPrefix : [pathPrefix];
    this.filters.push({ pathPrefix: pathPrefixes });
    return this;
  }

  /**
   * Add keyword filter(s)
   * @param keywords - Single keyword or array of keywords to include
   * @returns This builder instance for chaining
   */
  addKeywords(keywords: string | string[]): this {
    const keywordArray = Array.isArray(keywords) ? keywords : [keywords];
    this.filters.push({ keywords: keywordArray });
    return this;
  }

  /**
   * Add regex filter(s)
   * @param regex - Single regex pattern or array of regex patterns to include
   * @returns This builder instance for chaining
   */
  addRegex(regex: string | string[]): this {
    const regexArray = Array.isArray(regex) ? regex : [regex];
    this.filters.push({ regex: regexArray });
    return this;
  }

  /**
   * Add filters from a preset
   * @param presetName - Name of the preset to include
   * @returns This builder instance for chaining
   */
  fromPreset(presetName: PresetName): this {
    const preset = FILTER_PRESETS[presetName];
    if (preset) {
      this.filters.push(...preset);
    }
    return this;
  }

  /**
   * Add multiple presets at once
   * @param presetNames - Array of preset names to include
   * @returns This builder instance for chaining
   */
  fromPresets(...presetNames: PresetName[]): this {
    for (const presetName of presetNames) {
      this.fromPreset(presetName);
    }
    return this;
  }

  /**
   * Add a custom filter configuration
   * @param filter - Custom filter object
   * @returns This builder instance for chaining
   */
  addCustomFilter(filter: Filter): this {
    this.filters.push({ ...filter });
    return this;
  }

  /**
   * Add multiple custom filter configurations
   * @param filters - Array of custom filter objects
   * @returns This builder instance for chaining
   */
  addCustomFilters(filters: Filter[]): this {
    this.filters.push(...filters.map(f => ({ ...f })));
    return this;
  }

  /**
   * Clear all current filters
   * @returns This builder instance for chaining
   */
  clear(): this {
    this.filters = [];
    return this;
  }

  /**
   * Get the current filter count
   * @returns Number of filters currently configured
   */
  count(): number {
    return this.filters.length;
  }

  /**
   * Check if the builder has any filters
   * @returns True if filters are configured, false otherwise
   */
  hasFilters(): boolean {
    return this.filters.length > 0;
  }

  /**
   * Create a copy of this builder
   * @returns New FilterBuilder instance with the same filters
   */
  clone(): FilterBuilder {
    const newBuilder = new FilterBuilder();
    newBuilder.filters = this.filters.map(f => ({ ...f }));
    return newBuilder;
  }

  /**
   * Build and return the final filter conditions
   * @returns Filter conditions array ready for use with collection functions
   */
  build(): FilterConditions {
    return [...this.filters];
  }

  /**
   * Build and return a JSON representation of the filters
   * @returns JSON string of the filter conditions
   */
  toJSON(): string {
    return JSON.stringify(this.filters, null, 2);
  }

  /**
   * Create a FilterBuilder from JSON
   * @param json - JSON string representing filter conditions
   * @returns New FilterBuilder instance
   */
  static fromJSON(json: string): FilterBuilder {
    const filters = JSON.parse(json) as Filter[];
    const builder = new FilterBuilder();
    builder.filters = filters;
    return builder;
  }
}

/**
 * Create a new FilterBuilder instance
 * @returns New FilterBuilder instance
 */
export function createFilter(): FilterBuilder {
  return new FilterBuilder();
}

/**
 * Create a FilterBuilder from a preset
 * @param presetName - Name of the preset to start with
 * @returns New FilterBuilder instance with preset filters
 */
export function createFilterFromPreset(presetName: PresetName): FilterBuilder {
  return new FilterBuilder().fromPreset(presetName);
}

/**
 * Create a FilterBuilder for multiple presets
 * @param presetNames - Array of preset names to combine
 * @returns New FilterBuilder instance with combined preset filters
 */
export function createFilterFromPresets(...presetNames: PresetName[]): FilterBuilder {
  return new FilterBuilder().fromPresets(...presetNames);
}

/**
 * Create a FilterBuilder for domain-specific filtering
 * @param domains - Domain(s) to filter by
 * @returns New FilterBuilder instance with domain filters
 */
export function createDomainFilter(domains: string | string[]): FilterBuilder {
  return new FilterBuilder().addDomain(domains);
}

/**
 * Create a FilterBuilder for path-specific filtering
 * @param pathPrefixes - Path prefix(es) to filter by
 * @returns New FilterBuilder instance with path prefix filters
 */
export function createPathFilter(pathPrefixes: string | string[]): FilterBuilder {
  return new FilterBuilder().addPathPrefix(pathPrefixes);
}

/**
 * Create a FilterBuilder for keyword-specific filtering
 * @param keywords - Keyword(s) to filter by
 * @returns New FilterBuilder instance with keyword filters
 */
export function createKeywordFilter(keywords: string | string[]): FilterBuilder {
  return new FilterBuilder().addKeywords(keywords);
}

/**
 * Create a FilterBuilder for regex-specific filtering
 * @param regexPatterns - Regex pattern(s) to filter by
 * @returns New FilterBuilder instance with regex filters
 */
export function createRegexFilter(regexPatterns: string | string[]): FilterBuilder {
  return new FilterBuilder().addRegex(regexPatterns);
}
