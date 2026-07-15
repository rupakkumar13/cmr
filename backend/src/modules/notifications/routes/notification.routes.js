import express from 'express';
import NotificationController from '../controllers/notification.controller.js';
import { authenticate } from '../../../middleware/auth.js';

const router = express.Router();

// Enforce auth across notifications router
router.use(authenticate);

router.get('/', NotificationController.getAll);
router.post('/', NotificationController.create);
router.patch('/read-all', NotificationController.markAllRead);
router.patch('/:id/read', NotificationController.markRead);
router.delete('/:id', NotificationController.delete);

export default router;
