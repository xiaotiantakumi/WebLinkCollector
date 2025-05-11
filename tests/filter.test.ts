/**
 * Tests for the URL filtering module
 */

import { isUrlAllowed } from '../src/filter';
import { FilterConditions } from '../src/types';

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
    const filters: FilterConditions = [{ domain: 'example.com' }];
    
    expect(isUrlAllowed('http://example.com/page', filters)).toBe(true);
    expect(isUrlAllowed('http://sub.example.com/page', filters)).toBe(true);
    expect(isUrlAllowed('http://othersite.com/page', filters)).toBe(false);
  });
  
  it('filters by allowed domains (array)', () => {
    const filters: FilterConditions = [{ domain: ['example.com', 'test.org'] }];
    
    expect(isUrlAllowed('http://example.com/page', filters)).toBe(true);
    expect(isUrlAllowed('http://test.org/page', filters)).toBe(true);
    expect(isUrlAllowed('http://othersite.com/page', filters)).toBe(false);
  });
  
  it('filters by allowed pathPrefix (string)', () => {
    const filters: FilterConditions = [{ pathPrefix: '/blog' }];
    
    expect(isUrlAllowed('http://example.com/blog', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/blog/post-1', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
  });
  
  it('filters by allowed pathPrefix (array)', () => {
    const filters: FilterConditions = [{ pathPrefix: ['/blog', '/news'] }];
    
    expect(isUrlAllowed('http://example.com/blog', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/news/article-1', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
  });
  
  it('filters by regex match (string)', () => {
    const filters: FilterConditions = [{ regex: '\\/(products|categories)\\/' }];
    
    expect(isUrlAllowed('http://example.com/products/item-1', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/categories/books', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
  });
  
  it('filters by regex match (array)', () => {
    const filters: FilterConditions = [{ regex: ['\\/(products)\\/','\\/(categories)\\/'] }];
    
    expect(isUrlAllowed('http://example.com/products/item-1', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/categories/books', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
  });
  
  it('filters by keyword presence in URL (string)', () => {
    const filters: FilterConditions = [{ keywords: 'product' }];
    
    expect(isUrlAllowed('http://example.com/product-123', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/products/list', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
  });
  
  it('filters by keyword presence in URL (array)', () => {
    const filters: FilterConditions = [{ keywords: ['product', 'category'] }];
    
    expect(isUrlAllowed('http://example.com/product-123', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/category/books', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
  });
  
  it('applies multiple filter conditions as AND', () => {
    const filters: FilterConditions = [{ domain: 'example.com', pathPrefix: '/blog' }];
    
    expect(isUrlAllowed('http://example.com/blog/post-1', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
    expect(isUrlAllowed('http://othersite.com/blog/post-1', filters)).toBe(false);
  });
  
  it('allows multiple filter objects as OR conditions', () => {
    const filters: FilterConditions = [
      { domain: 'example.com', pathPrefix: '/blog' },
      { domain: 'test.org' }
    ];
    
    expect(isUrlAllowed('http://example.com/blog/post-1', filters)).toBe(true);
    expect(isUrlAllowed('http://test.org/any-page', filters)).toBe(true);
    expect(isUrlAllowed('http://example.com/about', filters)).toBe(false);
    expect(isUrlAllowed('http://othersite.com/page', filters)).toBe(false);
  });
});