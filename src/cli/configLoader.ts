/**
 * WebLinkCollector Configuration File Loader
 * This module handles loading configuration from JSON or YAML files.
 * Optimized for Bun runtime with enhanced performance and error handling.
 */

import path from 'path';
import yaml from 'js-yaml';

/**
 * Configuration interface for type safety
 */
export interface Config {
  initialUrl?: string;
  depth?: number;
  filters?: any;
  filtersFile?: string;
  selector?: string;
  element?: string;
  delayMs?: number;
  logLevel?: string;
  output?: string;
  format?: 'json' | 'txt';
  [key: string]: any;
}

/**
 * Loads configuration from a JSON or YAML file using Bun optimizations
 * @param filePath - Path to the configuration file
 * @returns Promise resolving to the parsed configuration object
 */
export const loadConfig = async (filePath?: string): Promise<Config> => {
  if (!filePath?.trim()) {
    return {};
  }

  try {
    // Get the file extension to determine the format
    const ext = path.extname(filePath).toLowerCase();

    // Use Bun's optimized file reading if available
    let fileContent: string;
    try {
      const bunGlobal = globalThis as any;
      if (bunGlobal.Bun && bunGlobal.Bun.file) {
        const file = bunGlobal.Bun.file(filePath);
        fileContent = await file.text();
      } else {
        // Fallback to fs/promises
        const fs = await import('fs/promises');
        fileContent = await fs.readFile(filePath, 'utf8');
      }
    } catch {
      // Double fallback to standard fs
      const fs = await import('fs/promises');
      fileContent = await fs.readFile(filePath, 'utf8');
    }

    // Parse the content based on the file extension
    let config: Config;
    if (ext === '.json') {
      config = JSON.parse(fileContent);
    } else if (ext === '.yml' || ext === '.yaml') {
      try {
        const parsed = yaml.load(fileContent);
        config = (parsed as Config) || {};
      } catch {
        throw new Error(`ファイルのYAML形式が無効です: ${filePath}`);
      }
    } else {
      throw new Error(
        `サポートされていないファイル形式: ${ext}. .json, .yml, または .yaml ファイルを使用してください。`
      );
    }

    // Validate the configuration
    if (typeof config !== 'object' || config === null) {
      throw new Error(`設定ファイルは有効なオブジェクトである必要があります: ${filePath}`);
    }

    return config;
  } catch (error) {
    // Handle common errors with Japanese messages
    if (error instanceof Error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`設定ファイルが見つかりません: ${filePath}`);
      } else if (error.name === 'SyntaxError') {
        throw new Error(`ファイルのJSON形式が無効です: ${filePath}`);
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
export const mergeConfig = (cliArgs: Record<string, any>, fileConfig: Config): Config => {
  // Create a shallow copy of the file config to avoid modifying the original
  const mergedConfig: Config = { ...fileConfig };

  // Check if delayMs was explicitly set in CLI or is using the default value
  const isDelayMsExplicitlySet = process.argv.some(
    arg => arg.startsWith('--delayMs=') || arg === '--delayMs'
  );

  // Merge CLI arguments (they take precedence)
  for (const [key, value] of Object.entries(cliArgs)) {
    // Only process actual CLI arguments, not yargs internal properties
    if (key !== '_' && key !== '$0' && !key.startsWith('$')) {
      // For delayMs, if not explicitly set in CLI and available in config file, use config file value
      if (key === 'delayMs' && !isDelayMsExplicitlySet && fileConfig.delayMs !== undefined) {
        mergedConfig[key] = fileConfig.delayMs;
      } else if (value !== undefined) {
        mergedConfig[key] = value;
      }
    }
  }

  return mergedConfig;
};
