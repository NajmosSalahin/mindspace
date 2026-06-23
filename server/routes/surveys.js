import { Router } from 'express';
import { createSurvey, getSurvey, respondSurvey, getSurveyResults, deleteSurvey } from '../controllers/surveys.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createSurveyValidator, respondValidator } from '../validators/surveys.js';

const router = Router();

router.post('/', authenticate, authorize('organizer', 'admin'), createSurveyValidator, validate, createSurvey);
router.get('/:eventId', authenticate, getSurvey);
router.post('/:id/respond', authenticate, respondValidator, validate, respondSurvey);
router.get('/:id/results', authenticate, authorize('organizer', 'admin'), getSurveyResults);
router.delete('/:id', authenticate, authorize('organizer', 'admin'), deleteSurvey);

export default router;
