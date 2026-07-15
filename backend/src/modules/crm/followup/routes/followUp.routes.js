import express from 'express';
import FollowUpController from '../controllers/followUp.controller.js';
import validate from '../../../../middleware/validate.js';
import { authenticate, authorize } from '../../../../middleware/auth.js';
import {
  createFollowUpSchema,
  updateFollowUpSchema,
  queryFollowUpSchema
} from '../validators/followUp.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', validate(queryFollowUpSchema), FollowUpController.getAll);
router.get('/:id', FollowUpController.getById);

router.post('/', authorize('ADMIN', 'HR', 'MANAGER', 'SALES'), validate(createFollowUpSchema), FollowUpController.create);
router.put('/:id', authorize('ADMIN', 'HR', 'MANAGER', 'SALES', 'EMPLOYEE'), validate(updateFollowUpSchema), FollowUpController.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), FollowUpController.delete);

export default router;
