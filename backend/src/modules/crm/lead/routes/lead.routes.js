import express from 'express';
import LeadController from '../controllers/lead.controller.js';
import validate from '../../../../middleware/validate.js';
import { authenticate, authorize } from '../../../../middleware/auth.js';
import {
  createLeadSchema,
  updateLeadSchema,
  queryLeadSchema
} from '../validators/lead.validator.js';

const router = express.Router();

// Enforce authentication across all lead endpoints
router.use(authenticate);

// List/Query leads
router.get('/', validate(queryLeadSchema), LeadController.getAll);

// Detail lookup
router.get('/:id', LeadController.getById);

// Create Lead (accessible to ADMIN, SALES)
router.post('/', authorize('ADMIN', 'SALES'), validate(createLeadSchema), LeadController.create);

// Update Lead (accessible to ADMIN, SALES)
router.put('/:id', authorize('ADMIN', 'SALES'), validate(updateLeadSchema), LeadController.update);

// Soft Delete Lead (restricted strictly to ADMIN, SALES)
router.delete('/:id', authorize('ADMIN', 'SALES'), LeadController.delete);

// Lead Conversion to Customer (accessible to ADMIN, SALES)
router.post('/:id/convert', authorize('ADMIN', 'SALES'), LeadController.convert);

export default router;
