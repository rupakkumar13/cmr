import express from 'express';
import MeetingController from '../controllers/meeting.controller.js';
import validate from '../../../../middleware/validate.js';
import { authenticate, authorize } from '../../../../middleware/auth.js';
import {
  createMeetingSchema,
  updateMeetingSchema,
  queryMeetingSchema
} from '../validators/meeting.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', validate(queryMeetingSchema), MeetingController.getAll);
router.get('/:id', MeetingController.getById);

router.post('/', authorize('ADMIN', 'HR', 'MANAGER', 'SALES'), validate(createMeetingSchema), MeetingController.create);
router.put('/:id', authorize('ADMIN', 'HR', 'MANAGER', 'SALES'), validate(updateMeetingSchema), MeetingController.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), MeetingController.delete);

export default router;
