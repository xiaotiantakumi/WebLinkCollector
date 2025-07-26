# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebLinkCollector is a TypeScript library and CLI tool for recursively collecting links from web pages. It crawls websites up to a configurable depth, extracts links using CSS selectors, and outputs structured data in JSON or text format.

## Development Commands

### Build & Development

- `bun run build` - Build the project (ESM bundles + TypeScript declarations)
- `bun run dev` - Run the CLI tool in development mode
- `bun run start` - Run the built CLI tool

### Testing

- `bun test` - Run all tests except CLI tests
- `bun test:core` - Run core functionality tests (filter, logger, parser, fetcher)
- `bun test tests/filename.test.ts` - Run specific test file

### Code Quality

- `bun run lint` - Check for linting issues with ESLint
- `bun run lint:fix` - Auto-fix linting issues
- `bun run format` - Format code with Prettier
- `bun run check` - Run both lint and core tests
- `bun run tsc` - TypeScript type checking

### Release

- `bun run prepublishOnly` - Runs check + build (used before npm publish)

## Architecture

### Core Components

- **collector.ts** - Main recursive link collection logic
- **fetcher.ts** - HTTP client for fetching web pages with rate limiting
- **parser.ts** - HTML parsing and link extraction using Cheerio
- **filter.ts** - URL filtering logic with domain/path/regex/keyword support
- **logger.ts** - Structured logging with configurable levels
- **types.ts** - Shared TypeScript interfaces and types
- **formatters/** - Format conversion system for collection results (NotebookLM, etc.)
- **utils.ts** - Utility functions for statistics and result analysis
- **presets.ts** - Predefined filter configurations
- **convenience.ts** - High-level convenience functions

### Key Features

- Recursive crawling with depth limits (max 5)
- CSS selector-based link extraction
- URL filtering by domain, path prefix, regex, and keywords
- Rate limiting with configurable delays
- Exclusion of URLs in query parameters and hash fragments
- Comprehensive error handling and logging
- Format conversion system for exporting results (NotebookLM, custom formats)
- Statistics and analysis utilities
- Predefined filter presets for common use cases

### Data Flow

1. Initial URL validation and parameter setup
2. Recursive fetching with depth tracking
3. HTML parsing and link extraction
4. URL filtering and deduplication
5. Result aggregation with statistics

## Configuration

The project uses:

- **Bun** as the primary runtime and package manager
- **TypeScript** with ESNext target and strict mode
- **ESLint** for linting with TypeScript and Jest plugins
- **Prettier** for code formatting
- **Husky** for pre-commit hooks

## Testing Guidelines

- Use `bun:test` instead of Jest globals
- Maintain ESM syntax throughout
- Mock HTTP requests using Bun's `mock()` function
- Set Response.url property using `Object.defineProperty()`
- Ensure test coverage stays above 91%
- Prefix unused variables with `_`

### Bun Test Pattern

```typescript
import { describe, it, beforeEach, expect, mock } from 'bun:test';

const mockFetch = mock(() => Promise.resolve(new Response()));

beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockClear();
});
```

## Code Standards

### Import/Export Conventions

- **NEVER use `.js` extensions in import statements** - Use relative imports without extensions (e.g., `'./types'` not `'./types.js'`)
- Use consistent import patterns across the codebase:

  ```typescript
  // Correct
  import { something } from './module';
  import type { SomeType } from '../types';

  // Incorrect
  import { something } from './module.js';
  import type { SomeType } from '../types.js';
  ```

- Follow existing patterns in `src/cli/args.ts` and other core files

### General Standards

- Use logger interface instead of console.log in production code
- Prefix unused arguments with `_`
- Handle URL parsing failures explicitly
- Always exclude DEFAULT_EXCLUDED_PATHS for administrative paths
- Set appropriate delays for rate limiting
- Use FilterConditions type for URL filtering
- Implement proper error handling with try-catch blocks
- Follow SOLID principles for new modules (see formatters/ for example)

## File Structure

- `src/` - Source code
  - `formatters/` - Format conversion system (NotebookLM, etc.)
  - `cli/` - CLI-specific code (args parsing, config loading)
- `bin/` - CLI entry point
- `tests/` - Test files (separate tsconfig.json)
  - `formatters/` - Tests for format conversion system
- `examples/` - Configuration examples and usage demonstrations
- `dist/` - Built output (ESM format)

## Module Guidelines

### When Adding New Features

1. **Backwards Compatibility**: New features should not break existing functionality
2. **Testing**: All new code must have comprehensive test coverage (>91%)
3. **Documentation**: Update CLAUDE.md and add examples if applicable
4. **Import Conventions**: Always follow existing import patterns (no .js extensions)
5. **Architecture**: Follow established patterns in existing modules

### Format Converters

The `formatters/` directory demonstrates proper architecture for extensible systems:

- Interface-based design (`FormatConverter`)
- Registry pattern for plugin management
- Service layer for high-level operations
- Comprehensive error handling with custom error types
- Full test coverage including integration tests

Use this as a reference when implementing similar extensible systems.

## VSCode Integration

### Test Support

VSCode may show TypeScript errors for Bun test files because it uses Node.js TypeScript compiler. This is normal for Bun projects.

**Complete solution implemented:**

1. **Bun VSCode Extension** - Install `oven.bun-vscode` extension for proper Bun support
2. **Jest Extension Disabled** - Prevent Jest from interfering with Bun tests
3. **Type Definitions** - `types/bun-test.d.ts` provides complete `bun:test` module types
4. **Debug Configurations** - `.vscode/launch.json` with Bun-specific debug configs
5. **Workspace Settings** - `.vscode/settings.json` optimized for Bun development
6. **Extension Recommendations** - `.vscode/extensions.json` suggests required extensions

### Available Debug Configurations

- **Launch wlc (Bun)** - Debug the CLI tool
- **Bun: Run All Tests** - Debug all tests
- **Bun: Run Current Test File** - Debug currently open test file
- **Bun: Run Formatters Tests** - Debug formatters tests specifically

### Development Experience

- ✅ Complete TypeScript support with proper type definitions
- ✅ Bun-specific debugging configurations
- ✅ Jest extension disabled to prevent conflicts
- ✅ Recommended extensions for optimal workflow
- ✅ Tests run correctly with `bun test` and debug properly
- ✅ Use `bun run check` for complete validation (lint + tests)

**Important:** Install the Bun VSCode extension (`oven.bun-vscode`) for the best experience.
