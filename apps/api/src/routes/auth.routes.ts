import { Router } from 'express';
import { login, refresh, logout, changePassword, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/change-password', authenticate, changePassword);
router.patch('/profile', authenticate, updateProfile);

export default router;
