import { Router } from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/boards/personal/:username — board + dares
router.get('/personal/:username', (req, res) => {
  const { username } = req.params;

  const board = db.prepare(
    "SELECT b.*, u.display_name as owner_name FROM boards b JOIN users u ON b.owner_id = u.id WHERE b.slug = ? AND b.type = 'personal'"
  ).get(username.toLowerCase()) as Record<string, unknown> | undefined;

  if (!board) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }

  const dares = db.prepare(`
    SELECT d.*, u.display_name as darer_name
    FROM dares d
    LEFT JOIN users u ON d.darer_id = u.id
    WHERE d.board_id = ?
    ORDER BY
      CASE d.status
        WHEN 'pending' THEN (CASE WHEN d.hypes >= 10 THEN 0 ELSE 1 END)
        WHEN 'completed' THEN 2
        WHEN 'chickened' THEN 3
      END,
      d.hypes DESC,
      d.created_at DESC
  `).all(board.id);

  res.json({ board, dares });
});

// GET /api/boards/trip/:slug — board + dares + members
router.get('/trip/:slug', (req, res) => {
  const { slug } = req.params;

  const board = db.prepare(
    "SELECT b.*, u.display_name as owner_name FROM boards b JOIN users u ON b.owner_id = u.id WHERE b.slug = ? AND b.type = 'trip'"
  ).get(slug) as Record<string, unknown> | undefined;

  if (!board) {
    res.status(404).json({ error: 'Trip board not found' });
    return;
  }

  // Check access for private boards
  if (!board.is_public && req.session.userId) {
    const membership = db.prepare(
      'SELECT 1 FROM board_members WHERE board_id = ? AND user_id = ?'
    ).get(board.id, req.session.userId);
    if (!membership) {
      res.status(403).json({ error: 'Private board — join with invite code' });
      return;
    }
  }

  const dares = db.prepare(`
    SELECT d.*,
      darer.display_name as darer_name,
      dared.display_name as dared_name
    FROM dares d
    LEFT JOIN users darer ON d.darer_id = darer.id
    LEFT JOIN users dared ON d.dared_id = dared.id
    WHERE d.board_id = ?
    ORDER BY
      CASE d.status
        WHEN 'pending' THEN (CASE WHEN d.hypes >= 10 THEN 0 ELSE 1 END)
        WHEN 'completed' THEN 2
        WHEN 'chickened' THEN 3
      END,
      d.hypes DESC,
      d.created_at DESC
  `).all(board.id);

  const members = db.prepare(`
    SELECT u.id, u.username, u.display_name, bm.role
    FROM board_members bm
    JOIN users u ON bm.user_id = u.id
    WHERE bm.board_id = ?
  `).all(board.id);

  res.json({ board, dares, members });
});

// POST /api/boards/trip — create trip board (auth required)
router.post('/trip', requireAuth, (req, res) => {
  const { name, slug, isPublic } = req.body;

  if (!name || !slug) {
    res.status(400).json({ error: 'Name and slug are required' });
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
    res.status(400).json({ error: 'Slug can only contain letters, numbers, hyphens, and underscores' });
    return;
  }

  const existing = db.prepare('SELECT id FROM boards WHERE slug = ?').get(slug.toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'Slug already taken' });
    return;
  }

  const inviteCode = crypto.randomBytes(4).toString('hex');

  const result = db.prepare(
    'INSERT INTO boards (owner_id, type, name, slug, is_public, invite_code) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.session.userId!, 'trip', name, slug.toLowerCase(), isPublic ? 1 : 0, inviteCode);

  const boardId = result.lastInsertRowid as number;

  // Add creator as board member (owner role)
  db.prepare(
    'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)'
  ).run(boardId, req.session.userId!, 'owner');

  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(boardId);
  res.status(201).json({ board });
});

// POST /api/boards/trip/:slug/join — join trip (invite code for private)
router.post('/trip/:slug/join', requireAuth, (req, res) => {
  const { slug } = req.params;
  const { inviteCode } = req.body;

  const board = db.prepare(
    "SELECT * FROM boards WHERE slug = ? AND type = 'trip'"
  ).get(slug) as Record<string, unknown> | undefined;

  if (!board) {
    res.status(404).json({ error: 'Trip board not found' });
    return;
  }

  // Check if already a member
  const existing = db.prepare(
    'SELECT 1 FROM board_members WHERE board_id = ? AND user_id = ?'
  ).get(board.id, req.session.userId!);

  if (existing) {
    res.json({ ok: true, message: 'Already a member' });
    return;
  }

  // Private boards require invite code
  if (!board.is_public) {
    if (!inviteCode || inviteCode !== board.invite_code) {
      res.status(403).json({ error: 'Invalid invite code' });
      return;
    }
  }

  db.prepare(
    'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)'
  ).run(board.id, req.session.userId!, 'member');

  res.json({ ok: true });
});

// POST /api/boards/trip/:slug/invite-code — regenerate invite code (owner only)
router.post('/trip/:slug/invite-code', requireAuth, (req, res) => {
  const { slug } = req.params;

  const board = db.prepare(
    "SELECT * FROM boards WHERE slug = ? AND type = 'trip'"
  ).get(slug) as Record<string, unknown> | undefined;

  if (!board) {
    res.status(404).json({ error: 'Trip board not found' });
    return;
  }

  if (board.owner_id !== req.session.userId) {
    res.status(403).json({ error: 'Only the owner can regenerate invite codes' });
    return;
  }

  const newCode = crypto.randomBytes(4).toString('hex');
  db.prepare('UPDATE boards SET invite_code = ? WHERE id = ?').run(newCode, board.id);

  res.json({ inviteCode: newCode });
});

// GET /api/boards/mine — list user's boards
router.get('/mine', requireAuth, (req, res) => {
  const boards = db.prepare(`
    SELECT b.*, u.display_name as owner_name,
      (SELECT COUNT(*) FROM board_members WHERE board_id = b.id) as member_count,
      (SELECT COUNT(*) FROM dares WHERE board_id = b.id) as dare_count
    FROM boards b
    JOIN board_members bm ON b.id = bm.board_id
    JOIN users u ON b.owner_id = u.id
    WHERE bm.user_id = ?
    ORDER BY b.created_at DESC
  `).all(req.session.userId!);

  res.json({ boards });
});

export default router;
