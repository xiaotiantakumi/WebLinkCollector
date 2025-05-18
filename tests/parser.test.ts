/**
 * Tests for the HTML parsing and link extraction module
 */

import { extractLinksFromHtml } from '../src/parser';
import { describe, it, expect } from '@jest/globals';

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

    const links = extractLinksFromHtml(html, 'https://example.com', '.main a');

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

  it('excludes URLs where the base URL is in the query parameters', () => {
    const baseUrl = 'https://example.com/blog/';
    const html = `
      <html>
        <body>
          <a href="https://twitter.com/share?text=&url=https://example.com/blog/">Share on Twitter</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=https://example.com/blog/">Share on Facebook</a>
          <a href="https://example.com/blog/article">Normal link</a>
          <a href="https://example.com/contact">Contact page</a>
        </body>
      </html>
    `;

    const links = extractLinksFromHtml(html, baseUrl);

    expect(links.size).toBe(2);
    expect(links.has('https://twitter.com/share?text=&url=https://example.com/blog/')).toBe(false);
    expect(
      links.has('https://www.facebook.com/sharer/sharer.php?u=https://example.com/blog/')
    ).toBe(false);
    expect(links.has('https://example.com/blog/article')).toBe(true);
    expect(links.has('https://example.com/contact')).toBe(true);
  });

  it('excludes URLs where the base URL is in the hash fragment', () => {
    const baseUrl = 'https://example.com/blog/';
    const html = `
      <html>
        <body>
          <a href="https://example.com/share#url=https://example.com/blog/">Share link with fragment</a>
          <a href="https://example.com/blog/article#section1">Article with normal fragment</a>
        </body>
      </html>
    `;

    const links = extractLinksFromHtml(html, baseUrl);

    expect(links.size).toBe(1);
    expect(links.has('https://example.com/share#url=https://example.com/blog/')).toBe(false);
    expect(links.has('https://example.com/blog/article#section1')).toBe(true);
  });

  it('applies HTML element tag to limit link extraction scope', () => {
    const html = `
      <html>
        <body>
          <main>
            <a href="/main1">Main 1</a>
            <a href="/main2">Main 2</a>
          </main>
          <aside>
            <a href="/aside1">Aside 1</a>
            <a href="/aside2">Aside 2</a>
          </aside>
        </body>
      </html>
    `;

    const links = extractLinksFromHtml(html, 'https://example.com', undefined, undefined, 'main');

    expect(links.size).toBe(2);
    expect(links.has('https://example.com/main1')).toBe(true);
    expect(links.has('https://example.com/main2')).toBe(true);
    expect(links.has('https://example.com/aside1')).toBe(false);
    expect(links.has('https://example.com/aside2')).toBe(false);
  });

  it('handles both selector and element when both are provided (selector takes precedence)', () => {
    const html = `
      <html>
        <body>
          <main>
            <div class="content">
              <a href="/content1">Content 1</a>
            </div>
            <div class="other">
              <a href="/other1">Other 1</a>
            </div>
          </main>
          <aside>
            <div class="content">
              <a href="/aside-content">Aside Content</a>
            </div>
          </aside>
        </body>
      </html>
    `;

    const links = extractLinksFromHtml(html, 'https://example.com', '.content', undefined, 'main');

    expect(links.size).toBe(2);
    expect(links.has('https://example.com/content1')).toBe(true);
    expect(links.has('https://example.com/aside-content')).toBe(true);
    expect(links.has('https://example.com/other1')).toBe(false);
  });

  it('uses element when selector does not match any elements', () => {
    const html = `
      <html>
        <body>
          <main>
            <a href="/main1">Main 1</a>
            <a href="/main2">Main 2</a>
          </main>
          <aside>
            <a href="/aside1">Aside 1</a>
          </aside>
        </body>
      </html>
    `;

    // 存在しないセレクタとelement="main"を指定
    const links = extractLinksFromHtml(
      html,
      'https://example.com',
      '.non-existent',
      undefined,
      'main'
    );

    expect(links.size).toBe(2);
    expect(links.has('https://example.com/main1')).toBe(true);
    expect(links.has('https://example.com/main2')).toBe(true);
    expect(links.has('https://example.com/aside1')).toBe(false);
  });

  it('handles HTML element tag that does not exist in the document', () => {
    const html = `
      <html>
        <body>
          <div>
            <a href="/link1">Link 1</a>
            <a href="/link2">Link 2</a>
          </div>
        </body>
      </html>
    `;

    // 存在しないHTML要素タグを指定
    const links = extractLinksFromHtml(
      html,
      'https://example.com',
      undefined,
      undefined,
      'article'
    );

    // 要素が見つからない場合はすべてのリンクを抽出すべき
    expect(links.size).toBe(2);
    expect(links.has('https://example.com/link1')).toBe(true);
    expect(links.has('https://example.com/link2')).toBe(true);
  });

  it('handles deeply nested HTML structure with element option', () => {
    const html = `
      <html>
        <body>
          <main>
            <div class="container">
              <section>
                <article>
                  <div class="content">
                    <a href="/nested1">Nested Link 1</a>
                    <p>Some text with a <a href="/nested2">Nested Link 2</a> inside.</p>
                  </div>
                </article>
              </section>
            </div>
            <div class="sidebar">
              <a href="/sidebar1">Sidebar Link 1</a>
            </div>
          </main>
          <footer>
            <a href="/footer1">Footer Link 1</a>
          </footer>
        </body>
      </html>
    `;

    const links = extractLinksFromHtml(html, 'https://example.com', undefined, undefined, 'main');

    expect(links.size).toBe(3);
    expect(links.has('https://example.com/nested1')).toBe(true);
    expect(links.has('https://example.com/nested2')).toBe(true);
    expect(links.has('https://example.com/sidebar1')).toBe(true);
    expect(links.has('https://example.com/footer1')).toBe(false);
  });

  it('handles complex blog-like structure with element option', () => {
    const html = `
      <html>
        <body>
          <header>
            <nav>
              <a href="/home">Home</a>
              <a href="/about">About</a>
            </nav>
          </header>
          <main>
            <div class="blog-posts">
              <article class="post">
                <h2><a href="/post/1">Post Title 1</a></h2>
                <div class="post-content">
                  <p>Content with <a href="/link1">Link 1</a> and <a href="/link2">Link 2</a></p>
                </div>
                <div class="post-meta">
                  <a href="/category/tech">Tech</a>
                  <a href="/tag/javascript">JavaScript</a>
                </div>
              </article>
              <article class="post">
                <h2><a href="/post/2">Post Title 2</a></h2>
                <div class="post-content">
                  <p>More content with <a href="/link3">Link 3</a></p>
                </div>
                <div class="post-meta">
                  <a href="/category/life">Life</a>
                  <a href="/tag/daily">Daily</a>
                </div>
              </article>
            </div>
            <aside class="sidebar">
              <div class="widget">
                <h3>Categories</h3>
                <ul>
                  <li><a href="/category/tech">Tech</a></li>
                  <li><a href="/category/life">Life</a></li>
                </ul>
              </div>
              <div class="widget">
                <h3>Recent Posts</h3>
                <ul>
                  <li><a href="/post/1">Post Title 1</a></li>
                  <li><a href="/post/2">Post Title 2</a></li>
                  <li><a href="/post/3">Post Title 3</a></li>
                </ul>
              </div>
            </aside>
          </main>
          <footer>
            <div class="footer-links">
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
            </div>
          </footer>
        </body>
      </html>
    `;

    const links = extractLinksFromHtml(html, 'https://example.com', undefined, undefined, 'main');

    expect(links.size).toBe(10); // 重複URLはSetで排除されるため、実際は10個になる
    expect(links.has('https://example.com/post/1')).toBe(true);
    expect(links.has('https://example.com/post/2')).toBe(true);
    expect(links.has('https://example.com/post/3')).toBe(true);
    expect(links.has('https://example.com/category/tech')).toBe(true);
    expect(links.has('https://example.com/home')).toBe(false); // In header, not in main
    expect(links.has('https://example.com/terms')).toBe(false); // In footer, not in main
  });

  it('handles empty or invalid element gracefully', () => {
    const html = `
      <html>
        <body>
          <main>
            <a href="/main1">Main Link</a>
          </main>
          <div>
            <a href="/div1">Div Link</a>
          </div>
        </body>
      </html>
    `;

    // Empty element string
    const links1 = extractLinksFromHtml(html, 'https://example.com', undefined, undefined, '');
    expect(links1.size).toBe(2); // Should get all links

    // Non-existent element
    const links2 = extractLinksFromHtml(
      html,
      'https://example.com',
      undefined,
      undefined,
      'nonexistent'
    );
    expect(links2.size).toBe(2); // Should fall back to all links
  });

  it('handles Microsoft Learn style documentation structure', () => {
    // MSドキュメントスタイルのHTML構造をシミュレート
    const html = `
      <html>
        <body>
          <header>
            <a href="/header1">Header Link</a>
          </header>
          <div class="content">
            <nav class="docs-navigation">
              <a href="/docs/section1">Section 1</a>
              <a href="/docs/section2">Section 2</a>
            </nav>
            <main>
              <article>
                <h1>Document Title</h1>
                <div class="content-body">
                  <p>Content with <a href="/link1">Link 1</a> and <a href="/link2">Link 2</a>.</p>
                  <div class="alert">
                    <p>Note: See <a href="/note-link">this note</a> for more information.</p>
                  </div>
                  <h2>Subsection</h2>
                  <p>More content with <a href="/link3">Link 3</a>.</p>
                  <pre>
                    <code>
                      // Example code
                      const a = <a href="/code-link">example</a>;
                    </code>
                  </pre>
                </div>
              </article>
              <div class="page-navigation">
                <a href="/prev">Previous</a>
                <a href="/next">Next</a>
              </div>
            </main>
            <aside>
              <div class="toc">
                <a href="#section1">Section 1</a>
                <a href="#section2">Section 2</a>
              </div>
              <div class="related-links">
                <a href="/related1">Related 1</a>
                <a href="/related2">Related 2</a>
              </div>
            </aside>
          </div>
          <footer>
            <a href="/footer1">Footer Link</a>
          </footer>
        </body>
      </html>
    `;

    // mainエレメントによる抽出
    const mainLinks = extractLinksFromHtml(
      html,
      'https://example.com',
      undefined,
      undefined,
      'main'
    );

    expect(mainLinks.size).toBe(7); // 実際の抽出結果に合わせる
    expect(mainLinks.has('https://example.com/link1')).toBe(true);
    expect(mainLinks.has('https://example.com/link2')).toBe(true);
    expect(mainLinks.has('https://example.com/header1')).toBe(false);

    // .contentセレクタによる抽出（より広範囲）
    const contentLinks = extractLinksFromHtml(html, 'https://example.com', '.content', undefined);
    expect(contentLinks.size).toBe(13); // すべての.content内リンク

    // 両方指定した場合（セレクタが優先される）
    const bothLinks = extractLinksFromHtml(
      html,
      'https://example.com',
      '.content',
      undefined,
      'main'
    );
    expect(bothLinks.size).toBe(13); // .contentが優先されるため
  });

  it('handles real-world problem case with multiple wrapper divs', () => {
    // WebLinkCollectorで発生した実際の問題に似たHTML構造
    const html = `
      <html>
        <body>
          <main>
            <div id="section">
              <div id="list">
                <div id="card-1">
                  <div class="toc grid clearfix">
                    <section>
                      <h2 class="entry-title">
                        <a href="/post/1" class="entry-link">Post Title 1</a>
                      </h2>
                    </section>
                  </div>
                </div>
                <div id="card-2">
                  <div class="toc grid clearfix">
                    <section>
                      <h2 class="entry-title">
                        <a href="/post/2" class="entry-link">Post Title 2</a>
                      </h2>
                    </section>
                  </div>
                </div>
                <div id="bottom-area">
                  <div id="paging">
                    <ul class="pagination">
                      <li><a href="/page/2/">2</a></li>
                      <li><a href="/page/3/">3</a></li>
                    </ul>
                  </div>
                  <aside>
                    <div id="sns-bottoms">
                      <ul class="snsb clearfix">
                        <li class="twitter"><a href="//twitter.com/share?url=https://example.com/">Twitter</a></li>
                        <li class="facebook"><a href="//www.facebook.com/sharer/sharer.php?u=https://example.com/">Facebook</a></li>
                      </ul>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </main>
          <footer>
            <a href="/footer">Footer Link</a>
          </footer>
        </body>
      </html>
    `;

    // mainエレメントによる抽出
    const mainLinks = extractLinksFromHtml(
      html,
      'https://example.com',
      undefined,
      undefined,
      'main'
    );

    expect(mainLinks.size).toBe(4); // 実際の結果に合わせる
    expect(mainLinks.has('https://example.com/post/1')).toBe(true);
    expect(mainLinks.has('https://example.com/post/2')).toBe(true);
    expect(mainLinks.has('https://example.com/page/2/')).toBe(true);
    expect(mainLinks.has('https://example.com/page/3/')).toBe(true);
    expect(mainLinks.has('https://twitter.com/share?url=https://example.com/')).toBe(false); // クエリパラメータにURLが含まれるため除外される
    expect(mainLinks.has('https://example.com/footer')).toBe(false);

    // #listセレクタによる抽出
    const listLinks = extractLinksFromHtml(html, 'https://example.com', '#list', undefined);
    expect(listLinks.size).toBe(4); // 実際の結果に合わせる

    // entry-linkクラスのaタグのみを抽出
    const entryLinks = extractLinksFromHtml(html, 'https://example.com', 'a.entry-link', undefined);
    expect(entryLinks.size).toBe(2);
    expect(entryLinks.has('https://example.com/post/1')).toBe(true);
    expect(entryLinks.has('https://example.com/post/2')).toBe(true);
    expect(entryLinks.has('https://example.com/page/2/')).toBe(false);
  });
});
