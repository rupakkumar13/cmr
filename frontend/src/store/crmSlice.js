import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

// --- Leads Thunks ---
export const fetchLeads = createAsyncThunk(
  'crm/fetchLeads',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/leads', { params });
      return response.data.data.leads;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads');
    }
  }
);

export const createLead = createAsyncThunk(
  'crm/createLead',
  async (leadData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/leads', leadData);
      return response.data.data.lead;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create lead');
    }
  }
);

export const updateLead = createAsyncThunk(
  'crm/updateLead',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/leads/${id}`, data);
      return response.data.data.lead;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lead');
    }
  }
);

export const deleteLead = createAsyncThunk(
  'crm/deleteLead',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/leads/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete lead');
    }
  }
);

export const convertLead = createAsyncThunk(
  'crm/convertLead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/leads/${id}/convert`, {});
      return response.data.data.customer;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to convert lead');
    }
  }
);

// --- Customers Thunks ---
export const fetchCustomers = createAsyncThunk(
  'crm/fetchCustomers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/customers', { params });
      return response.data.data.customers;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'crm/createCustomer',
  async (custData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/customers', custData);
      return response.data.data.customer;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to register customer');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'crm/fetchCustomerById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/customers/${id}`);
      return response.data.data.customer;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer profile');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'crm/updateCustomer',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/customers/${id}`, data);
      return response.data.data.customer;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'crm/deleteCustomer',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/customers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete customer');
    }
  }
);

// --- Deals Thunks ---
export const fetchDeals = createAsyncThunk(
  'crm/fetchDeals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/deals', { params });
      return response.data.data.deals;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deals');
    }
  }
);

export const createDeal = createAsyncThunk(
  'crm/createDeal',
  async (dealData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/deals', dealData);
      return response.data.data.deal;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create deal');
    }
  }
);

export const updateDeal = createAsyncThunk(
  'crm/updateDeal',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/deals/${id}`, data);
      return response.data.data.deal;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update deal');
    }
  }
);

export const deleteDeal = createAsyncThunk(
  'crm/deleteDeal',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/deals/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete deal');
    }
  }
);

// --- Meetings Thunks ---
export const fetchMeetings = createAsyncThunk(
  'crm/fetchMeetings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/meetings', { params });
      return response.data.data.meetings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meetings');
    }
  }
);

export const createMeeting = createAsyncThunk(
  'crm/createMeeting',
  async (meetData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/meetings', meetData);
      return response.data.data.meeting;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to schedule meeting');
    }
  }
);

export const updateMeeting = createAsyncThunk(
  'crm/updateMeeting',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/meetings/${id}`, data);
      return response.data.data.meeting;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update meeting');
    }
  }
);

export const deleteMeeting = createAsyncThunk(
  'crm/deleteMeeting',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/meetings/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel meeting');
    }
  }
);

// --- Follow Ups Thunks ---
export const fetchFollowUps = createAsyncThunk(
  'crm/fetchFollowUps',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/followups', { params });
      return response.data.data.followUps;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch follow-ups');
    }
  }
);

export const createFollowUp = createAsyncThunk(
  'crm/createFollowUp',
  async (followData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/followups', followData);
      return response.data.data.followUp;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create follow-up task');
    }
  }
);

export const updateFollowUp = createAsyncThunk(
  'crm/updateFollowUp',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/followups/${id}`, data);
      return response.data.data.followUp;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update follow-up');
    }
  }
);

export const deleteFollowUp = createAsyncThunk(
  'crm/deleteFollowUp',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/followups/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete follow-up task');
    }
  }
);

// --- Activity Logs Thunk ---
export const fetchActivities = createAsyncThunk(
  'crm/fetchActivities',
  async (entityId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/activities/entity/${entityId}`);
      return response.data.data.logs;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity logs');
    }
  }
);

const initialState = {
  leads: [],
  customers: [],
  selectedCustomer: null,
  deals: [],
  meetings: [],
  followups: [],
  activities: [],
  loading: false,
  error: null,
};

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    clearCRMError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled results mappings
      // Leads
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads.unshift(action.payload);
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.leads.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = state.leads.filter(l => l._id !== action.payload);
      })
      .addCase(convertLead.fulfilled, (state, action) => {
        state.loading = false;
        // Mark lead as converted in list
        const index = state.leads.findIndex(l => l.convertedCustomer === action.payload._id || l.email === action.payload.email);
        if (index !== -1) {
          state.leads[index].convertedToCustomer = true;
          state.leads[index].status = 'QUALIFIED';
        }
        state.customers.unshift(action.payload);
      })

      // Customers
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload);
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedCustomer && state.selectedCustomer._id === action.payload._id) {
          state.selectedCustomer = action.payload;
        }
        const index = state.customers.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(c => c._id !== action.payload);
      })

      // Deals
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.deals = action.payload;
      })
      .addCase(createDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.deals.push(action.payload);
      })
      .addCase(updateDeal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.deals.findIndex(d => d._id === action.payload._id);
        if (index !== -1) {
          state.deals[index] = action.payload;
        }
      })
      .addCase(deleteDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.deals = state.deals.filter(d => d._id !== action.payload);
      })

      // Meetings
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings.push(action.payload);
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.meetings.findIndex(m => m._id === action.payload._id);
        if (index !== -1) {
          state.meetings[index] = action.payload;
        }
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = state.meetings.filter(m => m._id !== action.payload);
      })

      // Follow Ups
      .addCase(fetchFollowUps.fulfilled, (state, action) => {
        state.loading = false;
        state.followups = action.payload;
      })
      .addCase(createFollowUp.fulfilled, (state, action) => {
        state.loading = false;
        state.followups.push(action.payload);
      })
      .addCase(updateFollowUp.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.followups.findIndex(f => f._id === action.payload._id);
        if (index !== -1) {
          state.followups[index] = action.payload;
        }
      })
      .addCase(deleteFollowUp.fulfilled, (state, action) => {
        state.loading = false;
        state.followups = state.followups.filter(f => f._id !== action.payload);
      })

      // Activity logs
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })

      // General async pending & rejected state handlers at the end (builder constraint resolved!)
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

export const { clearCRMError } = crmSlice.actions;
export default crmSlice.reducer;
