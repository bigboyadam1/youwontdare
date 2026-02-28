import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../supabase.js';
import { notifyUser } from '../notifications.js';

const router = Router();

// POST /api/boards/:boardId/dares — create dare
router.post('/boards/:boardId/dares', (req, res) => {
  const boardId = Number(req.params.boardId);
  const { author, text, location, reward, daredId, deadline, isAnonymous } = req.body;

  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(boardId) as Record<string, unknown> | undefined;
  if (!board) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }

  if (!text) {
    res.status(400).json({ error: 'Dare text is required' });
    return;
  }

  // Group boards require auth
  if (board.type === 'group') {
    if (!req.session.userId) {
      res.status(401).json({ error: 'Login required for group boards' });
      return;
    }
    // Must be a member
    const membership = db.prepare(
      'SELECT 1 FROM board_members WHERE board_id = ? AND user_id = ?'
    ).get(boardId, req.session.userId);
    if (!membership) {
      res.status(403).json({ error: 'You must be a member of this board' });
      return;
    }
  }

  // For personal boards: dared_id is always the board owner
  // For group boards: dared_id is specified in the request
  let resolvedDaredId: number | null = null;
  let resolvedDarerId: number | null = req.session.userId || null;

  if (board.type === 'personal') {
    resolvedDaredId = board.owner_id as number;
  } else if (board.type === 'group') {
    if (!daredId) {
      res.status(400).json({ error: 'Must specify who you are daring on group boards' });
      return;
    }
    resolvedDaredId = Number(daredId);
  }

  const dareName = req.session.userId
    ? (db.prepare('SELECT display_name FROM users WHERE id = ?').get(req.session.userId) as { display_name: string })?.display_name || author || 'Anonymous'
    : author || 'Anonymous';

  const result = db.prepare(
    'INSERT INTO dares (author, text, location, reward, board_id, darer_id, dared_id, deadline, is_anonymous) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(dareName, text.toUpperCase(), location || null, reward || null, boardId, resolvedDarerId, resolvedDaredId, deadline || null, isAnonymous ? 1 : 0);

  const dare = db.prepare('SELECT * FROM dares WHERE id = ?').get(result.lastInsertRowid);

  // Auto-add logged-in darers as friends on personal boards
  if (board.type === 'personal' && req.session.userId && req.session.userId !== board.owner_id) {
    const existing = db.prepare(
      'SELECT 1 FROM board_members WHERE board_id = ? AND user_id = ?'
    ).get(boardId, req.session.userId);
    if (!existing) {
      db.prepare(
        'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)'
      ).run(boardId, req.session.userId, 'friend');
    }
  }

  // Notify the dared person
  if (resolvedDaredId) {
    notifyUser(resolvedDaredId, "You've been dared!", text.toUpperCase().slice(0, 60));
  }

  res.status(201).json(dare);
});

// POST /api/dares/:id/hype — no auth
router.post('/dares/:id/hype', (req, res) => {
  const { id } = req.params;
  db.prepare('UPDATE dares SET hypes = hypes + 1 WHERE id = ?').run(id);
  const dare = db.prepare('SELECT * FROM dares WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!dare) {
    res.status(404).json({ error: 'Dare not found' });
    return;
  }

  // Notify when dare hits 10 hypes
  if (dare.hypes === 10 && dare.dared_id) {
    notifyUser(dare.dared_id as number, 'Your dare is HOT!', `10 people want you to do it: ${(dare.text as string).slice(0, 60)}`);
  }

  res.json(dare);
});

