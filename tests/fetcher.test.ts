/**
 * Tests for the URL fetching module
 */

import { fetchUrlContent } from '../src/fetcher';
import { jest, describe, it, beforeEach, expect } from '@jest/globals';

// fetchをモック化
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

/**
 * 時間待機のモック関数を作成
 */
jest.mock('../src/fetcher', () => {
  const originalModule = jest.requireActual('../src/fetcher');
  return {
    ...originalModule,
    // delayをエクスポートして、テストできるようにする
    delay: jest.fn().mockImplementation(() => Promise.resolve()),
  };
});

describe('fetchUrlContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully fetches HTML content and returns it with the final URL', async () => {
    const mockHtml = '<html><body><a href="https://example.com">Link</a></body></html>';
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {
        get: jest.fn().mockReturnValue('text/html; charset=utf-8'),
      },
      text: jest.fn().mockResolvedValue(mockHtml),
      url: 'https://example.com',
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await fetchUrlContent('https://example.com', 0);

    expect(result).not.toBeNull();
    expect(result?.html).toBe(mockHtml);
    expect(result?.finalUrl).toBe('https://example.com');
    expect(mockFetch).toHaveBeenCalledWith('https://example.com', expect.any(Object));
  });

  it('handles HTTP errors (e.g., 404, 500) and returns null', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: {
        get: jest.fn().mockReturnValue('text/html'),
      },
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await fetchUrlContent('https://example.com/notfound', 0);

    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/notfound', expect.any(Object));
  });

  it('handles network errors (e.g., DNS resolution failure) and returns null', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await fetchUrlContent('https://invalid-domain.zzz', 0);

    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith('https://invalid-domain.zzz', expect.any(Object));
  });

  it('correctly follows redirects and returns content from the final URL', async () => {
    const mockHtml = '<html><body>Redirected page</body></html>';
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {
        get: jest.fn().mockReturnValue('text/html'),
      },
      text: jest.fn().mockResolvedValue(mockHtml),
      url: 'https://example.com/final-page',
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await fetchUrlContent('https://example.com/redirect', 0);

    expect(result).not.toBeNull();
    expect(result?.html).toBe(mockHtml);
    expect(result?.finalUrl).toBe('https://example.com/final-page');
  });

  it('skips non-HTML content', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      text: jest.fn().mockResolvedValue('{"data": "test"}'),
      url: 'https://example.com/api',
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await fetchUrlContent('https://example.com/api', 0);

    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/api', expect.any(Object));
  });
});
