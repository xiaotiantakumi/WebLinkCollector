# WebLinkCollector

A library and CLI tool to recursively collect links from a given initial URL and output them as structured data.

## Features

- Recursively crawl web pages up to a configurable depth (max 5)
- Extract links from HTML content using CSS selectors
- Filter URLs by domain, path prefix, regex patterns, and keywords
- Output results as JSON or plain text
- Configurable logging levels and request delays
- Support for configuration via JSON/YAML files

## Installation

### Global Installation

```bash
npm install -g web-link-collector
```

### Local Installation

```bash
npm install web-link-collector
```

## CLI Usage

Basic usage with the CLI tool:

```bash
web-link-collector --initialUrl https://example.com --depth 2
```

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--initialUrl` | The starting URL for link collection | *Required* |
| `--depth` | The maximum recursion depth (0-5) | 1 |
| `--filters` | JSON string of filter conditions | None |
| `--filtersFile` | Path to a JSON or YAML file containing filter conditions | None |
| `--selector` | CSS selector to limit link extraction scope (only for the initial page) | None |
| `--delayMs` | Delay in milliseconds between requests | 1000 |
| `--logLevel` | Logging level (debug, info, warn, error, none) | info |
| `--output` | Output file path (if not specified, outputs to stdout) | None |
| `--format` | Output format (json, txt) | json |
| `--configFile` | Path to a JSON or YAML configuration file | None |
| `--help`, `-h` | Show help message | - |

### Examples

Collect links from a website with a recursion depth of 2:

```bash
web-link-collector --initialUrl https://example.com --depth 2
```

Only collect links from the specified domain:

```bash
web-link-collector --initialUrl https://example.com --filters '{"domain": "example.com"}'
```

Limit link extraction to a specific section of the initial page:

```bash
web-link-collector --initialUrl https://example.com --selector ".main-content a"
```

Output results to a text file:

```bash
web-link-collector --initialUrl https://example.com --output results.txt --format txt
```

Use a configuration file:

```bash
web-link-collector --configFile config.yaml
```

## Library Usage

You can also use WebLinkCollector as a library in your Node.js applications:

```javascript
import { collectLinks } from 'web-link-collector';

// Simple usage
const results = await collectLinks('https://example.com', {
  depth: 2
});

console.log(results);

// With more options
const results = await collectLinks('https://example.com', {
  depth: 2,
  filters: [
    { domain: 'example.com' },
    { domain: 'api.example.com' }
  ],
  selector: '.main-content a',
  delayMs: 2000,
  logLevel: 'info'
});

// Access results
console.log(`Collected ${results.allCollectedUrls.length} URLs`);
console.log(`Found ${results.linkRelationships.length} link relationships`);
console.log(`Encountered ${results.errors.length} errors`);
console.log(`Duration: ${results.stats.durationMs}ms`);
```

## Configuration Files

You can use JSON or YAML configuration files to specify options. Here's an example:

```yaml
initialUrl: https://example.com
depth: 2
delayMs: 2000
logLevel: info
format: json

# CSS selector to limit link extraction on the initial page
selector: .main-content a

# Filters define which URLs will be collected
filters:
  # First filter condition (OR logic between filter objects)
  - domain: example.com
    pathPrefix: /blog
  
  # Second filter condition
  - domain: api.example.com
```

See the `examples` directory for more configuration examples.

## Filter Options

Filters allow you to control which URLs are collected:

- `domain`: String or array of strings to match against URL domains
- `pathPrefix`: String or array of strings to match against URL paths
- `regex`: String or array of regex patterns to match against full URLs
- `keywords`: String or array of strings to match anywhere in the URL

Multiple filter objects are combined with OR logic, while conditions within a single filter object use AND logic.

## Result Format

The JSON output structure includes:

```typescript
{
  initialUrl: string;
  depth: number;
  allCollectedUrls: string[];
  linkRelationships: {
    source: string;
    found: string;
  }[];
  errors: {
    url: string;
    errorType: string;
    message: string;
  }[];
  stats: {
    startTime: string;
    endTime: string;
    durationMs: number;
    totalUrlsScanned: number;
    totalUrlsCollected: number;
    maxDepthReached: number;
  };
}
```

## License

MIT