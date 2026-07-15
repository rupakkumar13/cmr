import express from 'express';
import QuotationController from '../controllers/quotation.controller.js';
import validate from '../../../../middleware/validate.js';
import { authenticate, authorize } from '../../../../middleware/auth.js';
import {
  createQuotationSchema,
  updateQuotationSchema,
  queryQuotationSchema,
  updateStatusSchema
} from '../validators/quotation.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', validate(queryQuotationSchema), QuotationController.getAll);
router.get('/:id', QuotationController.getById);

router.post('/', authorize('ADMIN', 'MANAGER', 'ACCOUNTANT', 'SALES'), validate(createQuotationSchema), QuotationController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER', 'ACCOUNTANT', 'SALES'), validate(updateQuotationSchema), QuotationController.update);
router.patch('/:id/status', authorize('ADMIN', 'MANAGER', 'ACCOUNTANT', 'SALES'), validate(updateStatusSchema), QuotationController.updateStatus);
router.delete('/:id', authorize('ADMIN', 'MANAGER', 'ACCOUNTANT', 'SALES'), QuotationController.delete);

export default router;
