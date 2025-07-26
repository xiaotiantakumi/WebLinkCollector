# Format Conversion System

A flexible, extensible format conversion system for WebLinkCollector results. This module provides a plugin-based architecture for converting collected URLs into various formats following SOLID design principles.

## Features

- **🎯 NotebookLM Support**: Ready-to-use converter for NotebookLM import format
- **🔧 Extensible Architecture**: Easy to add new format converters
- **🛡️ Type Safety**: Full TypeScript support with format-specific options
- **✅ SOLID Principles**: Clean, maintainable design
- **🧪 Well Tested**: Comprehensive test coverage with real-world data
- **🚫 Non-intrusive**: No impact on existing WebLinkCollector functionality

## Quick Start

### Basic Usage

```typescript
import { createFormatService } from 'web-link-collector';
import type { CollectionResult } from 'web-link-collector';

// Create format service with built-in converters
const formatService = createFormatService();

// Convert to NotebookLM format (newline-separated URLs)
const notebookLmOutput = formatService.convert(collectionResult, 'notebooklm');
console.log(notebookLmOutput);
// Output:
// https://example.com/page1
// https://example.com/page2
// https://example.com/page3

// Convert to NotebookLM format with space separator
const spaceOutput = formatService.convert(collectionResult, 'notebooklm', {
  separator: 'space',
});
console.log(spaceOutput);
// Output: https://example.com/page1 https://example.com/page2 https://example.com/page3
```

### Available Formats

```typescript
// Check available formats
console.log(formatService.getAvailableFormats());
// Output: ['notebooklm']

// Check if format is supported
console.log(formatService.isFormatSupported('notebooklm')); // true
console.log(formatService.isFormatSupported('csv')); // false
```

## Built-in Converters

### NotebookLM Converter

Converts URLs for import into Google's NotebookLM service.

**Name**: `'notebooklm'`

**Output**: URLs separated by spaces or newlines, without quotes

**Options**:

```typescript
interface NotebookLMOptions {
  separator?: 'space' | 'newline'; // default: 'newline'
}
```

**Example**:

```typescript
// Newline-separated (default)
const newlineFormat = formatService.convert(data, 'notebooklm');

// Space-separated
const spaceFormat = formatService.convert(data, 'notebooklm', {
  separator: 'space',
});
```

**Features**:

- ✅ Validates URLs (http/https only)
- ✅ Trims whitespace
- ✅ Filters out invalid URLs
- ✅ No quote wrapping (NotebookLM requirement)
- ✅ Handles empty arrays gracefully

## Creating Custom Converters

### Basic Converter

```typescript
import type { FormatConverter, CollectionResult } from 'web-link-collector';

const csvConverter: FormatConverter = {
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

// Register the converter
formatService.registerConverter(csvConverter);

// Use the converter
const csvOutput = formatService.convert(data, 'csv');
```

### Converter with Options

```typescript
interface MarkdownOptions {
  includeIndex?: boolean;
  linkText?: string;
}

const markdownConverter: FormatConverter<MarkdownOptions> = {
  name: 'markdown',
  description: 'Markdown link format',
  convert: (data: CollectionResult, options?: MarkdownOptions) => {
    const { includeIndex = false, linkText = 'Link' } = options || {};

    return data.allCollectedUrls
      .map((url, index) => {
        const prefix = includeIndex ? `${index + 1}. ` : '- ';
        return `${prefix}[${linkText} ${index + 1}](${url})`;
      })
      .join('\n');
  },
};

formatService.registerConverter(markdownConverter);

// Use with options
const markdownOutput = formatService.convert(data, 'markdown', {
  includeIndex: true,
  linkText: 'Documentation',
});
```

## Architecture

### Core Components

#### FormatConverter Interface

```typescript
interface FormatConverter<TOptions = any> {
  readonly name: string;
  readonly description: string;
  convert(data: CollectionResult, options?: TOptions): string;
}
```

#### FormatService

Main service for format conversion operations:

```typescript
interface FormatService {
  convert<TOptions>(data: CollectionResult, formatName: string, options?: TOptions): string;
  getAvailableFormats(): string[];
  isFormatSupported(formatName: string): boolean;
}
```

#### ConverterRegistry

Manages converter registration and retrieval:

```typescript
interface ConverterRegistry {
  register<TOptions>(converter: FormatConverter<TOptions>): void;
  get(name: string): FormatConverter | undefined;
  list(): string[];
  has(name: string): boolean;
}
```

### SOLID Principles Implementation

1. **Single Responsibility**: Each converter handles one format
2. **Open/Closed**: New formats can be added without modifying existing code
3. **Liskov Substitution**: All converters are interchangeable
4. **Interface Segregation**: Small, focused interfaces
5. **Dependency Inversion**: Depends on abstractions, not implementations

## Advanced Usage

### Custom Service with Registry

```typescript
import { DefaultFormatService, DefaultConverterRegistry } from 'web-link-collector';

// Create custom registry
const registry = new DefaultConverterRegistry();

// Create service with custom registry
const service = new DefaultFormatService(registry);

// Register converters
service.registerConverter(csvConverter);
service.registerConverter(markdownConverter);
```

### Error Handling

```typescript
import { UnsupportedFormatError, ConversionError } from 'web-link-collector';

try {
  const result = formatService.convert(data, 'unknown-format');
} catch (error) {
  if (error instanceof UnsupportedFormatError) {
    console.log('Format not supported:', error.message);
    console.log('Available formats:', formatService.getAvailableFormats());
  } else if (error instanceof ConversionError) {
    console.log('Conversion failed:', error.message);
  }
}
```

## Real-World Example

Here's a complete example using real WebLinkCollector data:

```typescript
import { collectLinks, createFormatService } from 'web-link-collector';

async function convertToNotebookLM() {
  // Collect links
  const result = await collectLinks('https://docs.anthropic.com/ja/docs/claude-code/overview', {
    depth: 1,
  });

  // Create format service
  const formatService = createFormatService();

  // Convert to NotebookLM format
  const notebookLmUrls = formatService.convert(result, 'notebooklm');

  console.log(`Converted ${result.allCollectedUrls.length} URLs for NotebookLM:`);
  console.log(notebookLmUrls);

  // Save to file for easy import
  await Bun.write('notebooklm-urls.txt', notebookLmUrls);
}
```

## Testing

The format conversion system includes comprehensive tests:

```bash
# Run formatter tests
bun test tests/formatters/

# Run all tests including formatters
bun test
```

Test coverage includes:

- Unit tests for all components
- Integration tests with real data
- Edge cases and error handling
- Performance validation

## Future Extensions

The architecture supports easy addition of new formats:

- **CSV**: Spreadsheet-compatible format
- **JSON**: Structured data format
- **XML**: Markup-based format
- **Markdown**: Documentation-friendly format
- **Plain Text**: Simple list format
- **Custom formats**: Any specific requirements
