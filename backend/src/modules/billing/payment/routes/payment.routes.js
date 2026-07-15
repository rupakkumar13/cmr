import express from 'express';
import PaymentController from '../controllers/payment.controller.js';
import validate from '../../../../middleware/validate.js';
import { authenticate, authorize } from '../../../../middleware/auth.js';
import {
  createPaymentSchema,
  queryPaymentSchema
} from '../validators/payment.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', validate(queryPaymentSchema), PaymentController.getAll);
router.get('/:id', PaymentController.getById);
router.post('/', authorize('ADMIN', 'MANAGER', 'SALES', 'ACCOUNTANT'), validate(createPaymentSchema), PaymentController.create);
router.put('/:id/status', authorize('ADMIN', 'MANAGER', 'ACCOUNTANT'), PaymentController.updateStatus);

export default router;
