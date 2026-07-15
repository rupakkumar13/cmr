import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

// async thunks - Departments
export const fetchDepartments = createAsyncThunk(
  'hr/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/hr/departments');
      return response.data.data.departments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
    }
  }
);

export const createDepartment = createAsyncThunk(
  'hr/createDepartment',
  async (deptData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/hr/departments', deptData);
      return response.data.data.department;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create department');
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'hr/deleteDepartment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/hr/departments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete department');
    }
  }
);

// async thunks - Employees
export const fetchEmployees = createAsyncThunk(
  'hr/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/hr/employees', { params });
      return response.data.data.employees;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'hr/createEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/hr/employees', employeeData);
      return response.data.data.employee;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to onboard employee');
    }
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'hr/fetchEmployeeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/hr/employees/${id}`);
      return response.data.data.employee;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee details');
    }
  }
);

// async thunks - Attendance
export const clockIn = createAsyncThunk(
  'hr/clockIn',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/hr/attendance/clock-in', {});
      return response.data.data.attendance;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clock in');
    }
  }
);

export const clockOut = createAsyncThunk(
  'hr/clockOut',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/hr/attendance/clock-out', {});
      return response.data.data.attendance;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clock out');
    }
  }
);

export const fetchMyAttendance = createAsyncThunk(
  'hr/fetchMyAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/hr/attendance/my-attendance');
      return response.data.data.logs;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance logs');
    }
  }
);

// async thunks - Leaves
export const fetchLeaves = createAsyncThunk(
  'hr/fetchLeaves',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/hr/leaves', { params });
      return response.data.data.leaves;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leave requests');
    }
  }
);

export const fetchMyLeaves = createAsyncThunk(
  'hr/fetchMyLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/hr/leaves/my-leaves');
      return response.data.data.leaves;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my leave requests');
    }
  }
);

export const applyLeave = createAsyncThunk(
  'hr/applyLeave',
  async (leaveData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/hr/leaves', leaveData);
      return response.data.data.leave;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit leave request');
    }
  }
);

export const reviewLeave = createAsyncThunk(
  'hr/reviewLeave',
  async ({ id, status, comments }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/hr/leaves/${id}/status`, { status, comments });
      return response.data.data.leave;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update leave status');
    }
  }
);

// async thunks - Payroll
export const fetchPayrolls = createAsyncThunk(
  'hr/fetchPayrolls',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/hr/payroll', { params });
      return response.data.data.payslips;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payroll statements');
    }
  }
);

export const fetchMyPayroll = createAsyncThunk(
  'hr/fetchMyPayroll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/hr/payroll/my-payroll');
      return response.data.data.payslips;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payslips');
    }
  }
);

export const generatePayroll = createAsyncThunk(
  'hr/generatePayroll',
  async (payrollData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/hr/payroll', payrollData);
      return response.data.data.payroll;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate payroll statement');
    }
  }
);

export const markPayrollAsPaid = createAsyncThunk(
  'hr/markPayrollAsPaid',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/hr/payroll/${id}/pay`, {});
      return response.data.data.payroll;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payroll status');
    }
  }
);

const initialState = {
  departments: [],
  employees: [],
  selectedEmployee: null,
  attendanceLogs: [],
  leaves: [],
  myLeaves: [],
  payrollStatements: [],
  myPayroll: [],
  loading: false,
  error: null,
};

const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    clearHRError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled results mappings
      // Departments
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.departments.push(action.payload);
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = state.departments.filter(dept => dept._id !== action.payload);
      })
      
      // Employees
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEmployee = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.push(action.payload);
      })
      
      // Attendance
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceLogs = action.payload;
      })
      .addCase(clockIn.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceLogs.unshift(action.payload);
      })
      .addCase(clockOut.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.attendanceLogs.findIndex(log => log._id === action.payload._id);
        if (index !== -1) {
          state.attendanceLogs[index] = action.payload;
        }
      })
      
      // Leaves
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload;
      })
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves = action.payload;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves.unshift(action.payload);
      })
      .addCase(reviewLeave.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.leaves.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
      })
      
      // Payroll
      .addCase(fetchPayrolls.fulfilled, (state, action) => {
        state.loading = false;
        state.payrollStatements = action.payload;
      })
      .addCase(fetchMyPayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.myPayroll = action.payload;
      })
      .addCase(generatePayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.payrollStatements.push(action.payload);
      })
      .addCase(markPayrollAsPaid.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payrollStatements.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.payrollStatements[index] = action.payload;
        }
      })
      
      // Async state handlers (general loading/error mapping) - MUST BE AT THE END
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

export const { clearHRError } = hrSlice.actions;
export default hrSlice.reducer;
