/**
 * WebLinkCollector URL Fetcher Module
 * This module handles fetching HTML content from URLs.
 */
import { Logger } from './types';

/**
 * Delay execution for a specified number of milliseconds
 * @param ms - Time to delay in milliseconds
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * ダミーロガーを作成する関数（loggerが渡されない場合のフォールバック用）
 */
const createDummyLogger = (): Logger => {
  return {
    debug: (message: string, ...args: any[]) => console.debug(`[DEBUG] ${message}`, ...args),
    info: (message: string, ...args: any[]) => console.info(`[INFO] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
    error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  };
};

/**
 * Fetches HTML content from a given URL
 * @param url - The URL to fetch content from
 * @param delayMs - Delay in milliseconds before making the request (for rate limiting)
 * @param logger - Logger instance for outputting logs (optional)
 * @returns Promise that resolves to the HTML content and final URL (after redirects) or null if failed
 */
export const fetchUrlContent = async (
  url: string,
  delayMs: number,
  logger?: Logger
): Promise<{ html: string; finalUrl: string } | null> => {
  // ロガーが渡されなかった場合はダミーロガーを使用
  const log = logger || createDummyLogger();

  try {
    // リクエスト開始時刻をログに記録
    const requestStartTime = new Date().toISOString();
    log.info(`Starting request to ${url} at ${requestStartTime}`);

    // Implement delay if specified (for rate limiting)
    if (delayMs > 0) {
      log.debug(`Applying delay of ${delayMs}ms before request to ${url}`);
      await delay(delayMs);
    }

    // Make the request using fetch API
    const response = await fetch(url, {
      redirect: 'follow', // Automatically follow redirects
      headers: {
        'User-Agent': 'WebLinkCollector/1.0.0',
        Accept: 'text/html',
      },
    });

    // リクエスト終了時刻をログに記録
    const requestEndTime = new Date().toISOString();
    log.info(`Completed request to ${url} at ${requestEndTime}`);

    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
      log.error(`HTTP error: ${response.status} ${response.statusText} for URL: ${url}`);
      return null;
    }

    // Check if the content type is HTML
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      log.warn(`Skipping non-HTML content: ${contentType} for URL: ${url}`);
      return null;
    }

    // Get the HTML content as text
    const html = await response.text();

    // Get the final URL (in case of redirects)
    const finalUrl = response.url;

    return { html, finalUrl };
  } catch (error) {
    // Handle network errors, DNS resolution failure, etc.
    log.error(`Failed to fetch URL: ${url}`, error);
    return null;
  }
};
