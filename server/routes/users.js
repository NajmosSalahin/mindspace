import { Router } from 'express';
import {
  getProfile, updateProfile, getUserProfile, followUser, unfollowUser,
  addFavorite, removeFavorite, getFavorites, getUserEvents, requestOrganizer,
} from '../controllers/users.js';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, upload.single('profileImage'), updateProfile);
router.get('/favorites', authenticate, getFavorites);
router.get('/:id/profile', getUserProfile);
router.post('/:id/follow', authenticate, followUser);
router.delete('/:id/unfollow', authenticate, unfollowUser);
router.post('/favorites/:eventId', authenticate, addFavorite);
router.delete('/favorites/:eventId', authenticate, removeFavorite);
router.get('/:id/events', getUserEvents);
router.post('/request-organizer', authenticate, requestOrganizer);

export default router;
