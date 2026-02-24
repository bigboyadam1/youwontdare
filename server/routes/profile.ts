import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/profile/:username
router.get('/:username', (req, res) => {
  const { username } = req.params;

  const user = db.prepare(
    'SELECT id, username, display_name, created_at FROM users WHERE username = ?'
  ).get(username.toLowerCase()) as { id: number; username: string; display_name: string; created_at: string } | undefined;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const daresCompleted = (db.prepare(
    "SELECT COUNT(*) as c FROM dares WHERE dared_id = ? AND status = 'completed'"
  ).get(user.id) as { c: number }).c;

  const daresGiven = (db.prepare(
    'SELECT COUNT(*) as c FROM dares WHERE darer_id = ?'
  ).get(user.id) as { c: number }).c;

  const totalDared = (db.prepare(
    'SELECT COUNT(*) as c FROM dares WHERE dared_id = ?'
  ).get(user.id) as { c: number }).c;

  const completionRate = totalDared > 0 ? Math.round((daresCompleted / totalDared) * 100) : 0;

  res.json({
    user,
    stats: {
      daresCompleted,
      daresGiven,
      completionRate,
    },
  });
});

export default router;
