import { Router } from 'express';
import {
  getAdminStats, getUsers, updateUser, deleteUser, getAllEvents, deleteAnyEvent,
  featureEvent, getRevenue, getReports, approveOrganizer, createCategory,
  getCategories, updateCategory, deleteCategory,
} from '../controllers/admin.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createCategoryValidator, approveOrganizerValidator } from '../validators/admin.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/events', getAllEvents);
router.delete('/events/:id', deleteAnyEvent);
router.post('/feature-event/:id', featureEvent);
router.get('/revenue', getRevenue);
router.get('/reports', getReports);
router.patch('/approve-organizer', approveOrganizerValidator, validate, approveOrganizer);
router.post('/categories', createCategoryValidator, validate, createCategory);
router.get('/categories', getCategories);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
