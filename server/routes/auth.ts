import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, username, displayName } = req.body;

  if (!email || !password || !username || !displayName) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    res.status(400).json({ error: 'Username can only contain letters, numbers, hyphens, and underscores', field: 'username' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters', field: 'password' });
    return;
  }

  // Check uniqueness
  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existingEmail) {
    res.status(409).json({ error: 'Email already registered', field: 'email' });
    return;
  }

  const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username.toLowerCase());
  if (existingUsername) {
    res.status(409).json({ error: 'Username already taken', field: 'username' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const userResult = db.prepare(
    'INSERT INTO users (email, password_hash, username, display_name) VALUES (?, ?, ?, ?)'
  ).run(email.toLowerCase(), passwordHash, username.toLowerCase(), displayName);

  const userId = userResult.lastInsertRowid as number;

  // Auto-create personal board
  db.prepare(
    'INSERT INTO boards (owner_id, type, name, slug, is_public) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, 'personal', `${displayName}'s Board`, username.toLowerCase(), 1);

  const boardRow = db.prepare('SELECT id FROM boards WHERE slug = ?').get(username.toLowerCase()) as { id: number };

  // Add owner as board member
  db.prepare(
    'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)'
  ).run(boardRow.id, userId, 'owner');

  // Create session
  req.session.userId = userId;
  req.session.username = username.toLowerCase();

  const user = db.prepare('SELECT id, email, username, display_name, created_at FROM users WHERE id = ?').get(userId);
  res.status(201).json({ user });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as {
    id: number; email: string; password_hash: string | null; username: string; display_name: string; created_at: string; google_id: string | null;
  } | undefined;

  if (!user) {
    res.status(401).json({ error: 'No account with that email' });
    return;
  }

  if (!user.password_hash) {
    res.status(401).json({ error: 'This account uses Google login' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Wrong password' });
    return;
  }

  req.session.userId = user.id;
  req.session.username = user.username;

  res.json({
    user: { id: user.id, email: user.email, username: user.username, display_name: user.display_name, created_at: user.created_at }
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    res.json({ user: null });
    return;
  }

  const user = db.prepare(
    'SELECT id, email, username, display_name, created_at FROM users WHERE id = ?'
  ).get(req.session.userId);

  res.json({ user: user || null });
});

// --- Google OAuth ---

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || '';

// GET /api/auth/google — redirect to Google consent screen
router.get('/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    res.status(500).json({ error: 'Google OAuth not configured' });
    return;
  }

  const redirect = (req.query.redirect as string) || '';

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: redirect,
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// GET /api/auth/google/callback — exchange code for tokens, find/create user
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const postLoginRedirect = (state as string) || '/';

  if (!code || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth callback: missing code or credentials', { hasCode: !!code, hasClientId: !!GOOGLE_CLIENT_ID, hasSecret: !!GOOGLE_CLIENT_SECRET });
    res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
    return;
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json() as { access_token?: string; error?: string; error_description?: string };
    if (!tokens.access_token) {
      console.error('Google OAuth token exchange failed:', tokens.error, tokens.error_description);
      res.redirect(`${FRONTEND_URL}/login?error=token_failed`);
      return;
    }

    // Fetch user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json() as { id: string; email: string; name: string; picture?: string };

    if (!profile.id || !profile.email) {
      console.error('Google OAuth profile fetch failed:', profile);
      res.redirect(`${FRONTEND_URL}/login?error=profile_failed`);
      return;
    }

    // Find existing user by google_id or email
    let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id) as {
      id: number; username: string; email: string; display_name: string;
    } | undefined;

    if (!user) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(profile.email.toLowerCase()) as {
        id: number; username: string; email: string; display_name: string;
      } | undefined;
      if (user) {
        // Link Google ID to existing account
        db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(profile.id, user.id);
      }
    }

    if (user) {
      // Existing user — set session and redirect
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.save((err) => {
        if (err) console.error('Session save error:', err);
        res.redirect(`${FRONTEND_URL}${postLoginRedirect}`);
      });
      return;
    }

    // New user — create account without password, without username yet
    // Generate a temporary username from google id
    const tempUsername = `user-${crypto.randomBytes(4).toString('hex')}`;
    const displayName = profile.name || profile.email.split('@')[0];

    const result = db.prepare(
      'INSERT INTO users (email, password_hash, username, display_name, google_id) VALUES (?, ?, ?, ?, ?)'
    ).run(profile.email.toLowerCase(), '', tempUsername, displayName, profile.id);

    const userId = result.lastInsertRowid as number;

    // Auto-create personal board
    db.prepare(
      'INSERT INTO boards (owner_id, type, name, slug, is_public) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, 'personal', `${displayName}'s Board`, tempUsername, 1);

    const boardRow = db.prepare('SELECT id FROM boards WHERE slug = ?').get(tempUsername) as { id: number };
    db.prepare('INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)').run(boardRow.id, userId, 'owner');

    req.session.userId = userId;
    req.session.username = tempUsername;

    // Redirect to onboarding to pick a username
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.redirect(`${FRONTEND_URL}/onboarding?setup=true`);
    });
  } catch (err) {
    console.error('Google OAuth error:', (err as Error).message);
    res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
  }
});

// POST /api/auth/setup-username — for Google users who need to pick a username
router.post('/setup-username', (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Not logged in' });
    return;
  }

  const { username, displayName } = req.body;
  if (!username) {
    res.status(400).json({ error: 'Username is required', field: 'username' });
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    res.status(400).json({ error: 'Username can only contain letters, numbers, hyphens, and underscores', field: 'username' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username.toLowerCase(), req.session.userId);
  if (existing) {
    res.status(409).json({ error: 'Username already taken', field: 'username' });
    return;
  }

  const currentUser = db.prepare('SELECT username FROM users WHERE id = ?').get(req.session.userId) as { username: string };
  const oldUsername = currentUser.username;

  // Update user
  if (displayName) {
    db.prepare('UPDATE users SET username = ?, display_name = ? WHERE id = ?').run(username.toLowerCase(), displayName, req.session.userId);
  } else {
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username.toLowerCase(), req.session.userId);
  }

  // Update personal board slug
  db.prepare('UPDATE boards SET slug = ?, name = REPLACE(name, ?, ?) WHERE owner_id = ? AND type = ?')
    .run(username.toLowerCase(), oldUsername, username.toLowerCase(), req.session.userId, 'personal');

  req.session.username = username.toLowerCase();

  const user = db.prepare('SELECT id, email, username, display_name, created_at FROM users WHERE id = ?').get(req.session.userId);
  res.json({ user });
});

export default router;
