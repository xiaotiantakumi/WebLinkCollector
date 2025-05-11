/**
 * Tests for the URL fetching module
 */

import { fetchUrlContent } from '../src/fetcher';

// Mock global fetch
global.fetch = jest.fn();

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
        get: jest.fn().mockReturnValue('text/html; charset=utf-8')
      },
      text: jest.fn().mockResolvedValue(mockHtml),
      url: 'https://example.com'
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const result = await fetchUrlContent('https://example.com', 0);
    
    expect(result).not.toBeNull();
    expect(result?.html).toBe(mockHtml);
    expect(result?.finalUrl).toBe('https://example.com');
    expect(global.fetch).toHaveBeenCalledWith('https://example.com', expect.any(Object));
  });
  
  it('handles HTTP errors (e.g., 404, 500) and returns null', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: {
        get: jest.fn().mockReturnValue('text/html')
      }
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const result = await fetchUrlContent('https://example.com/notfound', 0);
    
    expect(result).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/notfound', expect.any(Object));
  });
  
  it('handles network errors (e.g., DNS resolution failure) and returns null', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const result = await fetchUrlContent('https://invalid-domain.zzz', 0);
    
    expect(result).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith('https://invalid-domain.zzz', expect.any(Object));
  });
  
  it('correctly follows redirects and returns content from the final URL', async () => {
    const mockHtml = '<html><body>Redirected page</body></html>';
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {
        get: jest.fn().mockReturnValue('text/html')
      },
      text: jest.fn().mockResolvedValue(mockHtml),
      url: 'https://example.com/final-page'
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const result = await fetchUrlContent('https://example.com/redirect', 0);
    
    expect(result).not.toBeNull();
    expect(result?.html).toBe(mockHtml);
    expect(result?.finalUrl).toBe('https://example.com/final-page');
  });
  
  it('implements specified delay before making a request', async () => {
    jest.useFakeTimers();
    
    const mockHtml = '<html><body>Test page</body></html>';
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {
        get: jest.fn().mockReturnValue('text/html')
      },
      text: jest.fn().mockResolvedValue(mockHtml),
      url: 'https://example.com'
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const promise = fetchUrlContent('https://example.com', 2000);
    
    // The fetch should not be called immediately due to the delay
    expect(global.fetch).not.toHaveBeenCalled();
    
    // Fast-forward time by 2000ms
    jest.advanceTimersByTime(2000);
    
    // Allow any pending promises to resolve
    await Promise.resolve();
    
    // Now fetch should have been called
    expect(global.fetch).toHaveBeenCalledWith('https://example.com', expect.any(Object));
    
    // Clean up
    jest.useRealTimers();
    
    // Allow the fetchUrlContent promise to resolve
    const result = await promise;
    expect(result).not.toBeNull();
  });
});