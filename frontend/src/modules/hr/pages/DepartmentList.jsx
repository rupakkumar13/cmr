import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartments, createDepartment, deleteDepartment } from '../../../store/hrSlice.js';
import { Loader2, Plus, Users, ShieldAlert, FolderSync, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

const DepartmentList = () => {
  const dispatch = useDispatch();
  const { departments, loading, error } = useSelector((state) => state.hr);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [createError, setCreateError] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const onAddSubmit = async (data) => {
    setCreateError(null);
    const payload = {
      ...data,
      manager: data.manager || undefined
    };
    const resultAction = await dispatch(createDepartment(payload));
    if (createDepartment.fulfilled.match(resultAction)) {
      setShowModal(false);
      reset();
      dispatch(fetchDepartments());
    } else {
      setCreateError(resultAction.payload || 'Failed to create department');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the department "${name}"?`)) {
      const resultAction = await dispatch(deleteDepartment(id));
      if (deleteDepartment.rejected.match(resultAction)) {
        alert(resultAction.payload || 'Failed to delete department');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Departments</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Configure and manage corporate departments and designations</p>
        </div>

        {['ADMIN', 'HR'].includes(currentUser?.role) && (
          <button
            onClick={() => {
              setCreateError(null);
              setShowModal(true);
            }}
            className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        )}
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-12 rounded-lg text-gray-500 text-xs font-medium">
          No department records configured.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept._id} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{dept.name}</h3>
                </div>
                {['ADMIN', 'HR'].includes(currentUser?.role) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(dept._id, dept.name)}
                    className="p-1.5 rounded-lg text-gray-450 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <p className="text-xs text-gray-500 font-medium leading-relaxed min-h-8">
                {dept.description || 'No description provided.'}
              </p>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                <span>Manager Assigned</span>
                <span className="text-gray-700 font-bold">{dept.manager?.name || 'Unassigned'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Add Department</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onAddSubmit)} className="p-5 space-y-4">
              {createError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-xs">
                  <ShieldAlert className="w-4 h-4 mt-0.5" />
                  <span className="font-semibold">{createError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Department Name</label>
                <input
                  {...register('name', { required: 'Department name is required' })}
                  type="text"
                  placeholder="e.g. Quality Assurance"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-600"
                />
                {errors.name && <p className="text-red-600 text-[10px] mt-0.5">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Manager Account ID (User Ref)</label>
                <input
                  {...register('manager')}
                  type="text"
                  placeholder="User Mongoose ObjectID (Optional)"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea
                  {...register('description')}
                  placeholder="Brief description of department scope..."
                  rows="3"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-600"
                ></textarea>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;
