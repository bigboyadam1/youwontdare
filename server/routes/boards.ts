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
    SELECT d.*,
      CASE WHEN d.is_anonymous = 1 AND d.revealed = 0 THEN '???' ELSE u.display_name END as darer_name,
      (SELECT COUNT(*) FROM dare_reactions WHERE dare_id = d.id AND reaction_type = 'fire') as react_fire,
      (SELECT COUNT(*) FROM dare_reactions WHERE dare_id = d.id AND reaction_type = 'skull') as react_skull,
      (SELECT COUNT(*) FROM dare_reactions WHERE dare_id = d.id AND reaction_type = 'crying') as react_crying,
      (SELECT ROUND(AVG(rating), 1) FROM spice_votes WHERE dare_id = d.id) as spice_avg,
      (SELECT COUNT(*) FROM spice_votes WHERE dare_id = d.id) as spice_count
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
  if (!board.is_public) {
    if (!req.session.userId) {
      res.status(403).json({ error: 'Private board — join with invite code' });
      return;
    }
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
      CASE WHEN d.is_anonymous = 1 AND d.revealed = 0 THEN '???' ELSE darer.display_name END as darer_name,
      dared.display_name as dared_name,
      (SELECT COUNT(*) FROM dare_reactions WHERE dare_id = d.id AND reaction_type = 'fire') as react_fire,
      (SELECT COUNT(*) FROM dare_reactions WHERE dare_id = d.id AND reaction_type = 'skull') as react_skull,
      (SELECT COUNT(*) FROM dare_reactions WHERE dare_id = d.id AND reaction_type = 'crying') as react_crying,
      (SELECT ROUND(AVG(rating), 1) FROM spice_votes WHERE dare_id = d.id) as spice_avg,
      (SELECT COUNT(*) FROM spice_votes WHERE dare_id = d.id) as spice_count
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
  const { name, isPublic } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  // Auto-generate slug from name + random suffix
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  const suffix = crypto.randomBytes(3).toString('hex');
  const slug = `${baseSlug}-${suffix}`;

  const inviteCode = crypto.randomBytes(4).toString('hex');

  const result = db.prepare(
    'INSERT INTO boards (owner_id, type, name, slug, is_public, invite_code) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.session.userId!, 'trip', name, slug, isPublic ? 1 : 0, inviteCode);

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

// POST /api/boards/join — join trip by invite code
router.post('/join', requireAuth, (req, res) => {
  const { code } = req.body;

  if (!code) {
    res.status(400).json({ error: 'Invite code is required' });
    return;
  }

  const board = db.prepare(
    "SELECT * FROM boards WHERE invite_code = ? AND type = 'trip'"
  ).get(code) as Record<string, unknown> | undefined;

  if (!board) {
    res.status(404).json({ error: 'No trip found with that code' });
    return;
  }

  // Check if already a member
  const existing = db.prepare(
    'SELECT 1 FROM board_members WHERE board_id = ? AND user_id = ?'
  ).get(board.id, req.session.userId!);

  if (existing) {
    res.json({ ok: true, slug: board.slug, message: 'Already a member' });
    return;
  }

  db.prepare(
    'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)'
  ).run(board.id, req.session.userId!, 'member');

  res.json({ ok: true, slug: board.slug });
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
  `).all(req.session.userId!) as any[];

  const boardsWithMembers = boards.map(board => {
    if (board.type === 'trip') {
      const members = db.prepare(`
        SELECT u.id, u.username, u.display_name
        FROM board_members bm
        JOIN users u ON bm.user_id = u.id
        WHERE bm.board_id = ?
      `).all(board.id);
      return { ...board, members };
    }
    return board;
  });

  res.json({ boards: boardsWithMembers });
});

export default router;
