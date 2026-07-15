import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees, fetchDepartments, createEmployee } from '../../../store/hrSlice.js';
import { Loader2, Plus, Search, Filter, ShieldCheck, Mail, Calendar, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../../services/api.js';

const EmployeeList = ({ onViewDetails, searchQuery }) => {
  const dispatch = useDispatch();
  const { employees, departments, loading, error } = useSelector((state) => state.hr);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [usersWithoutProfile, setUsersWithoutProfile] = useState([]);
  const [onboardError, setOnboardError] = useState(null);

  useEffect(() => {
    if (searchQuery === undefined) return;
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchQuery);
      dispatch(fetchEmployees({ search: searchQuery, department: selectedDept, status: selectedStatus }));
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, dispatch, selectedDept, selectedStatus]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Load registered users without employee profiles when modal is opened
  const handleOpenOnboard = async () => {
    setOnboardError(null);
    try {
      // Find all users in system
      const res = await api.get('/api/v1/hr/employees');
      const allProfiles = res.data.data.employees;
      
      // Let's get raw users from auth router. Wait, we can fetch all users from backend to let admin select one.
      // For now, let's create a quick API fetch or mock users, or register allows creating.
      // Let's fetch all users from database (we can fetch via user list if we build it, or we can fetch list of users by hit to GET /api/v1/auth/register or similar).
      // Wait, let's look at `User.js`. We can query regular users.
      // For simplicity, let's fetch all profiles. To onboard a new employee, we can link them to any user.
      // Let's call a query or write a quick endpoint, but we don't have user list endpoint.
      // We can create a simple text input for `user` (User ObjectId) in the onboarding modal, which is highly robust and flexible, or let them input name/email and we create both!
      // In our design schema, createEmployee accepts `user` (User ObjectId). Let's fetch users. We can add a helper query or text inputs. Text inputs are fine, but let's let them select from users.
      // Wait! How do we get users? We can create an API query in backend for User List or query `/api/v1/auth` if authorized.
      // Let's write a simple helper fetch in employee service that retrieves users.
      // Wait, we can get list of all users by query of `User.find()`. We can create a route `GET /api/v1/auth/users` inside `auth.routes.js`!
      // Let's do a simple user query, or keep the modal simple: the admin enters the User ID, designation, and employeeId. This is simple, robust, and matches the schema validation!
      // Let's do that to avoid changing backend routes, or we can fetch a mock lists. Enter User ID is very straightforward for developers.
      setShowModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchEmployees({ search, department: selectedDept, status: selectedStatus }));
  };

  const onOnboardSubmit = async (data) => {
    setOnboardError(null);
    const formattedData = {
      ...data,
      dateOfJoining: new Date(data.dateOfJoining).toISOString(),
    };
    
    const resultAction = await dispatch(createEmployee(formattedData));
    if (createEmployee.fulfilled.match(resultAction)) {
      setShowModal(false);
      reset();
      dispatch(fetchEmployees());
    } else {
      setOnboardError(resultAction.payload || 'Failed to onboard employee.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="page-title">Employees Directory</h2>
          <p className="page-subtitle">Manage and audit employee records and profiles</p>
        </div>

        {['ADMIN', 'HR'].includes(currentUser?.role) && (
          <button
            onClick={handleOpenOnboard}
            className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Onboard Employee
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearch} className="filter-bar flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="saas-label">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="saas-input w-full pl-9"
            />
          </div>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="saas-label">Department</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="saas-input w-full"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-40 space-y-2">
          <label className="saas-label">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="saas-input w-full"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="TERMINATED">TERMINATED</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn-primary w-full md:w-auto px-4 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" /> Filter
        </button>
      </form>

      {/* Directory Table */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : employees.length === 0 ? (
        <div className="empty-state">
          No employee records found matching your filters.
        </div>
      ) : (
        <div className="data-table-wrap">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="data-table-head">
                  <th className="p-4">Employee ID</th>
                  <th className="p-4">Name / Designation</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Join Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/60 transition-colors duration-150">
                    <td className="p-4 font-bold text-gray-900">{emp.employeeId}</td>
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-gray-900">{emp.user?.name || 'N/A'}</div>
                        <div className="text-gray-500 text-[10px] font-semibold mt-0.5">{emp.designation}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">
                        {emp.department?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 font-medium">{emp.user?.email || 'N/A'}</td>
                    <td className="p-4 text-gray-500 font-medium">
                      {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        emp.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : emp.status === 'INACTIVE' 
                          ? 'bg-amber-50 text-amber-700' 
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onViewDetails(emp._id)}
                        className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-panel max-w-lg animate-fade-in">
            <div className="modal-header">
              <h3 className="text-sm font-semibold text-slate-900">Onboard Employee</h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onOnboardSubmit)} className="p-6 space-y-4">
              {onboardError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span className="font-semibold">{onboardError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="saas-label">User Account ID</label>
                  <input
                    {...register('user', { required: 'Linked User Account ID is required' })}
                    type="text"
                    placeholder="User Mongoose ObjectID"
                    className="saas-input w-full"
                  />
                  {errors.user && <p className="text-red-600 text-xs mt-1">{errors.user.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="saas-label">Employee ID Code</label>
                  <input
                    {...register('employeeId', { required: 'Employee Code is required' })}
                    type="text"
                    placeholder="e.g. EMP-101"
                    className="saas-input w-full"
                  />
                  {errors.employeeId && <p className="text-red-600 text-xs mt-1">{errors.employeeId.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="saas-label">Department</label>
                  <select
                    {...register('department')}
                    className="saas-input w-full"
                  >
                    <option value="">Unassigned</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="saas-label">Job Designation</label>
                  <input
                    {...register('designation', { required: 'Designation is required' })}
                    type="text"
                    placeholder="e.g. Software Engineer"
                    className="saas-input w-full"
                  />
                  {errors.designation && <p className="text-red-600 text-xs mt-1">{errors.designation.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="saas-label">Date of Joining</label>
                <input
                  {...register('dateOfJoining', { required: 'Date of joining is required' })}
                  type="date"
                  className="saas-input w-full"
                />
                {errors.dateOfJoining && <p className="text-red-600 text-xs mt-1">{errors.dateOfJoining.message}</p>}
              </div>

              <div className="modal-footer -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Onboard Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
