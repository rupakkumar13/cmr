import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/notifications');
      return response.data.data.notifications;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/notifications/${id}/read`);
      return response.data.data.notification;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.patch('/api/v1/notifications/read-all');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/notifications/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addRealtimeNotification(state, action) {
      // Avoid adding duplicate real-time notifies if they exist
      const exists = state.notifications.some(n => n._id === action.payload._id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      }
    },
    clearNotificationsError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.notifications.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          // If the status has changed from unread to read, decrement count
          if (!state.notifications[index].isRead) {
            state.unreadCount = Math.max(state.unreadCount - 1, 0);
          }
          state.notifications[index] = action.payload;
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        const target = state.notifications.find(n => n._id === action.payload);
        if (target && !target.isRead) {
          state.unreadCount = Math.max(state.unreadCount - 1, 0);
        }
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
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

export const { addRealtimeNotification, clearNotificationsError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
