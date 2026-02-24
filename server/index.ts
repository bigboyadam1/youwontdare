import express from 'express';
import cors from 'cors';
import session from 'express-session';
import BetterSqlite3SessionStore from 'better-sqlite3-session-store';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';
import dareRoutes from './routes/dares.js';
import profileRoutes from './routes/profile.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors({ origin: true, credentials: true }));
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
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api', dareRoutes);
app.use('/api/profile', profileRoutes);

// --- Serve static files in production ---
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback — serve index.html for all non-API routes
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
