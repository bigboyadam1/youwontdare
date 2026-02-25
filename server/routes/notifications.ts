import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { VAPID_PUBLIC_KEY } from '../notifications.js';

const router = Router();

// GET /api/notifications/vapid-key — public VAPID key for client
router.get('/vapid-key', (_req, res) => {
  res.json({ key: VAPID_PUBLIC_KEY });
});

// POST /api/notifications/subscribe — save push subscription
router.post('/subscribe', requireAuth, (req, res) => {
  const { subscription } = req.body;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    res.status(400).json({ error: 'Invalid subscription' });
    return;
  }

  // Upsert
  const existing = db.prepare('SELECT id FROM push_subscriptions WHERE endpoint = ?').get(subscription.endpoint);
  if (existing) {
    db.prepare('UPDATE push_subscriptions SET user_id = ?, keys_p256dh = ?, keys_auth = ? WHERE endpoint = ?')
      .run(req.session.userId!, subscription.keys.p256dh, subscription.keys.auth, subscription.endpoint);
  } else {
    db.prepare('INSERT INTO push_subscriptions (user_id, endpoint, keys_p256dh, keys_auth) VALUES (?, ?, ?, ?)')
      .run(req.session.userId!, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth);
  }

  res.json({ ok: true });
});

// POST /api/notifications/unsubscribe — remove push subscription
router.post('/unsubscribe', requireAuth, (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    res.status(400).json({ error: 'Endpoint required' });
    return;
  }

  db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?')
    .run(endpoint, req.session.userId!);

  res.json({ ok: true });
});

export default router;
