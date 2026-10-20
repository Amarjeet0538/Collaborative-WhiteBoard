import express from 'express';
import {
  register,
  login,
  getMe,
  oauthStart,
  oauthCallback,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  registerValidation,
  loginValidation,
} from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.get('/:provider', oauthStart);
router.get('/:provider/callback', oauthCallback);

export default router;
