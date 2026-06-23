import { Router } from 'express';
import {
  createPaymentIntent, confirmPayment, getPaymentHistory, refundPayment, handleStripeWebhook,
} from '../controllers/payments.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/confirm', authenticate, confirmPayment);
router.get('/history', authenticate, getPaymentHistory);
router.post('/refund', authenticate, authorize('admin'), refundPayment);
router.post('/webhook/stripe', handleStripeWebhook);

export default router;
