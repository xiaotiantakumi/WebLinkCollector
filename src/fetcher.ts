/**
 * WebLinkCollector URL Fetcher Module
 * This module handles fetching HTML content from URLs.
 * Optimized for Bun runtime with enhanced performance and error handling.
 */

import { URL } from 'url';
import { createLogger, type Logger } from './logger';
import type { LogLevel } from './types';

/**
 * Delay execution for a specified number of milliseconds using Bun optimizations
 * @param ms - Time to delay in milliseconds
 * @param logger - Optional logger for debug output
 */
const delay = async (ms: number, logger?: Logger): Promise<void> => {
  if (ms <= 0) return;

  if (logger) {
    logger.debug(`リクエスト間隔として${ms}msの待機を開始します...`);
  }

  // Use Bun's sleep if available, fallback to setTimeout
  try {
    const bunGlobal = globalThis as any;
    if (bunGlobal.Bun && bunGlobal.Bun.sleep) {
      await bunGlobal.Bun.sleep(ms);
    } else {
      await new Promise(resolve => setTimeout(resolve, ms));
    }
  } catch {
    // Fallback to standard setTimeout
    await new Promise(resolve => setTimeout(resolve, ms));
  }
};

/**
 * ダミーロガーを作成する関数（loggerが渡されない場合のフォールバック用）
 * null-object pattern を使用してパフォーマンスを向上
 */
const createDummyLogger = (): Logger => {
  return {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  };
};

/**
 * Fetches HTML content from a given URL with Bun optimizations
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

  if (!url?.trim()) {
    logger.error('URLが無効です: 空またはnull/undefinedです');
    return null;
  }

  try {
    // URL validation
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      logger.error(`サポートされていないプロトコル: ${parsedUrl.protocol} (URL: ${url})`);
      return null;
    }

    // リクエスト開始時刻をログに記録
    const requestStartTime = Date.now();
    logger.debug(`${url} へのリクエストを開始します`);

    // Implement delay if specified (for rate limiting)
    if (delayMs > 0) {
      await delay(delayMs, logger);
    }

    // Make the request using fetch API with optimized settings
    logger.debug(`${url} へのHTTPリクエストを実行中...`);

    const response = await fetch(url, {
      redirect: 'follow', // Automatically follow redirects
      headers: {
        'User-Agent': 'WebLinkCollector/1.0.5 (Bun Runtime)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });

    // リクエスト終了時刻をログに記録
    const requestEndTime = Date.now();
    const requestDuration = requestEndTime - requestStartTime;
    logger.debug(`${url} へのリクエストが完了しました（所要時間: ${requestDuration}ms）`);

    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
      const errorMessage = `HTTPエラー: ${response.status} ${response.statusText} (URL: ${url})`;
      logger.error(errorMessage);
      return null;
    }

    // Check if the content type is HTML
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.toLowerCase().includes('text/html')) {
      const warnMessage = `HTML以外のコンテンツをスキップします: ${contentType} (URL: ${url})`;
      logger.warn(warnMessage);
      return null;
    }

    // Get the HTML content as text
    const html = await response.text();

    // Validate HTML content
    if (!html || html.trim().length === 0) {
      logger.warn(`空のHTMLコンテンツを受信しました (URL: ${url})`);
      return null;
    }

    // Get the final URL (in case of redirects)
    const finalUrl = response.url;

    logger.debug(
      `${url} の取得に成功しました（最終URL: ${finalUrl}, コンテンツ長: ${html.length}文字）`
    );
    return { html, finalUrl };
  } catch (error) {
    // Handle different types of errors with specific messages
    let errorMessage = `URLの取得に失敗しました: ${url}`;

    if (error instanceof TypeError) {
      errorMessage += ' - ネットワークエラーまたは無効なURL';
    } else if (error instanceof Error) {
      if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        errorMessage += ' - リクエストタイムアウト';
      } else if (error.message.includes('DNS')) {
        errorMessage += ' - DNS解決エラー';
      } else {
        errorMessage += ` - ${error.message}`;
      }
    }

    logger.error(errorMessage);
    return null;
  }
};
