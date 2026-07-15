import express from 'express';
import InvoiceController from '../controllers/invoice.controller.js';
import validate from '../../../../middleware/validate.js';
import { authenticate, authorize } from '../../../../middleware/auth.js';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  updateStatusSchema,
  queryInvoiceSchema
} from '../validators/invoice.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', validate(queryInvoiceSchema), InvoiceController.getAll);
router.get('/:id', InvoiceController.getById);
router.post('/', authorize('ADMIN', 'MANAGER', 'SALES', 'ACCOUNTANT'), validate(createInvoiceSchema), InvoiceController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER', 'ACCOUNTANT'), validate(updateInvoiceSchema), InvoiceController.update);
router.patch('/:id/status', authorize('ADMIN', 'MANAGER', 'ACCOUNTANT'), validate(updateStatusSchema), InvoiceController.updateStatus);
router.post('/convert', authorize('ADMIN', 'MANAGER', 'SALES', 'ACCOUNTANT'), InvoiceController.convertQuote);

export default router;
