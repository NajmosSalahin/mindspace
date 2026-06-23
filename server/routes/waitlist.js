import { Router } from 'express';
import { joinWaitlist, getWaitlist, leaveWaitlist, notifyNext } from '../controllers/waitlist.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.post('/join', authenticate, joinWaitlist);
router.get('/:eventId', authenticate, authorize('organizer', 'admin'), getWaitlist);
router.delete('/leave/:eventId', authenticate, leaveWaitlist);
router.post('/notify-next', authenticate, authorize('organizer', 'admin'), notifyNext);

export default router;
