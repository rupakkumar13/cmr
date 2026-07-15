import express from 'express';
import DashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../../../middleware/auth.js';

const router = express.Router();

// Enforce auth across dashboard APIs
router.use(authenticate);

router.get('/summary', DashboardController.getSummary);
router.get('/charts', DashboardController.getCharts);
router.get('/recent-activities', DashboardController.getRecentActivities);
router.get('/revenue', DashboardController.getRevenue);
router.get('/hr', DashboardController.getHR);
router.get('/crm', DashboardController.getCRM);
router.get('/inventory', DashboardController.getInventory);
router.get('/billing', DashboardController.getBilling);

export default router;
