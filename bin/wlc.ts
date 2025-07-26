#!/usr/bin/env bun

/**
 * WebLinkCollector Unified CLI Tool
 * Single entry point for both collection and format conversion functionality
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Import for collect command
import { loadConfig, mergeConfig } from '../src/cli/configLoader';
import { collectLinks } from '../src/index';
import type { FilterConditions, LogLevel, CollectionResult } from '../src/types';
import { createLogger } from '../src/logger';

// Import for format command
import { createFormatService } from '../src/formatters/index';
import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Formats the collection results as plain text (URLs only)
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
 */
const writeFileOptimized = async (filePath: string, content: string): Promise<void> => {
  try {
    const bunGlobal = globalThis as any;
    if (bunGlobal.Bun && bunGlobal.Bun.write) {
      await bunGlobal.Bun.write(filePath, content);
    } else {
      const fs = await import('fs/promises');
      await fs.writeFile(filePath, content);
    }
  } catch {
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, content);
  }
};

/**
 * Generate filename with timestamp
 */
const generateFilename = (format: string): string => {
  const now = new Date();
  const datePart = now.toISOString().substring(0, 10).replace(/-/g, '');
  const timePart = now.toISOString().substring(11, 19).replace(/:/g, '');
  const timestamp = `${datePart}-${timePart}`;

  return `${format}-${timestamp}.txt`;
};

/**
 * Collect command handler
 */
