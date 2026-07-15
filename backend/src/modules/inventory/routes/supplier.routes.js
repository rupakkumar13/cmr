import express from 'express';
import SupplierController from '../controllers/supplier.controller.js';
import validate from '../../../middleware/validate.js';
import { authenticate, authorize } from '../../../middleware/auth.js';
import {
  createSupplierSchema,
  updateSupplierSchema,
  querySupplierSchema
} from '../validators/supplier.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', validate(querySupplierSchema), SupplierController.getAll);
router.get('/:id', SupplierController.getById);
router.post('/', authorize('ADMIN', 'INVENTORY_MANAGER', 'MANAGER'), validate(createSupplierSchema), SupplierController.create);
router.put('/:id', authorize('ADMIN', 'INVENTORY_MANAGER', 'MANAGER'), validate(updateSupplierSchema), SupplierController.update);
router.delete('/:id', authorize('ADMIN', 'INVENTORY_MANAGER', 'MANAGER'), SupplierController.delete);

export default router;
