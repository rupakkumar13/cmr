import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import validate from '../../../middleware/validate.js';
import { authenticate } from '../../../middleware/auth.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);

// Protected routes
router.get('/me', authenticate, AuthController.getMe);

export default router;
