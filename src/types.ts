/**
 * WebLinkCollector Types
 * This file contains all shared type definitions for the WebLinkCollector project.
 */

/**
 * Log levels for the logger
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

/**
 * Logger interface
 */
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

/**
 * Parameters for the main collection function
 */
export interface InitialUrlParams {
  initialUrl: string;
  depth: number;
  filters?: FilterConditions;
  selector?: string;
  element?: string;
  delayMs?: number;
  logLevel?: LogLevel;
}

/**
 * Structure for a single filter condition
 */
export interface Filter {
  domain?: string | string[];
  pathPrefix?: string | string[];
  regex?: string | string[];
  keywords?: string | string[];
}

/**
 * Alias for an array of Filter objects
 */
export type FilterConditions = Filter[];

/**
 * Structure for a collected link with its source
 */
export interface CollectedLink {
  url: string;
  source: string;
}

/**
 * Relationship between source URL and found URL
 */
export interface LinkRelationship {
  source: string;
  found: string;
}

/**
 * Error entry structure
 */
export interface ErrorEntry {
  url: string;
  errorType: string;
  message: string;
}

/**
 * Statistical information about the collection process
 */
export interface Stats {
  startTime: string;
  endTime: string;
  durationMs: number;
  totalUrlsScanned: number;
  totalUrlsCollected: number;
  maxDepthReached: number;
}

/**
 * The final JSON output structure
 */
export interface CollectionResult {
  initialUrl: string;
  depth: number;
  allCollectedUrls: string[];
  linkRelationships: LinkRelationship[];
  errors: ErrorEntry[];
  stats: Stats;
}

/**
 * Options for the main collection function (re-exported for convenience)
 */
export interface CollectionOptions {
  depth: number;
  filters?: FilterConditions;
  selector?: string;
  element?: string;
  delayMs?: number;
  logLevel?: LogLevel;
}

/**
 * Enhanced collection options with presets and additional features
 */
export interface EnhancedCollectionOptions {
  depth?: number;
  filters?: FilterConditions;
  selector?: string;
  element?: string;
  delayMs?: number;
  logLevel?: LogLevel;
  preset?: string;
  additionalFilters?: FilterConditions;
  includeStatistics?: boolean;
  userAgent?: string;
  timeout?: number;
}

/**
 * Detailed statistics about the collection process
 */
export interface CollectionStatistics {
  totalLinks: number;
  uniqueLinks: number;
  internalLinks: number;
  externalLinks: number;
  linksByDomain: Record<string, number>;
  linksByDepth: Record<number, number>;
  averageLinksPerPage: number;
  crawlEfficiency: number; // totalCollected / totalScanned
}

/**
 * Enhanced collection result with optional statistics
 */
export interface EnhancedCollectionResult extends CollectionResult {
  statistics?: CollectionStatistics;
}
