import express from 'express';
import DealController from '../controllers/deal.controller.js';
import validate from '../../../../middleware/validate.js';
import { authenticate, authorize } from '../../../../middleware/auth.js';
import {
  createDealSchema,
  updateDealSchema,
  queryDealSchema
} from '../validators/deal.validator.js';

const router = express.Router();

// Enforce authentication across deal endpoints
router.use(authenticate);

router.get('/', validate(queryDealSchema), DealController.getAll);
router.get('/:id', DealController.getById);

router.post('/', authorize('ADMIN', 'SALES'), validate(createDealSchema), DealController.create);
router.put('/:id', authorize('ADMIN', 'SALES'), validate(updateDealSchema), DealController.update);
router.delete('/:id', authorize('ADMIN', 'SALES'), DealController.delete);

export default router;
