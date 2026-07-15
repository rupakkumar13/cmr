import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

export const fetchReportData = createAsyncThunk(
  'reports/fetchData',
  async ({ reportType, params }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/reports/${reportType}`, { params });
      return {
        reportType,
        data: response.data.data,
        summary: response.data.summary || null,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `Failed to fetch ${reportType} report`);
    }
  }
);

const initialState = {
  reportType: 'sales',
  data: [],
  summary: null,
  total: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReportType(state, action) {
      state.reportType = action.payload;
      state.data = [];
      state.summary = null;
      state.total = 0;
      state.totalPages = 1;
      state.currentPage = 1;
      state.error = null;
    },
    clearReportsError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.summary = action.payload.summary;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setReportType, clearReportsError } = reportsSlice.actions;
export default reportsSlice.reducer;
