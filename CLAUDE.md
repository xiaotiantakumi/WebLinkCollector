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

### Key Features

- Recursive crawling with depth limits (max 5)
- CSS selector-based link extraction
- URL filtering by domain, path prefix, regex, and keywords
- Rate limiting with configurable delays
- Exclusion of URLs in query parameters and hash fragments
- Comprehensive error handling and logging

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

- Use logger interface instead of console.log in production code
- Prefix unused arguments with `_`
- Handle URL parsing failures explicitly
- Always exclude DEFAULT_EXCLUDED_PATHS for administrative paths
- Set appropriate delays for rate limiting
- Use FilterConditions type for URL filtering
- Implement proper error handling with try-catch blocks

## File Structure

- `src/` - Source code
- `bin/` - CLI entry point
- `tests/` - Test files (separate tsconfig.json)
- `examples/` - Configuration examples
- `dist/` - Built output (ESM format)
