import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFollowUps, updateFollowUp, createFollowUp, fetchCustomers } from '../../../store/crmSlice.js';
import { fetchEmployees } from '../../../store/hrSlice.js';
import { Loader2, Plus, Calendar, AlertCircle, CheckCircle2, User, Timer } from 'lucide-react';
import { useForm } from 'react-hook-form';

const FollowUpList = () => {
  const dispatch = useDispatch();
  const { followups, customers, loading } = useSelector((state) => state.crm);
  const { employees = [] } = useSelector((state) => state.hr);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [followError, setFollowError] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    dispatch(fetchFollowUps());
    dispatch(fetchCustomers());
    if (['ADMIN', 'HR', 'MANAGER'].includes(currentUser?.role)) {
      dispatch(fetchEmployees());
    }
  }, [dispatch, currentUser]);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    await dispatch(updateFollowUp({ id, data: { status: nextStatus } }));
    dispatch(fetchFollowUps());
  };

  const onAddSubmit = async (data) => {
    setFollowError(null);
    const payload = {
      title: data.title,
      customer: data.customer || undefined,
      dueDate: new Date(data.dueDate).toISOString(),
      priority: data.priority,
      assignedTo: data.assignedTo || currentUser.id || currentUser._id,
      notes: data.notes
    };

    const result = await dispatch(createFollowUp(payload));
    if (createFollowUp.fulfilled.match(result)) {
      setShowModal(false);
      reset();
      dispatch(fetchFollowUps());
    } else {
      setFollowError(result.payload || 'Failed to create follow-up task.');
    }
  };

  return (
    <div className="space-y-6 text-xs text-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Follow Up Checklist</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Manage and verify client follow up agendas and deadlines</p>
        </div>

        <button
          onClick={() => {
            setFollowError(null);
            setShowModal(true);
          }}
          className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Checklist layout */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : followups.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-12 rounded-lg text-gray-500 text-xs font-medium">
          No pending follow-up checklists recorded.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {followups.map((f) => (
              <div key={f._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={f.status === 'COMPLETED'}
                    onChange={() => handleToggleStatus(f._id, f.status)}
                    className="w-4.5 h-4.5 rounded border-gray-300 text-[#2563eb] focus:ring-blue-500 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <h3 className={`text-xs font-bold text-gray-900 ${f.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>
                      {f.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-400 font-semibold">
                      <span>Customer: <span className="text-blue-600 font-bold">{f.customer?.companyName || 'Private Client'}</span></span>
                      <span>Assignee: <span className="text-gray-700 font-bold">{f.assignedTo?.name || 'Unassigned'}</span></span>
                    </div>
                    {f.notes && <p className="text-gray-500 text-[11px] font-medium leading-relaxed italic mt-1">"{f.notes}"</p>}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-semibold text-gray-500 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    f.priority === 'HIGH' 
                      ? 'bg-red-50 border-red-200 text-red-700' 
                      : f.priority === 'MEDIUM' 
                      ? 'bg-amber-50 border-amber-200 text-amber-700' 
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    {f.priority} PRIORITY
                  </span>

                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Due: {new Date(f.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Add Task</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmit(onAddSubmit)} className="p-5 space-y-4">
              {followError && <p className="text-red-700 font-semibold">{followError}</p>}
              
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Associated Customer</label>
                <select
                  {...register('customer')}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                >
                  <option value="">Unassigned...</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.customerName}</option>
                  ))}
                </select>
              </div>

              {['ADMIN', 'HR', 'MANAGER'].includes(currentUser?.role) && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assign Task To</label>
                  <select
                    {...register('assignedTo', { required: 'Please select an assignee' })}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp.user?._id || emp.user?.id || emp.user}>
                        {emp.user?.name} ({emp.employeeId} - {emp.designation})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Task Title</label>
                <input
                  {...register('title', { required: true })}
                  type="text"
                  placeholder="e.g. Discuss proposal quotes"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Due Date</label>
                <input
                  {...register('dueDate', { required: true })}
                  type="datetime-local"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Priority</label>
                <select
                  {...register('priority')}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Notes</label>
                <textarea
                  {...register('notes')}
                  placeholder="Details/instructions..."
                  rows="2"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                ></textarea>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg font-semibold cursor-pointer">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpList;