// POST /api/dares/:id/complete — auth: must be dared_id
router.post('/dares/:id/complete', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { proof_url, proof_caption } = req.body;

  const dare = db.prepare('SELECT * FROM dares WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!dare) {
    res.status(404).json({ error: 'Dare not found' });
    return;
  }

  if (dare.dared_id !== req.session.userId) {
    res.status(403).json({ error: 'Only the person being dared can complete it' });
    return;
  }

  let finalUrl = proof_url || null;

  // Upload base64 data URL to Supabase Storage if available
  if (proof_url && supabase && proof_url.startsWith('data:')) {
    try {
      // Parse data URL: data:image/jpeg;base64,/9j/4AAQ...
      const match = proof_url.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'bin';
        const fileName = `proofs/${id}_${Date.now()}.${ext}`;
        const buffer = Buffer.from(base64Data, 'base64');

        const { data, error } = await supabase.storage
          .from('proofs')
          .upload(fileName, buffer, { contentType: mimeType, upsert: true });

        if (error) {
          console.error('Supabase upload error:', error.message);
        } else {
          const { data: publicData } = supabase.storage.from('proofs').getPublicUrl(data.path);
          finalUrl = publicData.publicUrl;
        }
      }
    } catch (err) {
      console.error('Proof upload failed, storing as-is:', (err as Error).message);
    }
  }

  db.prepare(
    'UPDATE dares SET status = ?, proof_url = ?, proof_caption = ? WHERE id = ?'
  ).run('completed', finalUrl, proof_caption || null, id);

  // Notify the darer that their dare was completed
  if (dare.darer_id && dare.darer_id !== req.session.userId) {
    notifyUser(dare.darer_id as number, 'They completed it!', `Your dare was conquered: ${(dare.text as string).slice(0, 60)}`);
  }

  const updated = db.prepare('SELECT * FROM dares WHERE id = ?').get(id);
  res.json(updated);
});

// POST /api/dares/:id/chicken — auth: must be dared_id
router.post('/dares/:id/chicken', requireAuth, (req, res) => {
  const { id } = req.params;

  const dare = db.prepare('SELECT * FROM dares WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!dare) {
    res.status(404).json({ error: 'Dare not found' });
    return;
  }

  if (dare.dared_id !== req.session.userId) {
    res.status(403).json({ error: 'Only the person being dared can chicken out' });
    return;
  }

  db.prepare('UPDATE dares SET status = ? WHERE id = ?').run('chickened', id);
  const updated = db.prepare('SELECT * FROM dares WHERE id = ?').get(id);
  res.json(updated);
});

// POST /api/dares/:id/reveal — reveal anonymous dare (auth: darer only, dare must be completed)
router.post('/dares/:id/reveal', requireAuth, (req, res) => {
  const { id } = req.params;

  const dare = db.prepare('SELECT * FROM dares WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!dare) {
    res.status(404).json({ error: 'Dare not found' });
    return;
  }

  if (dare.darer_id !== req.session.userId) {
    res.status(403).json({ error: 'Only the darer can reveal' });
    return;
  }

  if (dare.status !== 'completed') {
    res.status(400).json({ error: 'Dare must be completed to reveal' });
    return;
  }

  if (!dare.is_anonymous) {
    res.status(400).json({ error: 'Dare is not anonymous' });
    return;
  }

  db.prepare('UPDATE dares SET revealed = 1 WHERE id = ?').run(id);
  const updated = db.prepare('SELECT * FROM dares WHERE id = ?').get(id);
  res.json(updated);
});

// DELETE /api/dares/:id — delete dare (auth: must be darer_id)
router.delete('/dares/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  const dare = db.prepare('SELECT * FROM dares WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!dare) {
    res.status(404).json({ error: 'Dare not found' });
    return;
  }

  if (dare.darer_id !== req.session.userId) {
    res.status(403).json({ error: 'Only the dare creator can delete it' });
    return;
  }

  db.prepare('DELETE FROM dare_reactions WHERE dare_id = ?').run(id);
  db.prepare('DELETE FROM spice_votes WHERE dare_id = ?').run(id);
  db.prepare('DELETE FROM dares WHERE id = ?').run(id);

  res.json({ success: true });
});

