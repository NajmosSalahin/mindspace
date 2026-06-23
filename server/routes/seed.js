import { Router } from 'express';
import { seed } from '../scripts/seed.js';

const router = Router();

router.get('/', async (req, res) => {
  const secret = req.query.key || req.headers['x-seed-key'];

  if (!process.env.SEED_SECRET) {
    return res.status(500).json({ success: false, message: 'SEED_SECRET not configured on server' });
  }

  if (secret !== process.env.SEED_SECRET) {
    return res.status(401).json({ success: false, message: 'Invalid seed key' });
  }

  try {
    const result = await seed();
    res.json({ success: true, message: 'Database seeded successfully', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
