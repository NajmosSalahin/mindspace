import { body } from 'express-validator';

export const purchaseValidator = [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('tickets').isArray({ min: 1 }).withMessage('At least one ticket is required'),
  body('tickets.*.type').trim().notEmpty().withMessage('Ticket type is required'),
  body('tickets.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('couponCode').optional().trim(),
];

export const verifyQrValidator = [
  body('qrCode').notEmpty().withMessage('QR code is required'),
];
