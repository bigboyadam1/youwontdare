import express from 'express';
import cors from 'cors';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || '3001');
const isProd = process.env.NODE_ENV === 'production';

// Trust proxy in production (Railway sits behind a reverse proxy)
if (isProd) {
  app.set('trust proxy', 1);
}

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
      sameSite: 'lax',
      secure: isProd,
    },
  })
);

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api', dareRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);

// --- Serve static files in production ---
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// --- Dynamic OG meta tags for board/trip pages ---
function injectOgTags(htmlPath: string, title: string, description: string): string {
  try {
    let html = fs.readFileSync(htmlPath, 'utf-8');
    html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${title}"`);
    html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${description}"`);
    html = html.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${title}"`);
    html = html.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${description}"`);
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
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
    const html = injectOgTags(indexPath, `${board.display_name}'s Dare Board`, `Dare ${board.display_name} — they won't do it. YouWontDare`);
    if (html) { res.send(html); return; }
  }
  res.sendFile(indexPath);
});

app.get('/trip/:slug', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  const board = db.prepare(
    "SELECT name FROM boards WHERE slug = ? AND type = 'trip'"
  ).get(req.params.slug) as { name: string } | undefined;

  if (board) {
    const html = injectOgTags(indexPath, `${board.name} — YouWontDare Trip`, `Join the trip and dare each other. YouWontDare`);
    if (html) { res.send(html); return; }
  }
  res.sendFile(indexPath);
});

// SPA fallback — serve index.html for all non-API routes
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
