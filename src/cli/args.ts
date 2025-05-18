/**
 * WebLinkCollector CLI Argument Parsing
 * This module handles parsing command-line arguments.
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { LogLevel } from '../types';

/**
 * Parses command line arguments
 * @returns Promise resolving to the parsed arguments
 */
export const parseCliArgs = async (): Promise<any> => {
  return yargs(hideBin(process.argv))
    .scriptName('web-link-collector')
    .usage('Usage: $0 --initialUrl <url> [options]')
    .option('initialUrl', {
      type: 'string',
      describe: 'The starting URL for link collection',
      demandOption: true,
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
    .parse();
};
