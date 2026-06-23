import { Router } from 'express';
import { createCoupon, getCoupons, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/coupons.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createCouponValidator, validateCouponValidator } from '../validators/coupons.js';

const router = Router();

router.post('/', authenticate, authorize('organizer', 'admin'), createCouponValidator, validate, createCoupon);
router.get('/', authenticate, getCoupons);
router.patch('/:id', authenticate, authorize('organizer', 'admin'), updateCoupon);
router.delete('/:id', authenticate, authorize('organizer', 'admin'), deleteCoupon);
router.post('/validate', authenticate, validateCouponValidator, validate, validateCoupon);

export default router;
