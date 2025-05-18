/**
 * WebLinkCollector URL Fetcher Module
 * This module handles fetching HTML content from URLs.
 */

// ロガーインポートを追加
import { createLogger, Logger } from './logger';
import { LogLevel } from './types';

/**
 * Delay execution for a specified number of milliseconds
 * @param ms - Time to delay in milliseconds
 * @param logger - Optional logger for debug output
 */
const delay = async (ms: number, logger?: Logger): Promise<void> => {
  if (logger) {
    logger.debug(`Waiting for ${ms}ms before next request...`);
  }
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * ダミーロガーを作成する関数（loggerが渡されない場合のフォールバック用）
 */
const createDummyLogger = (): Logger => {
  return {
    debug: (_message: string, ..._args: any[]) => {},
    info: (_message: string, ..._args: any[]) => {},
    warn: (_message: string, ..._args: any[]) => {},
    error: (_message: string, ..._args: any[]) => {},
  };
};

/**
 * Fetches HTML content from a given URL
 * @param url - The URL to fetch content from
 * @param delayMs - Delay in milliseconds before making the request (for rate limiting)
 * @param logLevel - Optional log level for this fetch operation
 * @returns Promise that resolves to the HTML content and final URL (after redirects) or null if failed
 */
export const fetchUrlContent = async (
  url: string,
  delayMs: number,
  logLevel?: LogLevel
): Promise<{ html: string; finalUrl: string } | null> => {
  // Create logger if logLevel is provided, otherwise use dummy logger
  const logger = logLevel ? createLogger(logLevel) : createDummyLogger();

  try {
    // リクエスト開始時刻をログに記録
    const requestStartTime = new Date().toISOString();
    logger.debug(`Starting request to ${url} at ${requestStartTime}`);

    // Implement delay if specified (for rate limiting)
    if (delayMs > 0) {
      await delay(delayMs, logger);
    }

    // Make the request using fetch API
    logger.debug(`Executing fetch for ${url}`);
    const response = await fetch(url, {
      redirect: 'follow', // Automatically follow redirects
      headers: {
        'User-Agent': 'WebLinkCollector/1.0.0',
        Accept: 'text/html',
      },
    });

    // リクエスト終了時刻をログに記録
    const requestEndTime = new Date().toISOString();
    logger.debug(`Completed request to ${url} at ${requestEndTime}`);

    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
      const errorMessage = `HTTP error: ${response.status} ${response.statusText} for URL: ${url}`;
      logger.error(errorMessage);
      return null;
    }

    // Check if the content type is HTML
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      const warnMessage = `Skipping non-HTML content: ${contentType} for URL: ${url}`;
      logger.warn(warnMessage);
      return null;
    }

    // Get the HTML content as text
    const html = await response.text();

    // Get the final URL (in case of redirects)
    const finalUrl = response.url;

    logger.debug(
      `Successfully fetched ${url}, final URL: ${finalUrl}, content length: ${html.length}`
    );
    return { html, finalUrl };
  } catch (error) {
    // Handle network errors, DNS resolution failure, etc.
    const errorMessage = `Failed to fetch URL: ${url}`;
    logger.error(errorMessage, error);
    return null;
  }
};
