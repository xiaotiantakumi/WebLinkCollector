/**
 * Tests for the HTML parsing and link extraction module
 */

import { extractLinksFromHtml } from '../src/parser';

describe('extractLinksFromHtml', () => {
  it('extracts absolute URLs from a tags', () => {
    const html = `
      <html>
        <body>
          <a href="https://example.com">Example</a>
          <a href="https://example.org/page">Another site</a>
        </body>
      </html>
    `;
    
    const links = extractLinksFromHtml(html, 'https://test.com');
    
    expect(links.size).toBe(2);
    expect(links.has('https://example.com/')).toBe(true);
    expect(links.has('https://example.org/page')).toBe(true);
  });
  
  it('extracts and converts relative URLs to absolute from a tags', () => {
    const html = `
      <html>
        <body>
          <a href="/about">About</a>
          <a href="./contact">Contact</a>
          <a href="../products">Products</a>
        </body>
      </html>
    `;
    
    const links = extractLinksFromHtml(html, 'https://example.com/path/current/');
    
    expect(links.size).toBe(3);
    expect(links.has('https://example.com/about')).toBe(true);
    expect(links.has('https://example.com/path/current/contact')).toBe(true);
    expect(links.has('https://example.com/path/products')).toBe(true);
  });
  
  it('extracts relevant link tag hrefs and converts to absolute URLs', () => {
    const html = `
      <html>
        <head>
          <link href="/styles.css" rel="stylesheet">
          <link href="https://cdn.example.com/library.css" rel="stylesheet">
        </head>
        <body>
          <a href="/page1">Page 1</a>
        </body>
      </html>
    `;
    
    const links = extractLinksFromHtml(html, 'https://example.com');
    
    expect(links.size).toBe(3);
    expect(links.has('https://example.com/styles.css')).toBe(true);
    expect(links.has('https://cdn.example.com/library.css')).toBe(true);
    expect(links.has('https://example.com/page1')).toBe(true);
  });
  
  it('applies CSS selector to limit link extraction scope', () => {
    const html = `
      <html>
        <body>
          <div class="main">
            <a href="/main1">Main 1</a>
            <a href="/main2">Main 2</a>
          </div>
          <div class="sidebar">
            <a href="/sidebar1">Sidebar 1</a>
            <a href="/sidebar2">Sidebar 2</a>
          </div>
        </body>
      </html>
    `;
    
    const links = extractLinksFromHtml(html, 'https://example.com', '.main');
    
    expect(links.size).toBe(2);
    expect(links.has('https://example.com/main1')).toBe(true);
    expect(links.has('https://example.com/main2')).toBe(true);
    expect(links.has('https://example.com/sidebar1')).toBe(false);
    expect(links.has('https://example.com/sidebar2')).toBe(false);
  });
  
  it('handles HTML with no links gracefully (returns empty set)', () => {
    const html = `
      <html>
        <body>
          <p>This is a paragraph with no links.</p>
        </body>
      </html>
    `;
    
    const links = extractLinksFromHtml(html, 'https://example.com');
    
    expect(links.size).toBe(0);
  });
  
  it('handles invalid or malformed URLs within href attributes gracefully', () => {
    const html = `
      <html>
        <body>
          <a href="javascript:void(0)">JavaScript link</a>
          <a href="mailto:user@example.com">Email</a>
          <a href="tel:+123456789">Phone</a>
          <a href="data:image/png;base64,abc">Data URL</a>
          <a href="/valid">Valid link</a>
        </body>
      </html>
    `;
    
    const links = extractLinksFromHtml(html, 'https://example.com');
    
    expect(links.size).toBe(1);
    expect(links.has('https://example.com/valid')).toBe(true);
  });
});