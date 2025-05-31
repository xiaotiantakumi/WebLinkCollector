/**
 * Tests for the URL fetching module
 */

import { fetchUrlContent } from '../src/fetcher';
import { describe, it, beforeEach, expect, mock } from 'bun:test';

// Mock fetch using Bun's mock functionality
const mockFetch = mock(() => Promise.resolve(new Response()));

describe('fetchUrlContent', () => {
  beforeEach(() => {
    global.fetch = mockFetch as any;
    mockFetch.mockClear();
  });

  it('successfully fetches HTML content and returns it with the final URL', async () => {
    const mockHtml = '<html><body><a href="https://example.com">Link</a></body></html>';
    const mockResponse = new Response(mockHtml, {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    });

    // Override url property since Response constructor doesn't accept it
    Object.defineProperty(mockResponse, 'url', {
      value: 'https://example.com',
      writable: false,
    });

    mockFetch.mockResolvedValue(mockResponse);

    const result = await fetchUrlContent('https://example.com', 0);

    expect(result).not.toBeNull();
    expect(result?.html).toBe(mockHtml);
    expect(result?.finalUrl).toBe('https://example.com');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('handles HTTP errors (e.g., 404, 500) and returns null', async () => {
    const mockResponse = new Response(null, {
      status: 404,
      statusText: 'Not Found',
      headers: {
        'content-type': 'text/html',
      },
    });

    mockFetch.mockResolvedValue(mockResponse);

    const result = await fetchUrlContent('https://example.com/notfound', 0);

    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('handles network errors (e.g., DNS resolution failure) and returns null', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await fetchUrlContent('https://invalid-domain.zzz', 0);

    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('correctly follows redirects and returns content from the final URL', async () => {
    const mockHtml = '<html><body>Redirected page</body></html>';
    const mockResponse = new Response(mockHtml, {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'text/html',
      },
    });

    // Override url property to simulate redirect
    Object.defineProperty(mockResponse, 'url', {
      value: 'https://example.com/final-page',
      writable: false,
    });

    mockFetch.mockResolvedValue(mockResponse);

    const result = await fetchUrlContent('https://example.com/redirect', 0);

    expect(result).not.toBeNull();
    expect(result?.html).toBe(mockHtml);
    expect(result?.finalUrl).toBe('https://example.com/final-page');
  });

  it('skips non-HTML content', async () => {
    const mockResponse = new Response('{"data": "test"}', {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
      },
    });

    Object.defineProperty(mockResponse, 'url', {
      value: 'https://example.com/api',
      writable: false,
    });

    mockFetch.mockResolvedValue(mockResponse);

    const result = await fetchUrlContent('https://example.com/api', 0);

    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('handles empty URL and returns null', async () => {
    const result = await fetchUrlContent('', 0);
    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(0);
  });

  it('handles invalid protocol and returns null', async () => {
    const result = await fetchUrlContent('ftp://example.com', 0);
    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(0);
  });

  it('handles empty HTML content and returns null', async () => {
    const mockResponse = new Response('', {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'text/html',
      },
    });

    Object.defineProperty(mockResponse, 'url', {
      value: 'https://example.com/empty',
      writable: false,
    });

    mockFetch.mockResolvedValue(mockResponse);

    const result = await fetchUrlContent('https://example.com/empty', 0);

    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
