import { collectLinks } from 'weblinkcolector';
import { writeFileSync } from 'fs';

async function advancedExample() {
  console.log('🔥 Advanced WebLinkCollector Example');
  console.log('===================================\n');

  try {
    // Advanced configuration with comprehensive filtering
    const config = {
      url: 'https://developer.mozilla.org',
      depth: 3,
      selector: 'a[href]',
      delay: 1500,
      filter: {
        allowedDomains: ['developer.mozilla.org'],
        excludedPaths: ['/search', '/users', '/admin'],
        pathPrefixes: ['/docs/', '/api/'],
        keywords: ['javascript', 'web', 'api', 'guide'],
        regexPatterns: [/\/docs\/.+/, /\/api\/.+/]
      }
    };

    console.log('🔧 Configuration:');
    console.log(`   URL: ${config.url}`);
    console.log(`   Max depth: ${config.depth}`);
    console.log(`   Delay: ${config.delay}ms`);
    console.log(`   Selector: ${config.selector}`);
    console.log(`   Allowed domains: ${config.filter.allowedDomains.join(', ')}`);
    console.log(`   Keywords: ${config.filter.keywords.join(', ')}`);
    console.log('');

    console.log('🕸️  Starting crawl...');
    const startTime = Date.now();
    
    const result = await collectLinks(config);
    const endTime = Date.now();

    console.log('✅ Crawl completed!');
    console.log(`⏱️  Total time: ${endTime - startTime}ms`);
    console.log(`📊 Statistics:`);
    console.log(`   - Links found: ${result.links.length}`);
    console.log(`   - Pages visited: ${result.pagesVisited}`);
    console.log(`   - Crawl time: ${result.crawlTime}ms`);
    console.log('');

    // Group links by depth
    const linksByDepth = result.links.reduce((acc, link) => {
      const depth = link.depth;
      if (!acc[depth]) acc[depth] = [];
      acc[depth].push(link);
      return acc;
    }, {});

    console.log('📈 Links by depth:');
    Object.keys(linksByDepth).sort((a, b) => Number(a) - Number(b)).forEach(depth => {
      console.log(`   Depth ${depth}: ${linksByDepth[depth].length} links`);
    });
    console.log('');

    // Show sample links from each depth
    console.log('🔍 Sample links:');
    Object.keys(linksByDepth).sort((a, b) => Number(a) - Number(b)).forEach(depth => {
      const links = linksByDepth[depth];
      console.log(`   Depth ${depth} (showing first 3):`);
      links.slice(0, 3).forEach((link, index) => {
        console.log(`     ${index + 1}. ${link.url}`);
        if (link.title) console.log(`        Title: ${link.title}`);
      });
    });

    // Save results to JSON file
    const output = {
      config,
      crawlTime: endTime - startTime,
      statistics: {
        totalLinks: result.links.length,
        pagesVisited: result.pagesVisited,
        linksByDepth: Object.keys(linksByDepth).reduce((acc, depth) => {
          acc[depth] = linksByDepth[depth].length;
          return acc;
        }, {})
      },
      links: result.links
    };

    writeFileSync('crawl-results.json', JSON.stringify(output, null, 2));
    console.log('\n💾 Results saved to crawl-results.json');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

advancedExample().catch(console.error);