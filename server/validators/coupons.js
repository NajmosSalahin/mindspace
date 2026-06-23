import { body } from 'express-validator';

export const createCouponValidator = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('discountType').isIn(['percent', 'fixed']).withMessage('Discount type must be percent or fixed'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be >= 0'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
];

export const validateCouponValidator = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('eventId').optional().isMongoId().withMessage('Valid event ID is required'),
];
