/**
 * Example demonstrating the format conversion functionality
 * This example shows how to convert WebLinkCollector results to NotebookLM format
 */

import { createFormatService } from '../src/formatters/index.js';
import type { CollectionResult } from '../src/types.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function demonstrateFormatConversion() {
  console.log('🔄 Format Conversion Example');
  console.log('============================\n');

  // Load the real Anthropic docs data
  const dataPath = join(__dirname, '../tmp/get-anthoropic-docs/anthropic-docs.json');
  const rawData = readFileSync(dataPath, 'utf-8');
  const collectionResult: CollectionResult = JSON.parse(rawData);

  console.log(`📊 Loaded data with ${collectionResult.allCollectedUrls.length} URLs`);
  console.log(`🎯 Initial URL: ${collectionResult.initialUrl}`);
  console.log(`📏 Depth: ${collectionResult.depth}\n`);

  // Create the format service
  const formatService = createFormatService();

  console.log('🔧 Available formats:', formatService.getAvailableFormats());
  console.log();

  // Convert to NotebookLM format with newlines (default)
  console.log('📝 Converting to NotebookLM format (newline-separated):');
  console.log('─'.repeat(50));
  const notebookLMNewlines = formatService.convert(collectionResult, 'notebooklm');
  console.log(notebookLMNewlines);
  console.log();

  // Convert to NotebookLM format with spaces
  console.log('📝 Converting to NotebookLM format (space-separated):');
  console.log('─'.repeat(50));
  const notebookLMSpaces = formatService.convert(collectionResult, 'notebooklm', { separator: 'space' });
  console.log(notebookLMSpaces);
  console.log();

  // Demonstrate extensibility by adding a custom converter
  console.log('🚀 Demonstrating extensibility with custom CSV converter:');
  
  const csvConverter = {
    name: 'csv',
    description: 'Comma-separated values format',
    convert: (data: CollectionResult) => {
      const header = 'Index,URL,Domain';
      const rows = data.allCollectedUrls.map((url, index) => {
        try {
          const domain = new URL(url).hostname;
          return `${index + 1},"${url}","${domain}"`;
        } catch {
          return `${index + 1},"${url}","invalid"`;
        }
      });
      return [header, ...rows].join('\n');
    },
  };

  formatService.registerConverter(csvConverter);
  console.log('✅ Registered CSV converter');
  console.log('🔧 Available formats:', formatService.getAvailableFormats());
  console.log();

  console.log('📊 CSV format output (first 5 rows):');
  console.log('─'.repeat(50));
  const csvOutput = formatService.convert(collectionResult, 'csv');
  const csvLines = csvOutput.split('\n').slice(0, 6); // Header + first 5 rows
  console.log(csvLines.join('\n'));
  console.log();

  // Statistics
  const urlCount = collectionResult.allCollectedUrls.length;
  const newlineLength = notebookLMNewlines.length;
  const spaceLength = notebookLMSpaces.length;
  
  console.log('📈 Conversion Statistics:');
  console.log(`   • Total URLs: ${urlCount}`);
  console.log(`   • NotebookLM (newlines): ${newlineLength} characters`);
  console.log(`   • NotebookLM (spaces): ${spaceLength} characters`);
  console.log(`   • Space efficiency: ${((newlineLength - spaceLength) / newlineLength * 100).toFixed(1)}% smaller with spaces`);
  console.log();

  console.log('✅ Format conversion example completed successfully!');
}

// Run the example
demonstrateFormatConversion().catch(console.error);