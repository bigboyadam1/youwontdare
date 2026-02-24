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
    res.status(400).json({ error: 'Username can only contain letters, numbers, hyphens, and underscores' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  // Check uniqueness
  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingEmail) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username.toLowerCase());
  if (existingUsername) {
    res.status(409).json({ error: 'Username already taken' });
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
    id: number; email: string; password_hash: string; username: string; display_name: string; created_at: string;
  } | undefined;

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
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

export default router;
