import { Router } from 'express';
import { createReview, getEventReviews, updateReview, deleteReview, reportReview } from '../controllers/reviews.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createReviewValidator } from '../validators/reviews.js';

const router = Router();

router.post('/', authenticate, createReviewValidator, validate, createReview);
router.get('/event/:id', getEventReviews);
router.patch('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);
router.post('/:id/report', authenticate, reportReview);

export default router;
