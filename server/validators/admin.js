import { body } from 'express-validator';

export const createCategoryValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('slug').trim().notEmpty().withMessage('Category slug is required'),
];

export const approveOrganizerValidator = [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
];
