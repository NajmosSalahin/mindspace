import { body } from 'express-validator';

export const createSurveyValidator = [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.question').trim().notEmpty().withMessage('Question text is required'),
  body('questions.*.type').isIn(['rating', 'text', 'mcq']).withMessage('Valid question type is required'),
];

export const respondValidator = [
  body('answers').isArray({ min: 1 }).withMessage('Answers are required'),
];
