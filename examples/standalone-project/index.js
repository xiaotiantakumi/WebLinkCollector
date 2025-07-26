import { collectLinks } from 'weblinkcolector';

async function main() {
  console.log('🚀 WebLinkCollector Example');
  console.log('==========================\n');

  try {
    // Example 1: Basic link collection
    console.log('📍 Example 1: Basic link collection');
    const basicResult = await collectLinks({
      url: 'https://example.com',
      depth: 2,
      selector: 'a',
      delay: 1000
    });
    
    console.log(`✅ Found ${basicResult.links.length} links`);
    console.log(`⏱️  Crawl time: ${basicResult.crawlTime}ms`);
    console.log(`📊 Pages visited: ${basicResult.pagesVisited}`);
    console.log('First 5 links:');
    basicResult.links.slice(0, 5).forEach((link, index) => {
      console.log(`  ${index + 1}. ${link.url} (depth: ${link.depth})`);
    });
    console.log('');

    // Example 2: With domain filtering
    console.log('📍 Example 2: With domain filtering');
    const filteredResult = await collectLinks({
      url: 'https://github.com',
      depth: 1,
      selector: 'a',
      delay: 1000,
      filter: {
        allowedDomains: ['github.com'],
        excludedPaths: ['/search', '/settings']
      }
    });

    console.log(`✅ Found ${filteredResult.links.length} links (filtered)`);
    console.log(`📊 Pages visited: ${filteredResult.pagesVisited}`);
    console.log('');

    // Example 3: With keyword filtering
    console.log('📍 Example 3: With keyword filtering');
    const keywordResult = await collectLinks({
      url: 'https://news.ycombinator.com',
      depth: 1,
      selector: 'a',
      delay: 1000,
      filter: {
        keywords: ['tech', 'programming', 'javascript']
      }
    });

    console.log(`✅ Found ${keywordResult.links.length} links (keyword filtered)`);
    console.log('Tech-related links:');
    keywordResult.links.slice(0, 3).forEach((link, index) => {
      console.log(`  ${index + 1}. ${link.url}`);
      console.log(`     Title: ${link.title || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error);