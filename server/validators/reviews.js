import { body } from 'express-validator';

export const createReviewValidator = [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
];
