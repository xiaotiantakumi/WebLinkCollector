#!/usr/bin/env bun

/**
 * WebLinkCollector CLI Tool
 * Main executable script for the CLI interface.
 * Optimized for Bun runtime with enhanced performance.
 */

import { parseCliArgs } from '../src/cli/args';
import { loadConfig, mergeConfig } from '../src/cli/configLoader';
import { collectLinks } from '../src/index';
import type { FilterConditions, LogLevel } from '../src/types';
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
 * Write file using Bun's optimized file operations
 * @param filePath - Path to write the file
 * @param content - Content to write
 */
const writeFileOptimized = async (filePath: string, content: string): Promise<void> => {
  // Use Bun's write function if available, fallback to fs/promises
  try {
    // Type assertion for Bun global
    const bunGlobal = globalThis as any;
    if (bunGlobal.Bun && bunGlobal.Bun.write) {
      await bunGlobal.Bun.write(filePath, content);
    } else {
      const fs = await import('fs/promises');
      await fs.writeFile(filePath, content);
    }
  } catch {
    // Fallback to standard fs if Bun.write fails
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, content);
  }
};

/**
 * Main CLI function
 */
const main = async (): Promise<void> => {
  // Use Date.now() for better compatibility
  const startTime = Date.now();

  try {
    // Parse command line arguments
    const cliArgs = await parseCliArgs();

    // Create logger
    const logger = createLogger(cliArgs.logLevel as LogLevel);

    // Load configuration from file if provided
    let config = {};
    if (cliArgs.configFile) {
      try {
        logger.info(`設定ファイルを読み込み中: ${cliArgs.configFile}`);
        config = await loadConfig(cliArgs.configFile);
        logger.debug(`ファイルから設定を読み込みました: ${JSON.stringify(config, null, 2)}`);
      } catch (error) {
        logger.error(
          `設定ファイルの読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }

    // Merge CLI arguments with file configuration
    const mergedConfig = mergeConfig(cliArgs, config);
    logger.debug(`マージされた設定: ${JSON.stringify(mergedConfig, null, 2)}`);

    // Parse filters if provided as a JSON string
    let filters: FilterConditions | undefined;
    if (mergedConfig.filters) {
      if (typeof mergedConfig.filters === 'string') {
        try {
          filters = JSON.parse(mergedConfig.filters);
        } catch (error) {
          logger.error(
            `フィルタのJSON形式が無効です: ${error instanceof Error ? error.message : String(error)}`
          );
          process.exit(1);
        }
      } else if (typeof mergedConfig.filters === 'object') {
        filters = mergedConfig.filters as FilterConditions;
      } else {
        logger.error(
          'フィルタの形式が無効です: JSON文字列またはオブジェクトである必要があります。'
        );
        process.exit(1);
      }
    }

    // Load filters from file if provided
    if (mergedConfig.filtersFile) {
      try {
        logger.info(`フィルタファイルを読み込み中: ${mergedConfig.filtersFile}`);
        const filtersFromFile = await loadConfig(mergedConfig.filtersFile);
        filters = filtersFromFile.filters || filtersFromFile;
      } catch (error) {
        logger.error(
          `フィルタファイルの読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }

    // Prepare options for the collector
    const options = {
      depth: mergedConfig.depth ?? 1,
      filters,
      selector: mergedConfig.selector,
      delayMs: mergedConfig.delayMs ?? 1000,
      logLevel: mergedConfig.logLevel as LogLevel,
    };

    logger.info(`${mergedConfig.initialUrl} からリンク収集を開始します（深度: ${options.depth}）`);

    // デバッグログにオプションを表示
    logger.debug(`収集オプション: ${JSON.stringify(options, null, 2)}`);

    // Validate initialUrl exists
    if (!mergedConfig.initialUrl) {
      logger.error('initialUrl が設定されていません');
      process.exit(1);
    }

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
      // Write to file using optimized function
      logger.info(`結果をファイルに出力中: ${mergedConfig.output}`);
      await writeFileOptimized(mergedConfig.output, output);
    } else {
      // Write to stdout
      process.stdout.write(output);
    }

    const endTime = Date.now();
    logger.info(`リンク収集が正常に完了しました（処理時間: ${endTime - startTime}ms）`);
  } catch (error) {
    console.error('エラー:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

// Export for testing purposes
export { main, formatAsText };

// Run the main function only if this is the main module
const metaUrl = typeof import.meta !== 'undefined' ? import.meta.url : '';
const isMainModule =
  metaUrl.endsWith('/web-link-collector.ts') || process.argv[1]?.endsWith('/web-link-collector.ts');

if (isMainModule) {
  main().catch(error => {
    console.error('致命的エラー:', error);
    process.exit(1);
  });
}
