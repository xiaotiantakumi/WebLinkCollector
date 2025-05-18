/**
 * Tests for the URL filtering functionality.
 * Focus on core filter functionality without dependencies on specific configuration values.
 */

import { isUrlAllowed } from '../src/filter';
import { FilterConditions } from '../src/types';
import { describe, it, expect } from '@jest/globals';

describe('isUrlAllowed', () => {
  it('allows URL if no filters are provided (excluding common paths)', () => {
    expect(isUrlAllowed('http://example.com/page', undefined)).toBe(true);
  });

  it('blocks common disallowed paths like /admin/ or /login/', () => {
    expect(isUrlAllowed('http://example.com/admin/', undefined)).toBe(false);
    expect(isUrlAllowed('http://example.com/login', undefined)).toBe(false);
    expect(isUrlAllowed('http://example.com/wp-admin/edit.php', undefined)).toBe(false);
    expect(isUrlAllowed('http://example.com/checkout', undefined)).toBe(false);
  });

  it('filters by allowed domain (string)', () => {
    const filters = [{ domain: 'example.com' }];

    expect(isUrlAllowed('http://example.com/page', filters)).toBe(true);
    expect(isUrlAllowed('http://sub.example.com/page', filters)).toBe(true);
    expect(isUrlAllowed('http://othersite.com/page', filters)).toBe(false);
  });

  it('filters by allowed domains (array)', () => {
    const filters = [{ domain: ['example.com', 'test.org'] }];

    expect(isUrlAllowed('http://example.com/page', filters)).toBe(true);
    expect(isUrlAllowed('http://test.org/page', filters)).toBe(true);
    expect(isUrlAllowed('http://othersite.com/page', filters)).toBe(false);
  });

  it('filters by allowed pathPrefix (string)', () => {
    const filters = [{ pathPrefix: '/blog' }];

    expect(isUrlAllowed('http://example.com/blog', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/blog/post-1', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
  });

  it('filters by allowed pathPrefix (array)', () => {
    const filters = [{ pathPrefix: ['/blog', '/news'] }];

    expect(isUrlAllowed('http://example.com/blog', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/news/article-1', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
  });

  it('filters by regex match (string)', () => {
    const filters = [{ regex: '\\/(products|categories)\\/' }];

    expect(isUrlAllowed('http://example.com/products/item-1', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/categories/books', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
  });

  it('filters by regex match (array)', () => {
    const filters = [{ regex: ['\\/(products)\\/', '\\/(categories)\\/'] }];

    expect(isUrlAllowed('http://example.com/products/item-1', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/categories/books', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
  });

  it('filters by keyword presence in URL (string)', () => {
    const filters = [{ keywords: 'product' }];

    expect(isUrlAllowed('http://example.com/product-123', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/products/list', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
  });

  it('filters by keyword presence in URL (array)', () => {
    const filters = [{ keywords: ['product', 'category'] }];

    expect(isUrlAllowed('http://example.com/product-123', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/category/books', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
  });

  it('applies multiple filter conditions as AND', () => {
    const filters = [{ domain: 'example.com', pathPrefix: '/blog' }];

    expect(isUrlAllowed('http://example.com/blog/post-1', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
    expect(isUrlAllowed('http://othersite.com/blog/post-1', filters)).toBe(false);
  });

  it('allows multiple filter objects as OR conditions', () => {
    const filters = [{ domain: 'example.com', pathPrefix: '/blog' }, { domain: 'test.org' }];

    expect(isUrlAllowed('http://example.com/blog/post-1', filters)).toBe(true);
    expect(isUrlAllowed('http://test.org/any-page', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
    expect(isUrlAllowed('http://othersite.com/page', filters)).toBe(false);
  });

  it('should correctly handle default excluded paths', () => {
    const filters: FilterConditions = [{ domain: 'example.com' }]; // No specific path filter
    expect(isUrlAllowed('https://example.com/admin', filters)).toBe(false);
    expect(isUrlAllowed('https://example.com/wp-login.php', filters)).toBe(false);
    expect(isUrlAllowed('https://example.com/cart/items', filters)).toBe(false);
    expect(isUrlAllowed('https://example.com/some/path', filters)).toBe(true);
  });

  // 様々なURLパスに対するパスプレフィックスフィルターの一般的なテスト
  it('correctly applies pathPrefix filtering for various URL structures', () => {
    // 先頭が完全一致するケース
    const exactPrefixFilters: FilterConditions = [{ pathPrefix: '/test/path/' }];
    expect(isUrlAllowed('https://example.com/test/path/page', exactPrefixFilters)).toBe(true);
    expect(isUrlAllowed('https://example.com/another/test/path/', exactPrefixFilters)).toBe(false);

    // 大文字小文字の区別
    const caseSensitiveFilters: FilterConditions = [{ pathPrefix: '/Case/Sensitive/' }];
    expect(isUrlAllowed('https://example.com/Case/Sensitive/page', caseSensitiveFilters)).toBe(
      true
    );
    expect(isUrlAllowed('https://example.com/case/sensitive/page', caseSensitiveFilters)).toBe(
      false
    );
  });
});
