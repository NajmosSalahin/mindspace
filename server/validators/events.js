import { body } from 'express-validator';

export const createEventValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['Tech', 'Music', 'Sports', 'Business', 'Education', 'Gaming', 'Workshop', 'Other'])
    .withMessage('Valid category is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('ticketTypes').isArray({ min: 1 }).withMessage('At least one ticket type is required'),
  body('ticketTypes.*.name').trim().notEmpty().withMessage('Ticket type name is required'),
  body('ticketTypes.*.price').isFloat({ min: 0 }).withMessage('Ticket price must be >= 0'),
  body('ticketTypes.*.quantity').isInt({ min: 0 }).withMessage('Ticket quantity must be >= 0'),
];

export const updateEventValidator = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('category').optional().isIn(['Tech', 'Music', 'Sports', 'Business', 'Education', 'Gaming', 'Workshop', 'Other']),
];
