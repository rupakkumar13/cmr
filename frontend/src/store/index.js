import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/slices/authSlice.js';
import hrReducer from './hrSlice.js';
import crmReducer from './crmSlice.js';
import inventoryReducer from './inventorySlice.js';
import billingReducer from './billingSlice.js';
import dashboardReducer from './dashboardSlice.js';
import reportsReducer from './reportsSlice.js';
import notificationsReducer from './notificationsSlice.js';
import settingsReducer from './settingsSlice.js';
import { injectStore } from '../services/api.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hr: hrReducer,
    crm: crmReducer,
    inventory: inventoryReducer,
    billing: billingReducer,
    dashboard: dashboardReducer,
    reports: reportsReducer,
    notifications: notificationsReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents errors with non-serializable objects (e.g. Dates)
    }),
});

// Inject store reference into api service to allow token reading and dispatching on refresh
injectStore(store);

export default store;
