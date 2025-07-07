import { 
  // Enhanced API
  collect, 
  collectDocs,
  collectGitHub,
  collectMultiple,
  // Filter building
  createFilter,
  FILTER_PRESETS,
  // Analysis and export
  exportResults,
  analyzeCrawlEfficiency,
  getTopDomains,
  // Types
  type EnhancedCollectionResult,
  // Legacy API for comparison
  collectLinks,
  type CollectionResult,
} from 'web-link-collector';

// Enhanced API demonstration
async function enhancedExamples(): Promise<void> {
  console.log('🚀 Enhanced WebLinkCollector API Examples');
  console.log('==========================================\n');

  try {
    console.log('📍 Example 1: Enhanced collect with presets and statistics');
    const result: EnhancedCollectionResult = await collect('https://example.com', {
      depth: 2,
      preset: 'documentation',
      includeStatistics: true,
      delayMs: 1000,
    });

    // Enhanced type-safe property access with statistics
    console.log(`✅ Found ${result.allCollectedUrls.length} links`);
    console.log(`⏱️  Crawl time: ${result.stats.durationMs}ms`);
    console.log(`📊 URLs scanned: ${result.stats.totalUrlsScanned}`);
    
    if (result.statistics) {
      console.log(`🎯 Crawl efficiency: ${(result.statistics.crawlEfficiency * 100).toFixed(1)}%`);
      console.log(`🔗 Internal links: ${result.statistics.internalLinks}`);
      console.log(`🌐 External links: ${result.statistics.externalLinks}`);
      
      // Show top domains
      const topDomains = getTopDomains(result, 3);
      console.log('Top domains:');
      topDomains.forEach((domain: any, index: number) => {
        console.log(`  ${index + 1}. ${domain.domain}: ${domain.count} links (${domain.percentage}%)`);
      });
    }
    console.log('');

    console.log('📍 Example 2: Convenience functions');
    
    // Documentation-specific collection
    const docsResult = await collectDocs('https://docs.github.com', 1);
    console.log(`✅ Documentation crawler found ${docsResult.allCollectedUrls.length} links`);
    
    // GitHub-specific collection
    const githubResult = await collectGitHub('https://github.com/microsoft/TypeScript', 1);
    console.log(`✅ GitHub crawler found ${githubResult.allCollectedUrls.length} links`);
    console.log('');

    console.log('📍 Example 3: Multiple URL collection with concurrency');
    const urls = [
      'https://docs.github.com',
      'https://docs.microsoft.com',
      'https://developer.mozilla.org',
    ];
    
    const multiResults = await collectMultiple(urls, {
      preset: 'documentation',
      depth: 1,
      delayMs: 500,
    }, 2); // Concurrency of 2

    console.log(`✅ Collected from ${multiResults.length} sites:`);
    multiResults.forEach((result: any, index: number) => {
      console.log(`  ${index + 1}. ${result.initialUrl}: ${result.allCollectedUrls.length} links`);
      if (result.statistics) {
        console.log(`     Efficiency: ${(result.statistics.crawlEfficiency * 100).toFixed(1)}%`);
      }
    });
    console.log('');

    console.log('📍 Example 4: Filter Builder pattern');
    const customFilters = createFilter()
      .fromPreset('documentation')
      .addDomain(['example.com', 'test.com'])
      .addPathPrefix(['/api/', '/docs/'])
      .addKeywords(['tutorial', 'guide', 'reference'])
      .build();

    const customResult = await collect('https://example.com', {
      depth: 1,
      additionalFilters: customFilters,
      includeStatistics: true,
    });

    console.log(`✅ Custom filtered collection: ${customResult.allCollectedUrls.length} links`);
    console.log('');

    console.log('📍 Example 5: Analysis and Export');
    if (result.statistics) {
      const analysis = analyzeCrawlEfficiency(result);
      console.log('📊 Crawl Analysis:');
      console.log(`   Success rate: ${analysis.successRate}%`);
      console.log(`   Error rate: ${analysis.errorRate}%`);
      console.log(`   Insights: ${analysis.insights.join(', ')}`);
      
      if (analysis.recommendations.length > 0) {
        console.log(`   Recommendations: ${analysis.recommendations.join(', ')}`);
      }
    }

    // Export to JSON
    const jsonExport = exportResults(result, 'json');
    console.log(`📤 JSON export size: ${jsonExport.length} characters`);
    
    // Export to CSV
    const csvExport = exportResults(result, 'csv');
    console.log(`📤 CSV export: ${csvExport.split('\n').length} lines`);
    console.log('');

  } catch (error) {
    // TypeScript error handling
    if (error instanceof Error) {
      console.error('❌ Error:', error.message);
    } else {
      console.error('❌ Unknown error:', error);
    }
  }
}


// 型安全な統計情報の計算
function calculateStatistics(result: CollectionResult): {
  uniqueDomains: number;
  relationshipCount: number;
  errorCount: number;
} {
  const uniqueDomains = new Set(
    result.allCollectedUrls.map(url => {
      try {
        return new globalThis.URL(url).hostname;
      } catch {
        return 'unknown';
      }
    })
  ).size;

  return {
    uniqueDomains,
    relationshipCount: result.linkRelationships.length,
    errorCount: result.errors.length,
  };
}

// Legacy API comparison (backward compatibility)
async function legacyApiExample(): Promise<void> {
  console.log('🔄 Legacy API Comparison');
  console.log('========================\n');

  try {
    // Using the old API for comparison
    console.log('📍 Legacy collectLinks function:');
    const legacyResult: CollectionResult = await collectLinks('https://example.com', {
      depth: 1,
      selector: 'a',
      delayMs: 1000,
      filters: FILTER_PRESETS.documentation,
    });

    console.log(`✅ Legacy API found ${legacyResult.allCollectedUrls.length} links`);
    console.log(`   (No built-in statistics - user must calculate manually)`);
    
    // Manual statistics calculation (what users had to do before)
    const manualStats = calculateStatistics(legacyResult);
    console.log(`📈 Manual calculation - Unique domains: ${manualStats.uniqueDomains}`);
    console.log(`📈 Manual calculation - Link relationships: ${manualStats.relationshipCount}`);
    console.log(`📈 Manual calculation - Errors: ${manualStats.errorCount}`);
    console.log('');

  } catch (error) {
    console.error('Legacy API error:', error);
  }
}

// Main execution function
async function main(): Promise<void> {
  try {
    // Show enhanced API capabilities
    await enhancedExamples();
    
    // Show legacy API for comparison
    await legacyApiExample();

    console.log('🎉 All examples completed successfully!');
    console.log('   The enhanced API provides:');
    console.log('   ✅ Built-in filter presets');
    console.log('   ✅ Automatic statistics calculation');
    console.log('   ✅ Convenience functions for common use cases');
    console.log('   ✅ Advanced filter building with fluent API');
    console.log('   ✅ Export and analysis utilities');
    console.log('   ✅ Full backward compatibility');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// 実行
main().catch(console.error);