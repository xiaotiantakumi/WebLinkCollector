# WebLinkCollector TypeScript Example

This is a standalone TypeScript project that demonstrates how to use WebLinkCollector with full type safety using Bun as the runtime.

## Features

- 🔒 **Type Safety**: Full TypeScript support with proper type definitions
- ⚡ **Bun Runtime**: Fast execution with Bun
- 🛠️ **Development Tools**: ESLint, Prettier, and TypeScript compiler
- 📊 **Advanced Examples**: Complex crawling scenarios with error handling
- 🔧 **Custom Types**: Extended type definitions for advanced use cases

## Setup

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Run basic example**:

   ```bash
   bun run dev
   ```

3. **Run advanced example**:

   ```bash
   bun run advanced
   ```

4. **Build TypeScript**:

   ```bash
   bun run build
   ```

5. **Run built JavaScript**:
   ```bash
   bun run start
   ```

## Available Scripts

- `bun run dev` - Run TypeScript directly with Bun
- `bun run build` - Compile TypeScript to JavaScript
- `bun run start` - Run compiled JavaScript
- `bun run advanced` - Run advanced example
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Fix ESLint errors
- `bun run format` - Format code with Prettier
- `bun run tsc` - TypeScript type checking
- `bun run check` - Run linting and type checking
- `bun run clean` - Clean build directory

## Project Structure

```
src/
├── index.ts          # Basic typed examples
├── advanced.ts       # Advanced crawler with error handling
└── types.ts          # Custom type definitions and presets
```

## Type Safety Examples

### Basic Usage with Types

```typescript
import { collectLinks } from 'weblinkcolector';
import type { CollectLinksOptions, CollectLinksResult } from 'weblinkcolector';

const options: CollectLinksOptions = {
  url: 'https://example.com',
  depth: 2,
  selector: 'a',
  delay: 1000,
};

const result: CollectLinksResult = await collectLinks(options);
```

### Custom Type Extensions

```typescript
import { FILTER_PRESETS } from './types.js';

// Use predefined filter presets
const result = await collectLinks({
  url: 'https://docs.github.com',
  filter: FILTER_PRESETS.documentation,
});
```

### Advanced Error Handling

```typescript
class AdvancedWebCrawler {
  async crawlMultipleUrls(urls: string[]): Promise<DetailedCrawlResult[]> {
    // Type-safe parallel crawling with error handling
  }
}
```

## Key Features Demonstrated

1. **Type Safety**: All WebLinkCollector types are properly used
2. **Error Handling**: TypeScript-based error handling patterns
3. **Custom Types**: Extended interfaces for advanced use cases
4. **Filter Presets**: Predefined filtering configurations
5. **Parallel Crawling**: Multiple URLs with concurrent processing
6. **Statistics**: Detailed crawl statistics and reporting
7. **Export Functions**: JSON export with type safety

## Configuration

The project uses the same configuration as the main WebLinkCollector project:

- **TypeScript**: ESNext target with bundler module resolution
- **ESLint**: TypeScript rules with Prettier integration
- **Prettier**: Consistent code formatting
- **Bun**: Fast runtime and package management

## Development

- All TypeScript files are in `src/`
- Built JavaScript files go to `dist/`
- Type definitions are generated automatically
- Hot reloading with `bun run dev`

## Notes

- Uses `.js` extensions in imports for proper ESM compatibility
- Supports both development and production builds
- Includes comprehensive error handling examples
- Demonstrates advanced TypeScript patterns
