import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads, createLead } from '../../../store/crmSlice.js';
import { Loader2, Plus, Search, Filter, Mail, Phone, Calendar, ArrowRightLeft, User, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';

const LeadList = ({ onViewDetails, searchQuery }) => {
  const dispatch = useDispatch();
  const { leads, loading } = useSelector((state) => state.crm);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [leadError, setLeadError] = useState(null);

  useEffect(() => {
    if (searchQuery === undefined) return;
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchQuery);
      dispatch(fetchLeads({ search: searchQuery, status: selectedStatus, source: selectedSource }));
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, dispatch, selectedStatus, selectedSource]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchLeads({ search, status: selectedStatus, source: selectedSource }));
  };

  const onAddSubmit = async (data) => {
    setLeadError(null);
    const resultAction = await dispatch(createLead(data));
    if (createLead.fulfilled.match(resultAction)) {
      setShowModal(false);
      reset();
      dispatch(fetchLeads());
    } else {
      setLeadError(resultAction.payload || 'Failed to register lead record');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="page-title">Leads Pipeline</h2>
          <p className="page-subtitle">Acquire, score, and transition potential lead acquisitions</p>
        </div>

        {['ADMIN', 'HR', 'MANAGER', 'SALES'].includes(currentUser?.role) && (
          <button
            onClick={() => {
              setLeadError(null);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2 cursor-pointer transition-all duration-150"
          >
            <Plus className="w-4 h-4" /> Add Lead Account
          </button>
        )}
      </div>

      {/* Search filters */}
      <form onSubmit={handleFilterSubmit} className="filter-bar flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="saas-label">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, company, email, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full saas-input pl-9"
            />
          </div>
        </div>

        <div className="w-full md:w-44 space-y-2">
          <label className="saas-label">Lead Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full saas-input"
          >
            <option value="">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="QUALIFIED">QUALIFIED</option>
            <option value="UNQUALIFIED">UNQUALIFIED</option>
            <option value="LOST">LOST</option>
          </select>
        </div>

        <div className="w-full md:w-44 space-y-2">
          <label className="saas-label">Source</label>
          <input
            type="text"
            placeholder="e.g. Referral"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full saas-input"
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 cursor-pointer transition-all duration-150"
        >
          <Filter className="w-3.5 h-3.5" /> Filter
        </button>
      </form>

      {/* Grid list table */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="empty-state">
          No active leads registered in the CRM pipeline.
        </div>
      ) : (
        <div className="data-table-wrap">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="data-table-head">
                  <th className="px-4 py-3">Lead Code</th>
                  <th className="px-4 py-3">Name / Company</th>
                  <th className="px-4 py-3">Contact Detail</th>
                  <th className="px-4 py-3">Lead Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned Sales</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {leads.map((l) => (
                  <tr key={l._id} className="transition-colors duration-150 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-slate-900">{l.leadCode}</td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-slate-900">{l.leadName}</div>
                        <div className="text-slate-500 text-xs font-medium mt-0.5">{l.companyName || 'Private Client'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 space-y-0.5 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {l.email || 'N/A'}</div>
                      <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {l.phone || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-semibold">{l.source}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border transition-colors duration-150 ${
                        l.status === 'QUALIFIED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : l.status === 'NEW'
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : l.status === 'CONTACTED'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {l.assignedSalesPerson?.name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onViewDetails(l._id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200/80 hover:bg-indigo-50 hover:border-indigo-200 text-slate-500 hover:text-indigo-600 transition-all duration-150 cursor-pointer"
                        title="View details"
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

      {/* Onboarding Lead Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-panel max-w-lg animate-fade-in">
            <div className="modal-header">
              <h3 className="text-sm font-semibold text-slate-900">Add Lead Record</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 text-lg cursor-pointer transition-colors duration-150">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onAddSubmit)} className="p-6 space-y-4">
              {leadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  {leadError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="saas-label">Contact Name</label>
                  <input
                    {...register('leadName', { required: 'Lead name is required' })}
                    type="text"
                    placeholder="e.g. Lex Luthor"
                    className="w-full saas-input"
                  />
                  {errors.leadName && <p className="text-red-600 text-xs mt-0.5">{errors.leadName.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="saas-label">Company Name</label>
                  <input
                    {...register('companyName')}
                    type="text"
                    placeholder="e.g. LuthorCorp"
                    className="w-full saas-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="saas-label">Email Address</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="lex@corp.com"
                    className="w-full saas-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="saas-label">Phone</label>
                  <input
                    {...register('phone')}
                    type="text"
                    placeholder="555-0100"
                    className="w-full saas-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="saas-label">Lead Source</label>
                  <input
                    {...register('source')}
                    type="text"
                    placeholder="e.g. Cold Call, Referral"
                    className="w-full saas-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="saas-label">Assigned Sales Person ID</label>
                  <input
                    {...register('assignedSalesPerson')}
                    type="text"
                    placeholder="User Mongoose ObjectID (Optional)"
                    className="w-full saas-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="saas-label">Website URL</label>
                <input
                  {...register('website')}
                  type="text"
                  placeholder="https://luthorcorp.com"
                  className="w-full saas-input"
                />
              </div>

              <div className="space-y-2">
                <label className="saas-label">Notes</label>
                <textarea
                  {...register('notes')}
                  placeholder="Additional context on lead parameters..."
                  rows="3"
                  className="w-full saas-input resize-none"
                ></textarea>
              </div>

              <div className="modal-footer -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary cursor-pointer transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2 cursor-pointer transition-all duration-150"
                >
                  Register Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadList;
