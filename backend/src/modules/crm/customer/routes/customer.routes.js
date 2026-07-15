import express from 'express';
import CustomerController from '../controllers/customer.controller.js';
import validate from '../../../../middleware/validate.js';
import { authenticate, authorize } from '../../../../middleware/auth.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
  queryCustomerSchema
} from '../validators/customer.validator.js';

const router = express.Router();

// Apply session authentication to all customer endpoints
router.use(authenticate);

// List/Query Routes
router.get('/', validate(queryCustomerSchema), CustomerController.getAll);

// IMPORTANT: Register /search BEFORE /:id to prevent routing collisions
router.get('/search', validate(queryCustomerSchema), CustomerController.search);

// Detail lookup route
router.get('/:id', CustomerController.getById);

// Create route (accessible to ADMIN, SALES)
router.post('/', authorize('ADMIN', 'SALES'), validate(createCustomerSchema), CustomerController.create);

// Update route (accessible to ADMIN, SALES)
router.put('/:id', authorize('ADMIN', 'SALES'), validate(updateCustomerSchema), CustomerController.update);

// Soft Delete route (accessible strictly to ADMIN, SALES)
router.delete('/:id', authorize('ADMIN', 'SALES'), CustomerController.delete);

export default router;
