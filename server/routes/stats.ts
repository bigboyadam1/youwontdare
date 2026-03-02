import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/stats — public stats (no auth required)
router.get('/', (_req, res) => {
  const row = db.prepare("SELECT COUNT(*) as completed FROM dares WHERE status = 'completed'").get() as { completed: number };
  res.json({ completed: row.completed });
});

export default router;
