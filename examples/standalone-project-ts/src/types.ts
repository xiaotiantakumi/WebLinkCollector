import type { CollectionResult } from 'web-link-collector';

export interface CrawlStatistics {
  totalLinks: number;
  uniqueDomains: number;
  pagesVisited: number;
  crawlTime: number;
  linksByDepth: Record<number, number>;
  errorCount: number;
}

export interface DetailedCrawlResult extends CollectionResult {
  statistics: CrawlStatistics;
}


// エラーハンドリング用の型
export interface CrawlError {
  url: string;
  error: string;
  timestamp: Date;
  depth: number;
}

