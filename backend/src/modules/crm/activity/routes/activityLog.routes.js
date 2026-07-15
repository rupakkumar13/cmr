import express from 'express';
import ActivityLogController from '../controllers/activityLog.controller.js';
import { authenticate } from '../../../../middleware/auth.js';

const router = express.Router();

// Enforce authentication across activity endpoints
router.use(authenticate);

router.get('/', ActivityLogController.getAll);
router.get('/entity/:entityId', ActivityLogController.getByEntity);

export default router;
