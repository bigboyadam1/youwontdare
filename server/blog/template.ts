import type { BlogPost } from './index.js';

const SITE_URL = 'https://youwontdare.xyz';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sharedHead(title: string, description: string, canonicalPath: string, extra = ''): string {
  const canonical = `${SITE_URL}${canonicalPath}`;
  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐔</text></svg>" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${SITE_URL}/og-default.png" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${SITE_URL}/og-default.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet" />
    ${extra}
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #0d0d0d; color: #e5e5e5; font-family: 'Courier Prime', monospace; line-height: 1.7; }
      a { color: #facc15; text-decoration: none; }
      a:hover { text-decoration: underline; }
      .site-header { padding: 1.5rem 2rem; border-bottom: 1px solid #222; }
      .site-header a { font-family: 'Anton', sans-serif; font-size: clamp(1.5rem, 4vw, 2.2rem); color: #f0f0f0; letter-spacing: 0.05em; text-transform: uppercase; text-shadow: 3px 3px #ff0055; transform: skewY(-4deg); display: inline-block; text-decoration: none; }
      .site-header a:hover { text-decoration: none; opacity: 0.85; }
      .site-footer { padding: 2rem; border-top: 1px solid #222; text-align: center; color: #666; font-size: 0.85rem; margin-top: 3rem; }
      .container { max-width: 720px; margin: 0 auto; padding: 2rem 1.5rem; }
      h1 { font-family: 'Anton', sans-serif; font-size: clamp(2rem, 5vw, 3rem); color: #facc15; text-transform: uppercase; line-height: 1.2; margin-bottom: 1rem; }
      h2 { font-family: 'Anton', sans-serif; font-size: 1.5rem; color: #facc15; text-transform: uppercase; margin: 2.5rem 0 1rem; }
      h3 { font-family: 'Anton', sans-serif; font-size: 1.15rem; color: #e5e5e5; margin: 2rem 0 0.75rem; }
      p { margin-bottom: 1rem; }
      ol, ul { margin-bottom: 1rem; padding-left: 1.5rem; }
      li { margin-bottom: 0.5rem; }
      .cta-box { background: #1a1a1a; border: 2px solid #facc15; border-radius: 12px; padding: 2rem; text-align: center; margin: 3rem 0 1rem; }
      .cta-box p { font-size: 1.1rem; margin-bottom: 1rem; }
      .cta-btn { display: inline-block; background: #facc15; color: #0d0d0d; font-family: 'Anton', sans-serif; font-size: 1.25rem; text-transform: uppercase; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; letter-spacing: 0.05em; }
      .cta-btn:hover { background: #eab308; text-decoration: none; }
      .post-meta { color: #888; font-size: 0.9rem; margin-bottom: 2rem; }
      .post-list { list-style: none; padding: 0; }
      .post-list li { border-bottom: 1px solid #222; padding: 1.5rem 0; }
      .post-list li:last-child { border-bottom: none; }
      .post-list a { font-family: 'Anton', sans-serif; font-size: 1.25rem; color: #facc15; text-transform: uppercase; }
      .post-list .desc { color: #aaa; margin-top: 0.35rem; font-size: 0.95rem; }
    </style>`;
}

function header(): string {
  return `<header class="site-header"><a href="/">YOU WON'T DARE</a></header>`;
}

function footer(): string {
  return `<footer class="site-footer">
    <a href="/blog">Blog</a> · <a href="/">Home</a><br/>
    © ${new Date().getFullYear()} YouWontDare
  </footer>`;
}

function ctaBox(): string {
  return `<div class="cta-box">
    <p>Ready to dare them?</p>
    <a class="cta-btn" href="/signup">PLAY NOW — IT'S FREE</a>
  </div>`;
}

export function renderBlogPost(post: BlogPost): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    url: `${SITE_URL}/blog/${post.slug}`,
    publisher: { '@type': 'Organization', name: 'YouWontDare', url: SITE_URL },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${sharedHead(
    `${post.title} — YouWontDare`,
    post.description,
    `/blog/${post.slug}`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  )}
</head>
<body>
  ${header()}
  <main class="container">
    <h1>${escapeHtml(post.title)}</h1>
    <div class="post-meta">${new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    ${post.body}
    ${ctaBox()}
  </main>
  ${footer()}
</body>
</html>`;
}

export function renderBlogIndex(posts: BlogPost[]): string {
  const items = posts.map(p => `
    <li>
      <a href="/blog/${p.slug}">${escapeHtml(p.title)}</a>
      <div class="desc">${escapeHtml(p.description)}</div>
    </li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${sharedHead('Blog — YouWontDare', 'Dare ideas, group games, and ways to embarrass your mates. The YouWontDare blog.', '/blog')}
</head>
<body>
  ${header()}
  <main class="container">
    <ul class="post-list">${items}</ul>
  </main>
  ${footer()}
</body>
</html>`;
}
