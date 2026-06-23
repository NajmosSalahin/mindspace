import { Router } from 'express';
import {
  getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount, sendAnnouncement,
} from '../controllers/notifications.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/read-all', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);
router.get('/unread-count', authenticate, getUnreadCount);
router.post('/send-announcement', authenticate, authorize('organizer', 'admin'), sendAnnouncement);

export default router;
