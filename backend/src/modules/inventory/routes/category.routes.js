import express from 'express';
import CategoryController from '../controllers/category.controller.js';
import validate from '../../../middleware/validate.js';
import { authenticate, authorize } from '../../../middleware/auth.js';
import {
  createCategorySchema,
  updateCategorySchema,
  queryCategorySchema
} from '../validators/category.validator.js';

const router = express.Router();

// Enforce auth across endpoints
router.use(authenticate);

router.get('/', validate(queryCategorySchema), CategoryController.getAll);
router.get('/:id', CategoryController.getById);

router.post('/', authorize('ADMIN', 'INVENTORY_MANAGER', 'MANAGER'), validate(createCategorySchema), CategoryController.create);
router.put('/:id', authorize('ADMIN', 'INVENTORY_MANAGER', 'MANAGER'), validate(updateCategorySchema), CategoryController.update);
router.delete('/:id', authorize('ADMIN', 'INVENTORY_MANAGER', 'MANAGER'), CategoryController.delete);

export default router;
