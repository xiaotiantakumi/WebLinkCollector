/**
 * WebLinkCollector URL Fetcher Module
 * This module handles fetching HTML content from URLs.
 */

/**
 * Delay execution for a specified number of milliseconds
 * @param ms - Time to delay in milliseconds
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Fetches HTML content from a given URL
 * @param url - The URL to fetch content from
 * @param delayMs - Delay in milliseconds before making the request (for rate limiting)
 * @returns Promise that resolves to the HTML content and final URL (after redirects) or null if failed
 */
export const fetchUrlContent = async (
  url: string,
  delayMs: number
): Promise<{ html: string; finalUrl: string } | null> => {
  try {
    // Implement delay if specified (for rate limiting)
    if (delayMs > 0) {
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

    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
      console.error(`HTTP error: ${response.status} ${response.statusText} for URL: ${url}`);
      return null;
    }

    // Check if the content type is HTML
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      console.warn(`Skipping non-HTML content: ${contentType} for URL: ${url}`);
      return null;
    }

    // Get the HTML content as text
    const html = await response.text();

    // Get the final URL (in case of redirects)
    const finalUrl = response.url;

    return { html, finalUrl };
  } catch (error) {
    // Handle network errors, DNS resolution failure, etc.
    console.error(`Failed to fetch URL: ${url}`, error);
    return null;
  }
};