// POST /api/dares/:id/react — toggle reaction (no auth required)
router.post('/dares/:id/react', (req, res) => {
  const { id } = req.params;
  const { reaction_type, anon_id } = req.body;

  if (!['fire', 'skull', 'crying'].includes(reaction_type)) {
    res.status(400).json({ error: 'Invalid reaction type' });
    return;
  }

  const dare = db.prepare('SELECT id FROM dares WHERE id = ?').get(id);
  if (!dare) {
    res.status(404).json({ error: 'Dare not found' });
    return;
  }

  const userId = req.session.userId || null;
  const anonKey = userId ? null : (anon_id || null);

  if (!userId && !anonKey) {
    res.status(400).json({ error: 'Must provide anon_id or be logged in' });
    return;
  }

  // Toggle: check if reaction exists
  const existing = userId
    ? db.prepare('SELECT id FROM dare_reactions WHERE dare_id = ? AND user_id = ? AND reaction_type = ?').get(id, userId, reaction_type)
    : db.prepare('SELECT id FROM dare_reactions WHERE dare_id = ? AND anon_id = ? AND reaction_type = ?').get(id, anonKey, reaction_type);

  if (existing) {
    db.prepare('DELETE FROM dare_reactions WHERE id = ?').run((existing as { id: number }).id);
  } else {
    db.prepare('INSERT INTO dare_reactions (dare_id, user_id, anon_id, reaction_type) VALUES (?, ?, ?, ?)').run(id, userId, anonKey, reaction_type);
  }

  // Return updated counts
  const counts = db.prepare(`
    SELECT reaction_type, COUNT(*) as count
    FROM dare_reactions WHERE dare_id = ?
    GROUP BY reaction_type
  `).all(id) as { reaction_type: string; count: number }[];

  const result: Record<string, number> = { fire: 0, skull: 0, crying: 0 };
  for (const row of counts) result[row.reaction_type] = row.count;

  res.json({ reactions: result });
});

// POST /api/dares/:id/spice — rate 1-5 peppers (no auth required)
router.post('/dares/:id/spice', (req, res) => {
  const { id } = req.params;
  const { rating, anon_id } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Rating must be 1-5' });
    return;
  }

  const dare = db.prepare('SELECT id, status FROM dares WHERE id = ?').get(id) as { id: number; status: string } | undefined;
  if (!dare) {
    res.status(404).json({ error: 'Dare not found' });
    return;
  }
  if (dare.status !== 'completed') {
    res.status(400).json({ error: 'Can only rate completed dares' });
    return;
  }

  const userId = req.session.userId || null;
  const anonKey = userId ? null : (anon_id || null);

  if (!userId && !anonKey) {
    res.status(400).json({ error: 'Must provide anon_id or be logged in' });
    return;
  }

  // Upsert
  if (userId) {
    const existing = db.prepare('SELECT id FROM spice_votes WHERE dare_id = ? AND user_id = ?').get(id, userId);
    if (existing) {
      db.prepare('UPDATE spice_votes SET rating = ? WHERE id = ?').run(rating, (existing as { id: number }).id);
    } else {
      db.prepare('INSERT INTO spice_votes (dare_id, user_id, anon_id, rating) VALUES (?, ?, ?, ?)').run(id, userId, null, rating);
    }
  } else {
    const existing = db.prepare('SELECT id FROM spice_votes WHERE dare_id = ? AND anon_id = ?').get(id, anonKey);
    if (existing) {
      db.prepare('UPDATE spice_votes SET rating = ? WHERE id = ?').run(rating, (existing as { id: number }).id);
    } else {
      db.prepare('INSERT INTO spice_votes (dare_id, user_id, anon_id, rating) VALUES (?, ?, ?, ?)').run(id, null, anonKey, rating);
    }
  }

  const spice = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM spice_votes WHERE dare_id = ?').get(id) as { avg: number; count: number };

  res.json({ spice_avg: Math.round((spice.avg || 0) * 10) / 10, spice_count: spice.count });
});


export default router;
