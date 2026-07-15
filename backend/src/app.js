import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';
import AppError from './utils/appError.js';
import authRouter from './modules/auth/routes/auth.routes.js';
import hrRouter from './modules/hr/routes/hr.routes.js';
import customerRouter from './modules/crm/customer/routes/customer.routes.js';
import leadRouter from './modules/crm/lead/routes/lead.routes.js';
import dealRouter from './modules/crm/deal/routes/deal.routes.js';
import meetingRouter from './modules/crm/meeting/routes/meeting.routes.js';
import followUpRouter from './modules/crm/followup/routes/followUp.routes.js';
import activityRouter from './modules/crm/activity/routes/activityLog.routes.js';
import categoryRouter from './modules/inventory/routes/category.routes.js';
import productRouter from './modules/inventory/routes/product.routes.js';
import supplierRouter from './modules/inventory/routes/supplier.routes.js';
import stockMovementRouter from './modules/inventory/routes/stockMovement.routes.js';
import purchaseOrderRouter from './modules/inventory/routes/purchaseOrder.routes.js';
import quotationRouter from './modules/billing/quotation/routes/quotation.routes.js';
import invoiceRouter from './modules/billing/invoice/routes/invoice.routes.js';
import paymentRouter from './modules/billing/payment/routes/payment.routes.js';
import dashboardRouter from './modules/dashboard/routes/dashboard.routes.js';
import reportsRouter from './modules/reports/routes/reports.routes.js';
import notificationsRouter from './modules/notifications/routes/notification.routes.js';
import settingsRouter from './modules/settings/routes/settings.routes.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://cmr-lilac-sigma.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/hr', hrRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/leads', leadRouter);
app.use('/api/v1/deals', dealRouter);
app.use('/api/v1/meetings', meetingRouter);
app.use('/api/v1/followups', followUpRouter);
app.use('/api/v1/activities', activityRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/suppliers', supplierRouter);
app.use('/api/v1/stock-movements', stockMovementRouter);
app.use('/api/v1/purchase-orders', purchaseOrderRouter);
app.use('/api/v1/quotations', quotationRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/reports', reportsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/settings', settingsRouter);

// Undefined routes handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Central Error Handler
app.use(errorHandler);

export default app;
