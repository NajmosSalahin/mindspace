import { Router } from 'express';
import {
  purchaseTicket, getTicketById, getMyTickets, cancelTicket, verifyQr, getCheckInStats,
} from '../controllers/tickets.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { purchaseValidator, verifyQrValidator } from '../validators/tickets.js';

const router = Router();

router.post('/purchase', authenticate, purchaseValidator, validate, purchaseTicket);
router.get('/my-tickets', authenticate, getMyTickets);
router.post('/verify-qr', authenticate, authorize('organizer', 'admin'), verifyQrValidator, validate, verifyQr);
router.get('/:id', authenticate, getTicketById);
router.post('/:id/cancel', authenticate, cancelTicket);
router.get('/:eventId/check-in-stats', authenticate, authorize('organizer', 'admin'), getCheckInStats);

export default router;
