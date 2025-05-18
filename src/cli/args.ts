/**
 * WebLinkCollector CLI Argument Parsing
 * This module handles parsing command-line arguments.
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { LogLevel } from '../types';
import { loadConfig } from './configLoader';

/**
 * Parses command line arguments
 * @returns Promise resolving to the parsed arguments
 */
export const parseCliArgs = async (): Promise<any> => {
  // テスト環境ではprocess.exitを呼び出さないように設定
  const exitProcess = process.env.NODE_ENV === 'test' ? false : true;

  // 明示的に指定されたオプションを追跡するための配列
  const specifiedOptions: string[] = [];

  // 引数の処理中にキャプチャするミドルウェア
  const trackSpecifiedOptions = (argv: any) => {
    Object.keys(argv).forEach(key => {
      if (key !== '_' && key !== '$0' && !key.startsWith('$')) {
        specifiedOptions.push(key);
      }
    });
    return argv;
  };

  const parser = yargs(hideBin(process.argv))
    .scriptName('web-link-collector')
    .usage('Usage: $0 --initialUrl <url> [options]')
    .option('initialUrl', {
      type: 'string',
      describe: 'The starting URL for link collection',
    })
    .option('depth', {
      type: 'number',
      describe: 'The maximum recursion depth (0-5)',
      default: 1,
      choices: [0, 1, 2, 3, 4, 5],
    })
    .option('filters', {
      type: 'string',
      describe: 'JSON string of filter conditions (e.g. \'{"domain": "example.com"}\')',
    })
    .option('filtersFile', {
      type: 'string',
      describe: 'Path to a JSON or YAML file containing filter conditions',
    })
    .option('selector', {
      type: 'string',
      describe: 'CSS selector to limit link extraction scope (only applied to the initial page)',
    })
    .option('element', {
      type: 'string',
      describe: 'HTML tag name to use as starting point for link extraction (e.g., main, article)',
    })
    .option('delayMs', {
      type: 'number',
      describe: 'Delay in milliseconds between requests',
      default: 1000,
    })
    .option('logLevel', {
      type: 'string',
      describe: 'Logging level',
      choices: ['debug', 'info', 'warn', 'error', 'none'] as LogLevel[],
      default: 'info' as LogLevel,
    })
    .option('output', {
      type: 'string',
      describe: 'Output file path (if not specified, outputs to stdout)',
    })
    .option('format', {
      type: 'string',
      describe: 'Output format',
      choices: ['json', 'txt'],
      default: 'json',
    })
    .option('configFile', {
      type: 'string',
      describe: 'Path to a JSON or YAML configuration file',
    })
    .middleware(trackSpecifiedOptions)
    .check(async argv => {
      if (argv.configFile) {
        try {
          const configFromFile = await loadConfig(argv.configFile as string);
          if (!argv.initialUrl && !configFromFile.initialUrl) {
            throw new Error(
              'initialUrl is required. Please provide it via CLI argument or in the config file.'
            );
          }
        } catch (error: any) {
          throw new Error(`Error loading config file: ${error.message}`);
        }
      } else if (!argv.initialUrl) {
        throw new Error(
          'initialUrl is required. Please provide it via CLI argument or in the config file.'
        );
      }
      return true;
    })
    .example(
      '$0 --initialUrl https://example.com --depth 2',
      'Collect links from example.com up to depth 2'
    )
    .example(
      '$0 --initialUrl https://example.com --filters \'{"domain": "example.com"}\'',
      'Only collect links from example.com domain'
    )
    .example('$0 --configFile config.yaml', 'Use configuration from a YAML file')
    .epilogue('For more information, see the documentation')
    .help()
    .alias('help', 'h')
    .exitProcess(exitProcess); // テスト環境ではプロセスを終了しない

  const args = await parser.parse();

  // 明示的に指定されたオプションのみを含む新しいオブジェクトを作成
  const explicitArgs: Record<string, any> = {};
  specifiedOptions.forEach(key => {
    explicitArgs[key] = args[key];
  });

  // 特殊なプロパティを追加
  explicitArgs.$0 = args.$0;
  explicitArgs._ = args._;

  return explicitArgs;
};
