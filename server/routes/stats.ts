import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/stats — public: completed count, authenticated: also users count
router.get('/', (req, res) => {
  const dares = db.prepare("SELECT COUNT(*) as completed FROM dares WHERE status = 'completed'").get() as { completed: number };

  if (req.session.userId) {
    const users = db.prepare('SELECT COUNT(*) as total FROM users').get() as { total: number };
    res.json({ completed: dares.completed, users: users.total });
    return;
  }

  res.json({ completed: dares.completed });
});

export default router;
