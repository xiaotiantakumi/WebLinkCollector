/**
 * WebLinkCollector Configuration File Loader
 * This module handles loading configuration from JSON or YAML files.
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Loads configuration from a JSON or YAML file
 * @param filePath - Path to the configuration file
 * @returns Promise resolving to the parsed configuration object
 */
export const loadConfig = async (filePath?: string): Promise<Record<string, any>> => {
  if (!filePath) {
    return {};
  }
  
  try {
    // Get the file extension to determine the format
    const ext = path.extname(filePath).toLowerCase();
    
    // Read the file content
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Parse the content based on the file extension
    if (ext === '.json') {
      return JSON.parse(fileContent);
    } else if (ext === '.yml' || ext === '.yaml') {
      return yaml.load(fileContent) as Record<string, any>;
    } else {
      throw new Error(`Unsupported file format: ${ext}. Use .json, .yml, or .yaml files.`);
    }
  } catch (error) {
    // Handle common errors
    if (error instanceof Error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Configuration file not found: ${filePath}`);
      } else if (error.name === 'SyntaxError') {
        throw new Error(`Invalid JSON format in file: ${filePath}`);
      } else if (error.toString().includes('JS-YAML')) {
        throw new Error(`Invalid YAML format in file: ${filePath}`);
      }
    }
    
    // Re-throw the original error for other cases
    throw error;
  }
};

/**
 * Merges command line arguments with configuration file settings
 * CLI arguments take precedence over config file settings
 * @param cliArgs - Command line arguments
 * @param fileConfig - Configuration from file
 * @returns Merged configuration
 */
export const mergeConfig = (
  cliArgs: Record<string, any>,
  fileConfig: Record<string, any>
): Record<string, any> => {
  // Deep clone the file config to avoid modifying the original
  const mergedConfig = { ...fileConfig };
  
  // Merge CLI arguments (they take precedence)
  for (const [key, value] of Object.entries(cliArgs)) {
    // Only override if the CLI argument is explicitly provided (not undefined)
    if (value !== undefined) {
      mergedConfig[key] = value;
    }
  }
  
  return mergedConfig;
};