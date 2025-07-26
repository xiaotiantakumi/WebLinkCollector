# WebLinkCollector Example Project

This is a standalone example project that demonstrates how to use WebLinkCollector as an external dependency in your own projects.

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the basic example**:

   ```bash
   npm start
   ```

3. **Run the advanced example**:
   ```bash
   node advanced-example.js
   ```

## Examples

### Basic Usage (`index.js`)

Demonstrates:

- Basic link collection
- Domain filtering
- Keyword filtering
- Different configuration options

### Advanced Usage (`advanced-example.js`)

Demonstrates:

- Comprehensive filtering options
- Statistics collection
- Results grouping by depth
- JSON output export

## Configuration Options

```javascript
const config = {
  url: 'https://example.com', // Starting URL
  depth: 2, // Maximum crawl depth
  selector: 'a', // CSS selector for links
  delay: 1000, // Delay between requests (ms)
  filter: {
    // Optional filtering
    allowedDomains: ['example.com'],
    excludedPaths: ['/admin', '/api'],
    pathPrefixes: ['/docs/', '/blog/'],
    keywords: ['tech', 'programming'],
    regexPatterns: [/\/docs\/.+/],
  },
};
```

## Output Format

The `collectLinks` function returns:

```javascript
{
  links: [
    {
      url: 'https://example.com/page1',
      title: 'Page Title',
      depth: 1,
      parentUrl: 'https://example.com'
    }
  ],
  pagesVisited: 5,
  crawlTime: 1250
}
```

## Development

- `npm run dev` - Run with file watching
- `npm run install-deps` - Install dependencies

## Notes

- The crawler respects rate limits with configurable delays
- URLs in query parameters and hash fragments are excluded
- Administrative paths are automatically excluded
- Maximum depth is limited to 5 for performance
