import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

// --- Quotations Thunks ---
export const fetchQuotations = createAsyncThunk(
  'billing/fetchQuotations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/quotations', { params });
      return response.data.data.quotations;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quotations');
    }
  }
);

export const createQuotation = createAsyncThunk(
  'billing/createQuotation',
  async (quoteData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/quotations', quoteData);
      return response.data.data.quotation;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create quotation');
    }
  }
);

export const updateQuotation = createAsyncThunk(
  'billing/updateQuotation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/quotations/${id}`, data);
      return response.data.data.quotation;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quotation');
    }
  }
);

export const updateQuotationStatus = createAsyncThunk(
  'billing/updateQuotationStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/quotations/${id}/status`, { status });
      return response.data.data.quotation;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const deleteQuotation = createAsyncThunk(
  'billing/deleteQuotation',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/quotations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete quotation');
    }
  }
);

// --- Invoices Thunks ---
export const fetchInvoices = createAsyncThunk(
  'billing/fetchInvoices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/invoices', { params });
      return response.data.data.invoices;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
    }
  }
);

export const createInvoice = createAsyncThunk(
  'billing/createInvoice',
  async (invData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/invoices', invData);
      return response.data.data.invoice;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create invoice');
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'billing/updateInvoice',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/invoices/${id}`, data);
      return response.data.data.invoice;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice');
    }
  }
);

export const updateInvoiceStatus = createAsyncThunk(
  'billing/updateInvoiceStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/invoices/${id}/status`, { status });
      return response.data.data.invoice;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice status');
    }
  }
);

export const convertQuotation = createAsyncThunk(
  'billing/convertQuotation',
  async (quotationId, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/invoices/convert', { quotationId });
      return response.data.data.invoice;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to convert quotation');
    }
  }
);

// --- Payments Thunks ---
export const fetchPayments = createAsyncThunk(
  'billing/fetchPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/payments', { params });
      return response.data.data.payments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment collections');
    }
  }
);

export const createPayment = createAsyncThunk(
  'billing/createPayment',
  async (payData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/payments', payData);
      return response.data.data.payment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record payment');
    }
  }
);

const initialState = {
  quotations: [],
  invoices: [],
  payments: [],
  loading: false,
  error: null,
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearBillingError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Quotations
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.loading = false;
        state.quotations = action.payload;
      })
      .addCase(createQuotation.fulfilled, (state, action) => {
        state.loading = false;
        state.quotations.unshift(action.payload);
      })
      .addCase(updateQuotation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.quotations.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.quotations[index] = action.payload;
        }
      })
      .addCase(updateQuotationStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.quotations.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.quotations[index] = action.payload;
        }
      })
      .addCase(deleteQuotation.fulfilled, (state, action) => {
        state.loading = false;
        state.quotations = state.quotations.filter(q => q._id !== action.payload);
      })

      // Invoices
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices.unshift(action.payload);
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(updateInvoiceStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(convertQuotation.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices.unshift(action.payload);
      })

      // Payments
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.unshift(action.payload);
      })

      // General async handlers
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { clearBillingError } = billingSlice.actions;
export default billingSlice.reducer;
