import express from 'express';
import ProductController from '../controllers/product.controller.js';
import validate from '../../../middleware/validate.js';
import { authenticate, authorize } from '../../../middleware/auth.js';
import {
  createProductSchema,
  updateProductSchema,
  queryProductSchema
} from '../validators/product.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', validate(queryProductSchema), ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', authorize('ADMIN', 'INVENTORY_MANAGER', 'MANAGER'), validate(createProductSchema), ProductController.create);
router.put('/:id', authorize('ADMIN', 'INVENTORY_MANAGER', 'MANAGER'), validate(updateProductSchema), ProductController.update);
router.delete('/:id', authorize('ADMIN', 'INVENTORY_MANAGER', 'MANAGER'), ProductController.delete);

export default router;
