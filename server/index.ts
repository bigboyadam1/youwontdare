import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import BetterSqlite3SessionStore from 'better-sqlite3-session-store';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './db.js';
import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';
import dareRoutes from './routes/dares.js';
import profileRoutes from './routes/profile.js';
import notificationRoutes from './routes/notifications.js';
import blogRoutes from './routes/blog.js';
import statsRoutes from './routes/stats.js';
import { posts as blogPosts } from './blog/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || '3001');
const isProd = process.env.NODE_ENV === 'production';

// Trust proxy in production (Railway sits behind a reverse proxy)
if (isProd) {
  app.set('trust proxy', 1);
}

// --- Security headers ---
app.use(helmet({
  contentSecurityPolicy: false, // CSP handled by Vite/meta tags
  crossOriginEmbedderPolicy: false, // Allow embedding images from Supabase
}));

// --- Session secret guard ---
if (isProd && !process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET environment variable is not set in production');
  process.exit(1);
}

// Redirect www to non-www
app.use((req, res, next) => {
  const host = req.headers.host || '';
  if (host.startsWith('www.')) {
    res.redirect(301, `https://youwontdare.xyz${req.originalUrl}`);
    return;
  }
  next();
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'https://youwontdare.xyz',
  'https://www.youwontdare.xyz',
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// --- Session middleware ---
const SqliteStore = BetterSqlite3SessionStore(session);

app.use(
  session({
    store: new SqliteStore({
      client: db,
      expired: { clear: true, intervalMs: 900000 },
    }),
    secret: process.env.SESSION_SECRET || 'youwontdare-dev-secret',
    resave: false,
    saveUninitialized: false,
    rolling: true, // Refresh cookie expiry on every request
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: isProd,
      // Omit domain so cookie is "host-only" (youwontdare.xyz exact match).
      // Safari handles host-only cookies more reliably than domain cookies
      // with a leading dot. www is already redirected to bare domain.
    },
  })
);

// --- Rate limiting ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down' },
});
app.use('/api', apiLimiter);

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api', dareRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);

// --- Serve static files in production ---
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// --- Dynamic OG meta tags for board/trip pages ---
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function injectOgTags(htmlPath: string, title: string, description: string, canonicalUrl?: string): string {
  try {
    const safeTitle = escapeHtml(title);
    const safeDesc = escapeHtml(description);
    let html = fs.readFileSync(htmlPath, 'utf-8');
    html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${safeTitle}"`);
    html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${safeDesc}"`);
    html = html.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${safeTitle}"`);
    html = html.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${safeDesc}"`);
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);
    if (canonicalUrl) {
      html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${canonicalUrl}"`);
    }
    return html;
  } catch {
    return '';
  }
}

app.get('/board/:username', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  const board = db.prepare(
    "SELECT b.name, u.display_name FROM boards b JOIN users u ON b.owner_id = u.id WHERE b.slug = ? AND b.type = 'personal'"
  ).get(req.params.username) as { name: string; display_name: string } | undefined;

  if (board) {
    const canonical = `https://youwontdare.xyz/board/${req.params.username}`;
    const html = injectOgTags(indexPath, `${board.display_name}'s Dare Board`, `Dare ${board.display_name} — they won't do it. YouWontDare`, canonical);
    if (html) { res.send(html); return; }
  }
  res.sendFile(indexPath);
});

app.get('/group/:slug', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  const board = db.prepare(
    "SELECT name FROM boards WHERE slug = ? AND type = 'group'"
  ).get(req.params.slug) as { name: string } | undefined;

  if (board) {
    const canonical = `https://youwontdare.xyz/group/${req.params.slug}`;
    const html = injectOgTags(indexPath, `${board.name} — YouWontDare Group`, `Join the group and dare each other. YouWontDare`, canonical);
    if (html) { res.send(html); return; }
  }
  res.sendFile(indexPath);
});

// --- Blog ---
app.use('/blog', blogRoutes);

// --- Sitemap ---
app.get('/sitemap.xml', (_req, res) => {
  const staticPages = [
    '',
    '/blog',
    ...blogPosts.map(p => `/blog/${p.slug}`),
  ];

  const personalBoards = db.prepare(
    "SELECT slug FROM boards WHERE type = 'personal' AND is_public = 1"
  ).all() as { slug: string }[];

  const groupBoards = db.prepare(
    "SELECT slug FROM boards WHERE type = 'group' AND is_public = 1"
  ).all() as { slug: string }[];

  const urls = [
    ...staticPages.map(p => `  <url><loc>https://youwontdare.xyz${p}</loc></url>`),
    ...personalBoards.map(b => `  <url><loc>https://youwontdare.xyz/board/${b.slug}</loc></url>`),
    ...groupBoards.map(b => `  <url><loc>https://youwontdare.xyz/group/${b.slug}</loc></url>`),
  ];

  res.type('application/xml').send(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`
  );
});

// SPA fallback — serve index.html for all non-API routes
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
