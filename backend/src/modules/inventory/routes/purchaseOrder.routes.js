import express from 'express';
import PurchaseOrderController from '../controllers/purchaseOrder.controller.js';
import validate from '../../../middleware/validate.js';
import { authenticate, authorize } from '../../../middleware/auth.js';
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderStatusSchema,
  queryPurchaseOrderSchema
} from '../validators/purchaseOrder.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', validate(queryPurchaseOrderSchema), PurchaseOrderController.getAll);
router.get('/:id', PurchaseOrderController.getById);
router.post('/', authorize('ADMIN', 'INVENTORY_MANAGER', 'MANAGER'), validate(createPurchaseOrderSchema), PurchaseOrderController.create);
router.patch('/:id/status', authorize('ADMIN', 'INVENTORY_MANAGER', 'MANAGER'), validate(updatePurchaseOrderStatusSchema), PurchaseOrderController.updateStatus);

export default router;
