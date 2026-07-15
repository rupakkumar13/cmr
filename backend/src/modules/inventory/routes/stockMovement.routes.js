import express from 'express';
import StockMovementController from '../controllers/stockMovement.controller.js';
import validate from '../../../middleware/validate.js';
import { authenticate, authorize } from '../../../middleware/auth.js';
import {
  createStockMovementSchema,
  queryStockMovementSchema
} from '../validators/stockMovement.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', validate(queryStockMovementSchema), StockMovementController.getAll);
router.post('/', authorize('ADMIN', 'INVENTORY_MANAGER', 'MANAGER'), validate(createStockMovementSchema), StockMovementController.create);

export default router;
