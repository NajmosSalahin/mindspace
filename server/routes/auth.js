import { Router } from 'express';
import { register, login, logout, refreshToken, verifyEmail, forgotPassword, resetPassword, changePassword, googleAuth } from '../controllers/auth.js';
import { authenticate } from '../middleware/authenticate.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { registerValidator, loginValidator, verifyEmailValidator, forgotPasswordValidator, resetPasswordValidator, changePasswordValidator } from '../validators/auth.js';

const router = Router();

router.post('/register', authRateLimiter, registerValidator, validate, register);
router.post('/login', authRateLimiter, loginValidator, validate, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyEmailValidator, validate, verifyEmail);
router.post('/forgot-password', authRateLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', authRateLimiter, resetPasswordValidator, validate, resetPassword);
router.post('/change-password', authenticate, changePasswordValidator, validate, changePassword);
router.post('/google', googleAuth);

export default router;
