#!/usr/bin/env node

/**
 * WebLinkCollector CLI Tool
 * Main executable script for the CLI interface.
 */

import fs from 'fs/promises';
import { parseCliArgs } from '../src/cli/args';
import { loadConfig, mergeConfig } from '../src/cli/configLoader';
import { collectLinks } from '../src/index';
import { FilterConditions, LogLevel } from '../src/types';
import { createLogger } from '../src/logger';

/**
 * Formats the collection results as plain text (URLs only)
 * @param results - The collection results
 * @returns The formatted text
 */
const formatAsText = (results: any): string => {
  const initialUrl = results.initialUrl;
  const allUrls = results.allCollectedUrls;
  const stats = results.stats;
  
  let output = `WebLinkCollector Results\n`;
  output += `Initial URL: ${initialUrl}\n`;
  output += `Depth: ${results.depth}\n`;
  output += `Total URLs Collected: ${stats.totalUrlsCollected}\n`;
  output += `Duration: ${stats.durationMs}ms\n\n`;
  output += `Collected URLs:\n`;
  
  allUrls.forEach((url: string) => {
    output += `${url}\n`;
  });
  
  return output;
};

/**
 * Main CLI function
 */
const main = async () => {
  try {
    // Parse command line arguments
    const cliArgs = await parseCliArgs();
    
    // Create logger
    const logger = createLogger(cliArgs.logLevel as LogLevel);
    
    // Load configuration from file if provided
    let config = {};
    if (cliArgs.configFile) {
      try {
        logger.info(`Loading configuration from file: ${cliArgs.configFile}`);
        config = await loadConfig(cliArgs.configFile);
      } catch (error) {
        logger.error(`Failed to load configuration file: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    }
    
    // Merge CLI arguments with file configuration
    const mergedConfig = mergeConfig(cliArgs, config);
    
    // Parse filters if provided as a JSON string
    let filters: FilterConditions | undefined;
    if (mergedConfig.filters) {
      try {
        filters = JSON.parse(mergedConfig.filters);
      } catch (error) {
        logger.error(`Invalid JSON format for filters: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    }
    
    // Load filters from file if provided
    if (mergedConfig.filtersFile) {
      try {
        logger.info(`Loading filters from file: ${mergedConfig.filtersFile}`);
        const filtersFromFile = await loadConfig(mergedConfig.filtersFile);
        filters = filtersFromFile.filters || filtersFromFile;
      } catch (error) {
        logger.error(`Failed to load filters file: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    }
    
    // Prepare options for the collector
    const options = {
      depth: mergedConfig.depth,
      filters,
      selector: mergedConfig.selector,
      delayMs: mergedConfig.delayMs,
      logLevel: mergedConfig.logLevel as LogLevel
    };
    
    logger.info(`Starting link collection from ${mergedConfig.initialUrl} with depth ${options.depth}`);
    
    // Collect links
    const results = await collectLinks(mergedConfig.initialUrl, options);
    
    // Format the results
    let output: string;
    if (mergedConfig.format === 'txt') {
      output = formatAsText(results);
    } else {
      // Default is JSON
      output = JSON.stringify(results, null, 2);
    }
    
    // Output the results
    if (mergedConfig.output) {
      // Write to file
      logger.info(`Writing results to file: ${mergedConfig.output}`);
      await fs.writeFile(mergedConfig.output, output);
    } else {
      // Write to stdout
      process.stdout.write(output);
    }
    
    logger.info('Link collection completed successfully');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

// Run the main function
main();