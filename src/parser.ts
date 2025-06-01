/**
 * WebLinkCollector HTML Parser Module
 * This module handles parsing HTML content and extracting links.
 */

import * as cheerio from 'cheerio';
import { URL } from 'url';
import type { Logger } from './types';
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
 * @param element - Optional HTML tag name to use as starting point for extraction
 * @returns A Set of absolute URLs
 */
export const extractLinksFromHtml = (
  htmlContent: string,
  baseUrl: string,
  cssSelector?: string,
  logger?: Logger,
  element?: string
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

  // HTMLの構造をデバッグ表示
  log.debug(`HTML content length: ${htmlContent.length}`);
  log.debug(`Checking for main tag: ${$('main').length > 0 ? 'Found' : 'Not found'}`);

  // 処理対象となるリンク要素を取得
  let linkElements;
  let usedFallback = false;

  if (cssSelector) {
    log.debug(`Using CSS selector: ${cssSelector}`);

    // セレクタに一致する要素を確認
    const selectedElements = $(cssSelector);
    log.debug(`Found ${selectedElements.length} elements matching selector ${cssSelector}`);

    if (selectedElements.length > 0) {
      // セレクタが直接a要素を選択しているかチェック
      if (cssSelector.includes('a') || cssSelector.includes('A')) {
        // セレクタが直接aタグを指定している場合は、選択された要素自体を使用
        linkElements = selectedElements;
        log.debug(`Using ${linkElements.length} directly selected link elements`);
      } else {
        // セレクタ以下の全てのa[href]要素を取得
        linkElements = selectedElements.find('a[href]');
        log.debug(`Found ${linkElements.length} links inside the selected elements`);
      }
    } else if (element) {
      // セレクタが一致しない場合で、elementが指定されていれば、elementを使用
      log.warn(
        `Selector ${cssSelector} did not match any elements, trying element ${element} instead`
      );

      const selectedElements = $(element);
      log.debug(`Found ${selectedElements.length} elements matching tag ${element}`);

      if (selectedElements.length > 0) {
        // 指定したHTML要素内のすべてのa[href]要素を取得（すべての子孫要素を含む）
        linkElements = selectedElements.find('a[href]');
        log.debug(`Found ${linkElements.length} links inside the ${element} elements`);
      } else {
        log.warn(
          `Element tag ${element} also did not match any elements, falling back to all links`
        );
        linkElements = $('a[href], link[href]');
        usedFallback = true;
      }
    } else {
      log.warn(`Selector ${cssSelector} did not match any elements, falling back to all links`);
      linkElements = $('a[href], link[href]');
      usedFallback = true;
    }
  } else if (element) {
    log.debug(`Using HTML element tag: ${element}`);

    // 指定されたHTML要素タグを確認
    const selectedElements = $(element);
    log.debug(`Found ${selectedElements.length} elements matching tag ${element}`);

    // HTML構造の詳細をデバッグ出力
    if (selectedElements.length > 0) {
      // 最初の要素の簡単な構造を表示
      const firstElement = selectedElements.first();
      const firstElementHtml = firstElement.html();
      log.debug(
        `First ${element} element structure: ${firstElementHtml ? firstElementHtml.substring(0, 100) : 'empty'}...`
      );

      // 指定したHTML要素内のすべてのa[href]要素を取得（すべての子孫要素を含む）
      linkElements = selectedElements.find('a[href]');

      // リンク要素の詳細を表示
      log.debug(
        `Found ${linkElements.length} links inside the ${element} elements (including all descendants)`
      );
      if (linkElements.length > 0) {
        linkElements.each((i, el) => {
          if (i < 5) {
            // 最初の5つだけ表示
            log.debug(
              `Link ${i + 1}: ${$(el).attr('href')} - Text: ${$(el).text().substring(0, 30)}`
            );
          }
        });
      }
    } else {
      log.warn(`Element tag ${element} did not match any elements, falling back to all links`);

      // 代わりにページ全体からリンクを探す
      linkElements = $('a[href], link[href]');
      usedFallback = true;

      // 最初の数個のリンクを表示
      if (linkElements.length > 0) {
        log.debug(`First few links in the document:`);
        linkElements.each((i, el) => {
          if (i < 5) {
            log.debug(
              `Link ${i + 1}: ${$(el).attr('href')} - Text: ${$(el).text().substring(0, 30)}`
            );
          }
        });
      }
    }
  } else {
    // セレクタとエレメントの両方が指定されていない場合は、すべてのa要素とlink要素を抽出
    linkElements = $('a[href], link[href]');
    usedFallback = true;
  }

  if (usedFallback) {
    log.debug(`Found ${linkElements.length} links in total (using fallback)`);

    // 最初の数個のリンクを表示
    if (linkElements.length > 0) {
      log.debug(`First few links from fallback:`);
      linkElements.each((i, el) => {
        if (i < 5) {
          log.debug(
            `Link ${i + 1}: ${$(el).attr('href')} - Text: ${$(el).text().substring(0, 30)}`
          );
        }
      });
    }
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
          log.debug(`Added link: ${absoluteUrl}`);
        } else {
          log.debug(`Skipped URL in query parameters: ${absoluteUrl}`);
        }
      }
    }
  });

  return links;
};
