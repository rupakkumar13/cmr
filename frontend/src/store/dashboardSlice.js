import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/dashboard/summary');
      return response.data.data.summary;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard summary');
    }
  }
);

export const fetchDashboardCharts = createAsyncThunk(
  'dashboard/fetchCharts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/dashboard/charts');
      return response.data.data.charts;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard charts');
    }
  }
);

export const fetchDashboardActivities = createAsyncThunk(
  'dashboard/fetchActivities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/dashboard/recent-activities');
      return response.data.data.activities;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent activities');
    }
  }
);

const initialState = {
  summary: null,
  charts: null,
  activities: null,
  loading: false,
  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchDashboardCharts.fulfilled, (state, action) => {
        state.loading = false;
        state.charts = action.payload;
      })
      .addCase(fetchDashboardActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
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

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
