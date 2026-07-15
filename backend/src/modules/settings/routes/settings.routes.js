import express from 'express';
import SettingsController from '../controllers/settings.controller.js';
import { authenticate, authorize } from '../../../middleware/auth.js';

const router = express.Router();

// Enforce auth across settings
router.use(authenticate);

router.get('/company', SettingsController.getCompany);
router.put('/company', authorize('ADMIN'), SettingsController.updateCompany);

router.get('/preferences', SettingsController.getPreferences);
router.put('/preferences', authorize('ADMIN'), SettingsController.updatePreferences);

router.put('/profile', SettingsController.updateProfile);
router.put('/change-password', SettingsController.changePassword);

export default router;
