# How to Write Configuration Files

This guide explains how to create configuration files for WebLinkCollector to streamline your link collection tasks.

## Configuration File Formats

WebLinkCollector supports both JSON and YAML configuration files. YAML is recommended for better readability.

## Basic Configuration Structure

A configuration file can include any CLI option as a key-value pair:

```yaml
initialUrl: https://example.com
depth: 2
delayMs: 50 # Recommended: 50ms for faster crawling
logLevel: info
format: json
output: results.json
```

## Key Configuration Options

### Required Settings

- `initialUrl`: The starting URL for link collection

### Common Settings

- `depth`: Maximum recursion depth (0-5, default: 1)
- `delayMs`: Delay between requests in milliseconds (default: 1000, recommended: 50)
- `logLevel`: Logging level (debug, info, warn, error, none)
- `format`: Output format (json, txt)
- `output`: Output file path (if not specified, outputs to stdout)

### Link Extraction Control

- `selector`: CSS selector to limit link extraction on the initial page only
- `element`: HTML element to use as starting point for link extraction
- `skipQueryUrls`: Skip URLs embedded in query parameters (default: true)
- `skipHashUrls`: Skip URLs embedded in hash fragments (default: true)

## Filter Configuration

Filters control which URLs are collected. You can specify multiple filter conditions:

```yaml
filters:
  # First filter condition (OR logic between filter objects)
  - domain: example.com
    pathPrefix: /docs

  # Second filter condition
  - domain: api.example.com
    keywords: [api, v1]

  # Third filter condition with regex
  - regex: ".*\\.pdf$"
```

### Filter Options

- `domain`: String or array - match URL domains
- `pathPrefix`: String or array - match URL path prefixes
- `regex`: String or array - regex patterns for full URLs
- `keywords`: String or array - match keywords anywhere in URL

### Filter Logic

- Multiple filter objects use **OR** logic
- Conditions within a single filter object use **AND** logic

## CSS Selector Usage

The `selector` option allows you to target specific parts of the initial page for link extraction.

### Selector Examples

Target links in a specific element:

```yaml
selector: '#main-content a'
```

Target links with specific classes:

```yaml
selector: '.navigation a, .sidebar a'
```

Target links in navigation:

```yaml
selector: 'nav a'
```

**Important**: Selectors only apply to the initial page (depth 0). Subsequent pages will extract all links regardless of the selector.

## Example Configuration for Different Use Cases

### Documentation Site Crawling

```yaml
initialUrl: https://docs.example.com
depth: 3
selector: '#content a'
filters:
  - domain: docs.example.com
    pathPrefix: /guides
delayMs: 50
logLevel: info
format: json
output: docs-links.json
```

### API Documentation with Specific Section

```yaml
initialUrl: https://api-docs.example.com
depth: 1
selector: '#api-reference a'
filters:
  - pathPrefix: [/api, /reference]
  - keywords: [endpoint, method]
delayMs: 50
format: txt
output: api-endpoints.txt
```

### Blog Post Collection

```yaml
initialUrl: https://blog.example.com
depth: 2
element: main
filters:
  - pathPrefix: /posts
  - regex: ".*/(\\d{4})/(\\d{2})/(\\d{2})/.*"
skipQueryUrls: true
skipHashUrls: true
```

## YAML Special Characters

When using special characters in YAML, wrap values in quotes:

```yaml
# Correct
selector: "#sidebar-content > div"
regex: ".*\\.html$"

# Incorrect (will cause parsing errors)
selector: #sidebar-content > div
regex: .*\.html$
```

## Configuration Priority

When both CLI options and configuration files are provided:

1. CLI options take precedence over configuration file values
2. Only explicitly specified CLI options override the configuration
3. Use `--configFile` to specify the configuration file path

## Usage Examples

### Using Configuration File

```bash
# Development mode (recommended)
bun run dev --configFile my-config.yaml

# Using built CLI
bun run start --configFile my-config.yaml

# Override specific options
bun run dev --configFile my-config.yaml --depth 1 --logLevel debug
```

### Example Request Translation

For a request like:

> "Collect information from https://docs.anthropic.com/ja/docs/claude-code/overview, targeting selector #sidebar-content > div, first level only"

Create this configuration:

```yaml
initialUrl: https://docs.anthropic.com/ja/docs/claude-code/overview
depth: 1
selector: '#sidebar-content > div a'
delayMs: 50
logLevel: info
format: json
output: anthropic-docs.json
filters:
  - domain: docs.anthropic.com
```

This configuration will:

- Start from the specified Anthropic documentation page
- Only collect links from the sidebar content area
- Crawl only the first level (no recursion)
- Save results to a JSON file
- Stay within the docs.anthropic.com domain
