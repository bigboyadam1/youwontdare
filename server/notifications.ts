import webPush from 'web-push';
import db from './db.js';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:hello@youwontdare.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export function notifyUser(userId: number, title: string, body: string, url?: string) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const subs = db.prepare(
    'SELECT endpoint, keys_p256dh, keys_auth FROM push_subscriptions WHERE user_id = ?'
  ).all(userId) as { endpoint: string; keys_p256dh: string; keys_auth: string }[];

  const payload = JSON.stringify({ title, body, url: url || '/' });

  for (const sub of subs) {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
    };

    webPush.sendNotification(pushSubscription, payload).catch((err) => {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription expired — remove it
        db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(sub.endpoint);
      }
    });
  }
}

export { VAPID_PUBLIC_KEY };
