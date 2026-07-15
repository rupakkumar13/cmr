import express from 'express';
import ReportsController from '../controllers/reports.controller.js';
import { authenticate } from '../../../middleware/auth.js';

const router = express.Router();

// Enforce auth across report routes
router.use(authenticate);

router.get('/sales', ReportsController.getSales);
router.get('/revenue', ReportsController.getRevenue);
router.get('/customers', ReportsController.getCustomers);
router.get('/employees', ReportsController.getEmployees);
router.get('/inventory', ReportsController.getInventory);
router.get('/invoices', ReportsController.getInvoices);
router.get('/payments', ReportsController.getPayments);
router.get('/payroll', ReportsController.getPayroll);

export default router;
