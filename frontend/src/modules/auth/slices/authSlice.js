import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../services/api.js';

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/auth/login', credentials);
      return response.data.data; // contains accessToken, user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed.'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/api/v1/auth/logout', {});
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed.');
    }
  }
);

export const checkCurrentUser = createAsyncThunk(
  'auth/checkCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // First try to refresh the token to get a fresh access token
      const refreshResponse = await api.post('/api/v1/auth/refresh-token', {});
      const accessToken = refreshResponse.data.data.accessToken;
      
      // With the new token, load current user details
      const userResponse = await api.get('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      return {
        token: accessToken,
        user: userResponse.data.data.user
      };
    } catch (error) {
      return rejectWithValue(null);
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isCheckingAuth: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    refreshTokenSuccess(state, action) {
      state.token = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isCheckingAuth = false;
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      
      // Check Current User session
      .addCase(checkCurrentUser.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isCheckingAuth = false;
      })
      .addCase(checkCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isCheckingAuth = false;
      });
  },
});

export const { refreshTokenSuccess, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
