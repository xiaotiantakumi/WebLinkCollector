import { collectLinks, type CollectionOptions, type CollectionResult } from 'web-link-collector';
import { writeFileSync } from 'fs';
import { FILTER_PRESETS, type DetailedCrawlResult, type CrawlError } from './types.js';

// 高度な型安全なクローラークラス
class AdvancedWebCrawler {
  private readonly baseOptions: Partial<CollectionOptions>;
  private readonly errors: CrawlError[] = [];

  constructor(baseOptions: Partial<CollectionOptions> = {}) {
    this.baseOptions = {
      delayMs: 1000,
      selector: 'a',
      ...baseOptions,
    };
  }

  // 複数URLの並列クロール
  async crawlMultipleUrls(
    urls: string[],
    options: Partial<CollectionOptions> = {}
  ): Promise<DetailedCrawlResult[]> {
    const mergedOptions = { ...this.baseOptions, ...options };
    
    const promises = urls.map(url => 
      this.crawlSingleUrl(url, mergedOptions)
    );

    return Promise.all(promises);
  }

  // 単一URLのクロール（エラーハンドリング付き）
  private async crawlSingleUrl(
    url: string,
    options: Partial<CollectionOptions>
  ): Promise<DetailedCrawlResult> {
    try {
      const startTime = Date.now();
      const result = await collectLinks(url, {
        depth: 1,
        ...options,
      } as CollectionOptions);

      const endTime = Date.now();
      const statistics = this.calculateDetailedStatistics(result, endTime - startTime);

      return {
        ...result,
        statistics,
      };
    } catch (error) {
      const crawlError: CrawlError = {
        url,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        depth: 0,
      };

      this.errors.push(crawlError);

      return {
        initialUrl: url,
        depth: 0,
        allCollectedUrls: [],
        linkRelationships: [],
        errors: [{ url, errorType: 'CRAWL_ERROR', message: crawlError.error }],
        stats: {
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          durationMs: 0,
          totalUrlsScanned: 0,
          totalUrlsCollected: 0,
          maxDepthReached: 0,
        },
        statistics: {
          totalLinks: 0,
          uniqueDomains: 0,
          pagesVisited: 0,
          crawlTime: 0,
          linksByDepth: {},
          errorCount: 1,
        },
      };
    }
  }

  // 詳細統計情報の計算
  private calculateDetailedStatistics(
    result: CollectionResult,
    actualCrawlTime: number
  ): DetailedCrawlResult['statistics'] {
    const uniqueDomains = new Set(
      result.allCollectedUrls.map(url => {
        try {
          return new globalThis.URL(url).hostname;
        } catch {
          return 'unknown';
        }
      })
    ).size;

    // リンク関係から深度を推定
    const linksByDepth: Record<number, number> = {};
    result.linkRelationships.forEach((rel, index) => {
      const depth = index < 10 ? 1 : 2; // 簡単な深度推定
      linksByDepth[depth] = (linksByDepth[depth] || 0) + 1;
    });

    return {
      totalLinks: result.allCollectedUrls.length,
      uniqueDomains,
      pagesVisited: result.stats.totalUrlsScanned,
      crawlTime: actualCrawlTime,
      linksByDepth,
      errorCount: result.errors.length,
    };
  }

  // JSON形式でのエクスポート
  exportToJson(results: DetailedCrawlResult[], filename: string): void {
    const exportData = {
      timestamp: new Date().toISOString(),
      crawlCount: results.length,
      totalLinks: results.reduce((sum, result) => sum + result.statistics.totalLinks, 0),
      totalErrors: results.reduce((sum, result) => sum + result.statistics.errorCount, 0),
      results,
      errors: this.errors,
    };

    writeFileSync(filename, JSON.stringify(exportData, null, 2));
    console.log(`💾 Results exported to ${filename}`);
  }

  // エラーレポートの生成
  getErrorReport(): string {
    if (this.errors.length === 0) {
      return '✅ No errors occurred during crawling.';
    }

    let report = `❌ ${this.errors.length} errors occurred:\n`;
    this.errors.forEach((error, index) => {
      report += `  ${index + 1}. ${error.url}: ${error.error}\n`;
    });

    return report;
  }
}

// 高度な使用例
async function advancedExample(): Promise<void> {
  console.log('🔥 Advanced TypeScript WebLinkCollector Example');
  console.log('===============================================\n');

  const crawler = new AdvancedWebCrawler({
    depth: 2,
    delayMs: 1500,
  });

  try {
    // 複数のサイトを並列でクロール
    const urls = [
      'https://developer.mozilla.org',
      'https://docs.github.com',
      'https://nodejs.org',
    ];

    console.log('🕸️  Starting parallel crawl of multiple sites...');
    const results = await crawler.crawlMultipleUrls(urls, {
      filters: FILTER_PRESETS.documentation,
      depth: 1,
    });

    console.log('✅ Crawl completed!\n');

    // 結果の詳細分析
    results.forEach((result, index) => {
      const url = urls[index];
      console.log(`📊 Results for ${url}:`);
      console.log(`   - Links found: ${result.statistics.totalLinks}`);
      console.log(`   - Unique domains: ${result.statistics.uniqueDomains}`);
      console.log(`   - Pages visited: ${result.statistics.pagesVisited}`);
      console.log(`   - Crawl time: ${result.statistics.crawlTime}ms`);
      console.log(`   - Errors: ${result.statistics.errorCount}`);
      console.log('');
    });

    // 集約統計
    const totalLinks = results.reduce((sum, result) => sum + result.statistics.totalLinks, 0);
    const totalTime = results.reduce((sum, result) => sum + result.statistics.crawlTime, 0);
    const totalPages = results.reduce((sum, result) => sum + result.statistics.pagesVisited, 0);

    console.log('📈 Aggregate Statistics:');
    console.log(`   - Total links: ${totalLinks}`);
    console.log(`   - Total time: ${totalTime}ms`);
    console.log(`   - Total pages visited: ${totalPages}`);
    console.log(`   - Average links per page: ${totalPages > 0 ? Math.round(totalLinks / totalPages) : 0}`);
    console.log('');

    // 結果をJSONにエクスポート
    crawler.exportToJson(results, 'advanced-crawl-results.json');

    // エラーレポート
    console.log(crawler.getErrorReport());

  } catch (error) {
    console.error('❌ Fatal error:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// 型安全な設定バリデーション（使用例）
 
function _validateCrawlOptions(url: string, options: CollectionOptions): boolean {
  const errors: string[] = [];

  if (!url || typeof url !== 'string') {
    errors.push('URL is required and must be a string');
  }

  if (options.depth !== undefined && (options.depth < 1 || options.depth > 5)) {
    errors.push('Depth must be between 1 and 5');
  }

  if (options.delayMs !== undefined && options.delayMs < 0) {
    errors.push('Delay cannot be negative');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration errors:');
    errors.forEach(error => console.error(`   - ${error}`));
    return false;
  }

  return true;
}

// メイン実行
async function main(): Promise<void> {
  try {
    await advancedExample();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// 実行
main().catch(console.error);