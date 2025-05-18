/**
 * WebLinkCollector HTML Parser Module
 * This module handles parsing HTML content and extracting links.
 */

import * as cheerio from 'cheerio';
import { URL } from 'url';
import { Logger } from './types';
import { isUrlInQueryParams } from './filter';

/**
 * Converts a relative URL to an absolute URL
 * @param relativeUrl - The relative URL to convert
 * @param baseUrl - The base URL to resolve against
 * @returns The absolute URL, or null if invalid
 */
const resolveUrl = (relativeUrl: string, baseUrl: string): string | null => {
  try {
    const url = new URL(relativeUrl, baseUrl);
    return url.toString();
  } catch {
    // Invalid URL or cannot be resolved
    return null;
  }
};

/**
 * Determines if a URL is valid (not javascript:, mailto:, tel:, etc.)
 * @param url - The URL to check
 * @returns Boolean indicating if the URL is valid for collection
 */
const isValidUrl = (url: string): boolean => {
  if (!url) return false;

  // Skip URLs with these protocols
  const invalidProtocols = ['javascript:', 'mailto:', 'tel:', 'sms:', 'file:', 'data:'];
  for (const protocol of invalidProtocols) {
    if (url.startsWith(protocol)) {
      return false;
    }
  }

  return true;
};

/**
 * Extracts links from HTML content
 * @param htmlContent - The HTML content to parse
 * @param baseUrl - The base URL to resolve relative URLs against
 * @param cssSelector - Optional CSS selector to limit extraction scope
 * @param logger - Logger for debug output
 * @returns A Set of absolute URLs
 */
export const extractLinksFromHtml = (
  htmlContent: string,
  baseUrl: string,
  cssSelector?: string,
  logger?: Logger
): Set<string> => {
  const links = new Set<string>();

  // デフォルトのロガー（渡されない場合）
  const log = logger || {
    debug: (msg: string) => console.debug(msg),
    info: (msg: string) => console.info(msg),
    warn: (msg: string) => console.warn(msg),
    error: (msg: string) => console.error(msg),
  };

  // Parse HTML with cheerio
  const $ = cheerio.load(htmlContent);

  // 処理対象となるリンク要素を取得
  let linkElements;

  if (cssSelector) {
    log.debug(`Using CSS selector: ${cssSelector}`);

    // セレクタに一致する要素を確認
    const selectedElement = $(cssSelector);
    log.debug(`Found ${selectedElement.length} elements matching selector ${cssSelector}`);

    if (selectedElement.length > 0) {
      // セレクタ以下の全てのa[href]要素を取得
      linkElements = selectedElement.find('a[href]');
      log.debug(`Found ${linkElements.length} links inside the selected element`);
    } else {
      log.warn(`Selector ${cssSelector} did not match any elements, falling back to all links`);
      linkElements = $('a[href], link[href]');
    }
  } else {
    // セレクタが指定されていない場合は、すべてのa要素とlink要素を抽出
    linkElements = $('a[href], link[href]');
    log.debug(`Found ${linkElements.length} links in total (no selector specified)`);
  }

  // Extract href attributes
  linkElements.each((_, element) => {
    const href = $(element).attr('href');

    if (href && isValidUrl(href)) {
      const absoluteUrl = resolveUrl(href, baseUrl);
      if (absoluteUrl) {
        // クエリパラメータ内にbaseUrlが含まれているかチェック
        if (!isUrlInQueryParams(absoluteUrl, baseUrl)) {
          links.add(absoluteUrl);
        } else {
          log.debug(`Skipped URL in query parameters: ${absoluteUrl}`);
        }
      }
    }
  });

  return links;
};
