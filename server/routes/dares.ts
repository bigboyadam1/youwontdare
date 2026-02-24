import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/boards/:boardId/dares — create dare
router.post('/boards/:boardId/dares', (req, res) => {
  const boardId = Number(req.params.boardId);
  const { author, text, location, reward, daredId } = req.body;

  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(boardId) as Record<string, unknown> | undefined;
  if (!board) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }

  if (!text) {
    res.status(400).json({ error: 'Dare text is required' });
    return;
  }

  // Trip boards require auth
  if (board.type === 'trip') {
    if (!req.session.userId) {
      res.status(401).json({ error: 'Login required for trip boards' });
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
  // For trip boards: dared_id is specified in the request
  let resolvedDaredId: number | null = null;
  let resolvedDarerId: number | null = req.session.userId || null;

  if (board.type === 'personal') {
    resolvedDaredId = board.owner_id as number;
  } else if (board.type === 'trip') {
    if (!daredId) {
      res.status(400).json({ error: 'Must specify who you are daring on trip boards' });
      return;
    }
    resolvedDaredId = Number(daredId);
  }

  const dareName = req.session.userId
    ? (db.prepare('SELECT display_name FROM users WHERE id = ?').get(req.session.userId) as { display_name: string })?.display_name || author || 'Anonymous'
    : author || 'Anonymous';

  const result = db.prepare(
    'INSERT INTO dares (author, text, location, reward, board_id, darer_id, dared_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(dareName, text.toUpperCase(), location || null, reward || null, boardId, resolvedDarerId, resolvedDaredId);

  const dare = db.prepare('SELECT * FROM dares WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(dare);
});

// POST /api/dares/:id/hype — no auth
router.post('/dares/:id/hype', (req, res) => {
  const { id } = req.params;
  db.prepare('UPDATE dares SET hypes = hypes + 1 WHERE id = ?').run(id);
  const dare = db.prepare('SELECT * FROM dares WHERE id = ?').get(id);
  if (!dare) {
    res.status(404).json({ error: 'Dare not found' });
    return;
  }
  res.json(dare);
});

// POST /api/dares/:id/complete — auth: must be dared_id
router.post('/dares/:id/complete', requireAuth, (req, res) => {
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

  db.prepare(
    'UPDATE dares SET status = ?, proof_url = ?, proof_caption = ? WHERE id = ?'
  ).run('completed', proof_url || null, proof_caption || null, id);

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

// AI dare generation — unchanged
router.post('/generate-dares', async (req, res) => {
  const { vibe, location, spice } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    return;
  }

  const client = new Anthropic();

  const spiceGuide: Record<string, string> = {
    mild: 'Keep it fun and safe — something anyone could do without much embarrassment.',
    medium: 'Push boundaries a bit — mildly embarrassing but still harmless and legal.',
    unhinged: 'Go wild — maximum chaos, maximum cringe, but still legal and not dangerous.',
  };

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Generate exactly 3 travel dares. Each dare should be a single sentence, bold and fun.
${vibe && vibe !== 'anything' ? `Vibe: ${vibe}` : ''}
${location ? `Location: ${location}` : ''}
Spice level: ${spiceGuide[spice] || spiceGuide.medium}

Return ONLY a JSON array of 3 strings. No other text. Example: ["DARE 1", "DARE 2", "DARE 3"]`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const dares = JSON.parse(text);
    res.json({ dares });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('AI generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate dares' });
  }
});

export default router;
