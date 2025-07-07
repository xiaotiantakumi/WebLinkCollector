import type { CollectionOptions, CollectionResult, Filter } from 'web-link-collector';

// カスタム型定義の拡張例
export interface ExtendedCollectionOptions extends CollectionOptions {
  userAgent?: string;
  timeout?: number;
}

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

// フィルター条件のプリセット
export const FILTER_PRESETS: Record<string, Filter[]> = {
  documentation: [
    {
      domain: ['docs.github.com', 'developer.mozilla.org'],
      pathPrefix: ['/docs/', '/documentation/', '/api/'],
      keywords: ['doc', 'guide', 'tutorial', 'api', 'reference'],
    },
  ],
  blog: [
    {
      pathPrefix: ['/blog/', '/post/', '/article/'],
      keywords: ['blog', 'post', 'article', 'news'],
    },
  ],
  github: [
    {
      domain: ['github.com'],
      pathPrefix: ['/repos/', '/orgs/', '/users/'],
    },
  ],
} as const;

// エラーハンドリング用の型
export interface CrawlError {
  url: string;
  error: string;
  timestamp: Date;
  depth: number;
}

export type CrawlErrorHandler = (error: CrawlError) => void;