const collectCommand = async (argv: any): Promise<void> => {
  const startTime = Date.now();

  try {
    // Create logger
    const logger = createLogger(argv.logLevel as LogLevel);

    // Load configuration from file if provided
    let config = {};
    if (argv.configFile) {
      try {
        logger.info(`設定ファイルを読み込み中: ${argv.configFile}`);
        config = await loadConfig(argv.configFile);
        logger.debug(`ファイルから設定を読み込みました: ${JSON.stringify(config, null, 2)}`);
      } catch (error) {
        logger.error(
          `設定ファイルの読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }

    // Merge CLI arguments with file configuration
    const mergedConfig = mergeConfig(argv, config);
    logger.debug(`マージされた設定: ${JSON.stringify(mergedConfig, null, 2)}`);

    // Validate initialUrl exists (either from CLI or config file)
    if (!mergedConfig.initialUrl) {
      if (argv.configFile) {
        logger.error(
          '設定ファイルに initialUrl が設定されておらず、コマンドライン引数でも URL が指定されていません'
        );
      } else {
        logger.error(
          'URL が指定されていません。コマンドライン引数で URL を指定するか、設定ファイルで initialUrl を設定してください'
        );
      }
      process.exit(1);
    }

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
    logger.debug(`収集オプション: ${JSON.stringify(options, null, 2)}`);

    // Collect links
    const results = await collectLinks(mergedConfig.initialUrl, options);

    // Format the results
    let output: string;
    if (mergedConfig.format === 'txt') {
      output = formatAsText(results);
    } else {
      output = JSON.stringify(results, null, 2);
    }

    // Output the results
    if (mergedConfig.output) {
      logger.info(`結果をファイルに出力中: ${mergedConfig.output}`);
      await writeFileOptimized(mergedConfig.output, output);
    } else {
      process.stdout.write(output);
    }

    const endTime = Date.now();
    logger.info(`リンク収集が正常に完了しました（処理時間: ${endTime - startTime}ms）`);
  } catch (error) {
    console.error('エラー:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

/**
 * Format command handler
 */
const formatCommand = async (argv: any): Promise<void> => {
  try {
    const formatService = createFormatService();

    // Validate input file exists
    if (!existsSync(argv.input)) {
      throw new Error(`Input file does not exist: ${argv.input}`);
    }

    // Validate input is JSON file
    if (!argv.input.toLowerCase().endsWith('.json')) {
      throw new Error(`Input file must be a JSON file: ${argv.input}`);
    }

    // Validate format is supported
    if (!formatService.isFormatSupported(argv.format)) {
      const available = formatService.getAvailableFormats();
      throw new Error(
        `Unsupported format: ${argv.format}. Available formats: ${available.join(', ')}`
      );
    }

    // Validate separator for notebooklm format
    if (argv.format === 'notebooklm' && argv.separator) {
      if (!['space', 'newline'].includes(argv.separator)) {
        throw new Error(
          `Invalid separator for notebooklm format: ${argv.separator}. Use 'space' or 'newline'.`
        );
      }
    }

    // Ensure output directory exists
    if (!existsSync(argv.output)) {
      try {
        mkdirSync(argv.output, { recursive: true });
      } catch {
        throw new Error(`Failed to create output directory: ${argv.output}`);
      }
    }

    // Read and parse input file
    const inputContent = await readFile(argv.input, 'utf-8');
    let collectionResult: CollectionResult;

    try {
      collectionResult = JSON.parse(inputContent);
    } catch {
      throw new Error(`Invalid JSON in input file: ${argv.input}`);
    }

    // Validate it's a CollectionResult
    if (!collectionResult.allCollectedUrls || !Array.isArray(collectionResult.allCollectedUrls)) {
      throw new Error(
        'Input file does not contain a valid CollectionResult (missing allCollectedUrls array)'
      );
    }

    // Prepare format options
    const formatOptions: any = {};
    if (argv.format === 'notebooklm' && argv.separator) {
      formatOptions.separator = argv.separator;
    }

    // Convert the data
    const convertedContent = formatService.convert(collectionResult, argv.format, formatOptions);

    // Generate output filename
    const filename = argv.filename || generateFilename(argv.format);
    const outputPath = join(argv.output, filename);

    // Write output file
    await writeFile(outputPath, convertedContent, 'utf-8');

    console.log(`Successfully converted to ${argv.format} format: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

/**
 * Main CLI setup using yargs
 */
const cli = yargs(hideBin(process.argv))
  .scriptName('wlc')
  .usage('Usage: $0 <command> [options]')
  .command(
    'collect [url]',
    'Collect links from a web page recursively',
    yargs => {
      return yargs
        .positional('url', {
          describe: 'Initial URL to start collecting from (optional if specified in config file)',
          type: 'string',
          demandOption: false,
        })
        .option('depth', {
          alias: 'd',
          type: 'number',
          description: 'Maximum depth to crawl',
          default: 1,
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          description: 'Output file path',
        })
        .option('format', {
          alias: 'f',
          type: 'string',
          description: 'Output format (json or txt)',
          choices: ['json', 'txt'],
          default: 'json',
        })
        .option('logLevel', {
          alias: 'l',
          type: 'string',
          description: 'Log level',
          choices: ['error', 'warn', 'info', 'debug'],
          default: 'info',
        })
        .option('delayMs', {
          type: 'number',
          description: 'Delay between requests in milliseconds',
          default: 1000,
        })
        .option('selector', {
          alias: 's',
          type: 'string',
          description: 'CSS selector for links',
          default: 'a[href]',
        })
        .option('configFile', {
          alias: 'c',
          type: 'string',
          description: 'Configuration file path',
        })
        .option('filters', {
          type: 'string',
          description: 'Filter conditions as JSON string',
        })
        .option('filtersFile', {
          type: 'string',
          description: 'Filter conditions file path',
        })
        .example('$0 collect https://example.com', 'Collect links from example.com')
        .example(
          '$0 collect https://example.com -d 2 -o results.json',
          'Collect with depth 2 and save to file'
        )
        .example('$0 collect --configFile config.yaml', 'Collect using URL from config file');
    },
    argv => {
      // Map positional argument to expected property name
      const collectArgs = {
        ...argv,
        initialUrl: argv.url,
      };
      collectCommand(collectArgs);
    }
  )
  .command(
    'format',
    'Convert JSON results to various formats',
    yargs => {
      return yargs
        .option('input', {
          alias: 'i',
          type: 'string',
          description: 'Input JSON file (CollectionResult format)',
          demandOption: true,
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          description: 'Output directory',
          demandOption: true,
        })
        .option('format', {
          alias: 'f',
          type: 'string',
          description: 'Output format',
          choices: ['notebooklm'],
          demandOption: true,
        })
        .option('separator', {
          type: 'string',
          description: 'For notebooklm: separator type (space or newline)',
          choices: ['space', 'newline'],
          default: 'newline',
        })
        .option('filename', {
          type: 'string',
          description: 'Custom output filename (auto-generated if not specified)',
        })
        .example(
          '$0 format -i results.json -o output/ -f notebooklm',
          'Convert to NotebookLM format'
        )
        .example(
          '$0 format -i results.json -o output/ -f notebooklm --separator space',
          'Convert with space separator'
        );
    },
    formatCommand
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v');

// Export for testing
export { formatAsText };

// Run CLI if this is the main module
if (import.meta.main) {
  cli.parse();
}
