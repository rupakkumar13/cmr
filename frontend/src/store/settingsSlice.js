import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

export const fetchCompanySettings = createAsyncThunk(
  'settings/fetchCompany',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/settings/company');
      return response.data.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch company settings');
    }
  }
);

export const updateCompanySettings = createAsyncThunk(
  'settings/updateCompany',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/v1/settings/company', settingsData);
      return response.data.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update company settings');
    }
  }
);

export const fetchSystemPreferences = createAsyncThunk(
  'settings/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/settings/preferences');
      return response.data.data.preferences;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system preferences');
    }
  }
);

export const updateSystemPreferences = createAsyncThunk(
  'settings/updatePreferences',
  async (prefsData, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/v1/settings/preferences', prefsData);
      return response.data.data.preferences;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update system preferences');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'settings/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/v1/settings/profile', profileData);
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'settings/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      await api.put('/api/v1/settings/change-password', { currentPassword, newPassword });
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

const initialState = {
  company: null,
  preferences: null,
  loading: false,
  error: null,
  successMessage: null
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsMessages(state) {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanySettings.fulfilled, (state, action) => {
        state.loading = false;
        state.company = action.payload;
      })
      .addCase(updateCompanySettings.fulfilled, (state, action) => {
        state.loading = false;
        state.company = action.payload;
        state.successMessage = 'Company settings updated successfully';
      })
      .addCase(fetchSystemPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(updateSystemPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
        state.successMessage = 'System preferences updated successfully';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Profile credentials updated successfully';
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Password updated successfully';
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
          state.successMessage = null;
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

export const { clearSettingsMessages } = settingsSlice.actions;
export default settingsSlice.reducer;
