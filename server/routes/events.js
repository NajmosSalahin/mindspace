import { Router } from 'express';
import {
  createEvent, getEvents, getEventById, updateEvent, deleteEvent,
  getTrendingEvents, getFeaturedEvents, getEventSessions, getEventSpeakers,
  getEventReviews, toggleWishlist, getEventsByCategory, updateEventStatus,
  getEventAttendees, getEventAnalytics,
} from '../controllers/events.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { createEventValidator, updateEventValidator } from '../validators/events.js';

const router = Router();

router.get('/trending', getTrendingEvents);
router.get('/featured', getFeaturedEvents);
router.get('/category/:slug', getEventsByCategory);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authenticate, authorize('organizer', 'admin'), upload.fields([{ name: 'banner', maxCount: 1 }, { name: 'images', maxCount: 10 }]), createEventValidator, validate, createEvent);
router.patch('/:id', authenticate, authorize('organizer', 'admin'), upload.fields([{ name: 'banner', maxCount: 1 }]), updateEventValidator, validate, updateEvent);
router.delete('/:id', authenticate, authorize('organizer', 'admin'), deleteEvent);
router.get('/:id/sessions', getEventSessions);
router.get('/:id/speakers', getEventSpeakers);
router.get('/:id/reviews', getEventReviews);
router.post('/:id/toggle-wishlist', authenticate, toggleWishlist);
router.patch('/:id/status', authenticate, authorize('organizer', 'admin'), updateEventStatus);
router.get('/:id/attendees', authenticate, authorize('organizer', 'admin'), getEventAttendees);
router.get('/:id/analytics', authenticate, authorize('organizer', 'admin'), getEventAnalytics);

export default router;
