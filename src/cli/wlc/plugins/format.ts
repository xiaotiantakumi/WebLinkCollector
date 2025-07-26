/**
 * Format conversion plugin for WLC CLI
 */

import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { PluginHandler } from './interface.js';
import { PluginArgParser } from '../utils/args.js';
import { createFormatService } from '../../../formatters/index.js';
import type { CollectionResult } from '../../../types.js';

interface FormatPluginOptions {
  input: string;
  output: string;
  format: string;
  separator?: string;
  filename?: string;
}

/**
 * Format conversion plugin implementation
 */
export class FormatPlugin implements PluginHandler {
  readonly name = 'format';
  readonly description = 'Convert JSON results to various formats';

  private formatService = createFormatService();

  async execute(args: string[]): Promise<number> {
    try {
      // Check for help flag immediately
      if (args.includes('-h') || args.includes('--help')) {
        this.showHelp();
        return 0;
      }

      const options = this.parseArgs(args);
      await this.validateOptions(options);

      const result = await this.convertFormat(options);
      console.log(`Successfully converted to ${options.format} format: ${result.outputPath}`);

      return 0;
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      return 1;
    }
  }

  showHelp(): void {
    const availableFormats = this.formatService.getAvailableFormats();

    console.log(`Format Conversion Plugin

Usage: wlc -p format -i <input> -o <output> -f <format> [options]

Required Arguments:
  -i, --input <path>     Input JSON file (CollectionResult format)
  -o, --output <path>    Output directory
  -f, --format <name>    Output format

Available Formats:`);

    availableFormats.forEach(format => {
      if (format === 'notebooklm') {
        console.log(`  ${format.padEnd(16)} URLs for NotebookLM import (space/newline separated)`);
      } else {
        console.log(`  ${format.padEnd(16)} Format converter: ${format}`);
      }
    });

    console.log(`
Format-Specific Options:
  --separator <type>     For notebooklm: 'space' or 'newline' (default: newline)
  --filename <name>      Custom output filename (auto-generated if not specified)

Examples:
  wlc -p format -i results.json -o output/ -f notebooklm
  wlc -p format -i results.json -o output/ -f notebooklm --separator space
  wlc -p format -i results.json -o output/ -f notebooklm --filename my-urls.txt`);
  }

  private parseArgs(args: string[]): FormatPluginOptions {
    const parser = new PluginArgParser(args);
    const options: Partial<FormatPluginOptions> = {};

    while (parser.hasMore()) {
      const input = parser.parseOption('-i', '--input');
      if (input) {
        options.input = input;
        continue;
      }

      const output = parser.parseOption('-o', '--output');
      if (output) {
        options.output = output;
        continue;
      }

      const format = parser.parseOption('-f', '--format');
      if (format) {
        options.format = format;
        continue;
      }

      const separator = parser.parseOption('--separator');
      if (separator) {
        options.separator = separator;
        continue;
      }

      const filename = parser.parseOption('--filename');
      if (filename) {
        options.filename = filename;
        continue;
      }

      const unknown = parser.next();
      throw new Error(`Unknown argument: ${unknown}`);
    }

    if (!options.input || !options.output || !options.format) {
      throw new Error('Missing required arguments. Use --help for usage information.');
    }

    return options as FormatPluginOptions;
  }

  private async validateOptions(options: FormatPluginOptions): Promise<void> {
    // Validate input file exists
    if (!existsSync(options.input)) {
      throw new Error(`Input file does not exist: ${options.input}`);
    }

    // Validate input is JSON file
    if (!options.input.toLowerCase().endsWith('.json')) {
      throw new Error(`Input file must be a JSON file: ${options.input}`);
    }

    // Validate format is supported
    if (!this.formatService.isFormatSupported(options.format)) {
      const available = this.formatService.getAvailableFormats();
      throw new Error(
        `Unsupported format: ${options.format}. Available formats: ${available.join(', ')}`
      );
    }

    // Validate separator for notebooklm format
    if (options.format === 'notebooklm' && options.separator) {
      if (!['space', 'newline'].includes(options.separator)) {
        throw new Error(
          `Invalid separator for notebooklm format: ${options.separator}. Use 'space' or 'newline'.`
        );
      }
    }

    // Ensure output directory exists
    if (!existsSync(options.output)) {
      try {
        mkdirSync(options.output, { recursive: true });
      } catch {
        throw new Error(`Failed to create output directory: ${options.output}`);
      }
    }
  }

  private async convertFormat(
    options: FormatPluginOptions
  ): Promise<{ outputPath: string; content: string }> {
    // Read and parse input file
    const inputContent = await readFile(options.input, 'utf-8');
    let collectionResult: CollectionResult;

    try {
      collectionResult = JSON.parse(inputContent);
    } catch {
      throw new Error(`Invalid JSON in input file: ${options.input}`);
    }

    // Validate it's a CollectionResult
    if (!collectionResult.allCollectedUrls || !Array.isArray(collectionResult.allCollectedUrls)) {
      throw new Error(
        'Input file does not contain a valid CollectionResult (missing allCollectedUrls array)'
      );
    }

    // Prepare format options
    const formatOptions: any = {};
    if (options.format === 'notebooklm' && options.separator) {
      formatOptions.separator = options.separator;
    }

    // Convert the data
    const convertedContent = this.formatService.convert(
      collectionResult,
      options.format,
      formatOptions
    );

    // Generate output filename
    const filename = options.filename || this.generateFilename(options.format);
    const outputPath = join(options.output, filename);

    // Write output file
    await writeFile(outputPath, convertedContent, 'utf-8');

    return { outputPath, content: convertedContent };
  }

  private generateFilename(format: string): string {
    const now = new Date();
    const datePart = now.toISOString().substring(0, 10).replace(/-/g, ''); // YYYYMMDD
    const timePart = now.toISOString().substring(11, 19).replace(/:/g, ''); // HHMMSS
    const timestamp = `${datePart}-${timePart}`;

    return `${format}-${timestamp}.txt`;
  }
}
