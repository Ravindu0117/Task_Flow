import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, me } from '../controllers/auth.controller';
import { validate, registerSchema, loginSchema } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many login attempts. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  skipFailedRequests: true,
  message: { error: 'Too many registration attempts. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many refresh attempts.' },
});

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;
