import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaves, fetchMyLeaves, applyLeave, reviewLeave } from '../../../store/hrSlice.js';
import { 
  Loader2, Plus, Calendar, AlertCircle, ShieldAlert, Check, X, FileText, 
  Search, RefreshCw, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, MoreVertical 
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const LeaveRequests = () => {
  const dispatch = useDispatch();
  const { leaves, myLeaves, loading, error } = useSelector((state) => state.hr);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const [applyError, setApplyError] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  // Filters State
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: reviewRegister, handleSubmit: handleReviewSubmit, reset: reviewReset } = useForm();

  useEffect(() => {
    dispatch(fetchMyLeaves());
    if (['ADMIN', 'HR', 'MANAGER'].includes(currentUser?.role)) {
      dispatch(fetchLeaves());
    }
  }, [dispatch, currentUser]);

  const onApplySubmit = async (data) => {
    setApplyError(null);
    const formattedData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    };

    const resultAction = await dispatch(applyLeave(formattedData));
    if (applyLeave.fulfilled.match(resultAction)) {
      setShowApplyModal(false);
      reset();
      dispatch(fetchMyLeaves());
    } else {
      setApplyError(resultAction.payload || 'Failed to submit leave request');
    }
  };

  const handleOpenReview = (request, decision) => {
    setReviewError(null);
    setSelectedRequest({ ...request, decision });
    setShowReviewModal(true);
  };

  const onReviewSubmit = async (data) => {
    setReviewError(null);
    const payload = {
      id: selectedRequest._id,
      status: selectedRequest.decision,
      comments: data.comments
    };

    const resultAction = await dispatch(reviewLeave(payload));
    if (reviewLeave.fulfilled.match(resultAction)) {
      setShowReviewModal(false);
      reviewReset();
      dispatch(fetchLeaves());
    } else {
      setReviewError(resultAction.payload || 'Failed to review leave request');
    }
  };

  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setYearFilter('ALL');
    setCurrentPage(1);
  };

  // Helper to calculate duration in days
  const getDurationDays = (start, end) => {
    const diffTime = Math.abs(new Date(end) - new Date(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
    return diffDays;
  };

  // Metrics Calculations (for the logged-in user)
  const totalApplied = myLeaves.length;
  const pendingRequests = myLeaves.filter(l => l.status === 'PENDING').length;
  const approvedRequests = myLeaves.filter(l => l.status === 'APPROVED').length;
  const rejectedRequests = myLeaves.filter(l => l.status === 'REJECTED').length;

  // Leave Balances Calculations
  const sickApproved = myLeaves
    .filter(l => l.leaveType === 'SICK' && l.status === 'APPROVED')
    .reduce((sum, l) => sum + getDurationDays(l.startDate, l.endDate), 0);

  const casualApproved = myLeaves
    .filter(l => l.leaveType === 'CASUAL' && l.status === 'APPROVED')
    .reduce((sum, l) => sum + getDurationDays(l.startDate, l.endDate), 0);

  const parentalApproved = myLeaves
    .filter(l => ['MATERNITY', 'PATERNITY'].includes(l.leaveType) && l.status === 'APPROVED')
    .reduce((sum, l) => sum + getDurationDays(l.startDate, l.endDate), 0);

  const sickRemaining = Math.max(0, 10 - sickApproved);
  const casualRemaining = Math.max(0, 8 - casualApproved);
  const parentalRemaining = Math.max(0, 20 - parentalApproved);
  const totalRemaining = sickRemaining + casualRemaining + parentalRemaining;

  // Upcoming Leave Summary (approved, future)
  const upcomingLeaves = myLeaves
    .filter(l => l.status === 'APPROVED' && new Date(l.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const nextUpcoming = upcomingLeaves[0] || null;

  // Filter Logic
  const filteredMyLeaves = myLeaves.filter((l) => {
    const matchSearch = l.reason.toLowerCase().includes(searchText.toLowerCase()) || 
                        l.leaveType.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchType = typeFilter === 'ALL' || l.leaveType === typeFilter;
    const matchYear = yearFilter === 'ALL' || new Date(l.startDate).getFullYear().toString() === yearFilter;
    return matchSearch && matchStatus && matchType && matchYear;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMyLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMyLeaves.length / itemsPerPage) || 1;

  return (
    <div className="space-y-6">
      {/* Top Section / Title and CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Leave Management</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Apply for leave and track your leave requests</p>
        </div>

        <button
          onClick={() => {
            setApplyError(null);
            setShowApplyModal(true);
          }}
          className="bg-[#2563eb] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Apply Leave
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leaves */}
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Leaves</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalApplied}</h3>
            <p className="text-[10px] text-gray-400 font-medium">All types combined</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pending Requests</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{pendingRequests}</h3>
            <p className="text-[10px] text-gray-400 font-medium">Awaiting approval</p>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center text-green-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Approved</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{approvedRequests}</h3>
            <p className="text-[10px] text-gray-400 font-medium">This year</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rejected</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{rejectedRequests}</h3>
            <p className="text-[10px] text-gray-400 font-medium">This year</p>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          {/* Search */}
          <div className="relative w-full sm:w-64 max-w-xs shrink-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leave requests..."
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-xs text-gray-700 bg-white"
            />
          </div>

          {/* Status Dropdown */}
          <div className="w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-auto bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-semibold text-gray-600 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Leave Type Dropdown */}
          <div className="w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-auto bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-semibold text-gray-600 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Types</option>
              <option value="SICK">Sick Leave</option>
              <option value="CASUAL">Casual Leave</option>
              <option value="MATERNITY">Maternity Leave</option>
              <option value="PATERNITY">Paternity Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
            </select>
          </div>

          {/* Year Dropdown */}
          <div className="w-full sm:w-auto">
            <select
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-auto bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-semibold text-gray-600 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        {/* Reset Filter Button */}
        <button
          onClick={handleResetFilters}
          className="flex items-center gap-1 text-[#2563eb] hover:text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100/50 rounded-lg px-3 py-2 text-xs font-bold cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Main Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Table of Leaves */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700">
            My Leave History
          </div>

          {filteredMyLeaves.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs font-semibold flex flex-col items-center justify-center gap-2">
              <FileText className="w-8 h-8 text-gray-300" />
              <span>No matching leave records found.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400">
                    <th className="p-4">Leave Type</th>
                    <th className="p-4">Dates</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Applied On</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {currentItems.map((l) => {
                    const days = getDurationDays(l.startDate, l.endDate);
                    return (
                      <tr key={l._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-gray-900">
                          {l.leaveType.charAt(0) + l.leaveType.slice(1).toLowerCase()} Leave
                        </td>
                        <td className="p-4">
                          <span className="font-semibold">{new Date(l.startDate).toLocaleDateString()}</span>
                          <span className="text-gray-400 block text-[10px] mt-0.5">to {new Date(l.endDate).toLocaleDateString()}</span>
                        </td>
                        <td className="p-4 font-semibold text-gray-600">
                          {days} {days === 1 ? 'Day' : 'Days'}
                        </td>
                        <td className="p-4 max-w-[150px] truncate" title={l.reason}>
                          {l.reason}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                            l.status === 'APPROVED' 
                              ? 'bg-green-50 border-green-200 text-green-700' 
                              : l.status === 'REJECTED' 
                              ? 'bg-red-50 border-red-200 text-red-700' 
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="p-4 text-[10px] text-gray-400">
                          {new Date(l.createdAt).toLocaleDateString()}
                          <span className="block mt-0.5">{new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="p-4 text-center text-gray-400">
                          <button className="p-1 hover:bg-gray-100 rounded-full hover:text-gray-900 cursor-pointer">
                            <MoreVertical className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Table Pagination */}
              <div className="p-4 border-t border-gray-200 flex items-center justify-between text-[11px] font-bold text-gray-400 bg-gray-50/50">
                <span>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredMyLeaves.length)} of {filteredMyLeaves.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent shrink-0 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-gray-900 px-2 font-extrabold">{currentPage}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent shrink-0 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Upcoming leaves & Balance widgets */}
        <div className="space-y-6">
          {/* Upcoming Leave */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700">
              Upcoming Leave
            </div>
            <div className="p-4">
              {!nextUpcoming ? (
                <div className="py-6 text-center text-gray-400 text-xs font-semibold">
                  No upcoming approved leaves.
                </div>
              ) : (
                <div className="flex items-center justify-between hover:bg-gray-50 border border-blue-100 bg-blue-50/15 p-4.5 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg border border-blue-100 bg-blue-50 text-[#2563eb] shrink-0 font-bold leading-none">
                      <span className="text-[14px]">{new Date(nextUpcoming.startDate).getDate()}</span>
                      <span className="text-[9px] uppercase mt-0.5">
                        {new Date(nextUpcoming.startDate).toLocaleDateString([], { month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {nextUpcoming.leaveType.charAt(0) + nextUpcoming.leaveType.slice(1).toLowerCase()} Leave
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                        {getDurationDays(nextUpcoming.startDate, nextUpcoming.endDate)} Days Duration
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold border bg-green-50 border-green-200 text-green-700">
                    Approved
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Leave Balance */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700 flex justify-between items-center">
              <span>Leave Balance</span>
              <span className="text-[9px] text-gray-400 font-bold">As of today</span>
            </div>
            <div className="p-5 space-y-4 text-xs font-semibold text-gray-700">
              {/* Parental/Maternity Leave */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>Parental / Maternity Leave</span>
                  <span className="text-gray-900">{parentalApproved} / 20 Days</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 border border-gray-200/50">
                  <div 
                    className="bg-[#2563eb] h-1.5 rounded-full" 
                    style={{ width: `${Math.min(100, (parentalApproved / 20) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Sick Leave */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>Sick Leave</span>
                  <span className="text-gray-900">{sickApproved} / 10 Days</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 border border-gray-200/50">
                  <div 
                    className="bg-amber-500 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(100, (sickApproved / 10) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Casual Leave */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>Casual Leave</span>
                  <span className="text-gray-900">{casualApproved} / 8 Days</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 border border-gray-200/50">
                  <div 
                    className="bg-green-600 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(100, (casualApproved / 8) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Total Remaining */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between font-bold">
                <span>Total Remaining</span>
                <span className="px-3 py-1 rounded bg-green-50 border border-green-200 text-green-700 text-xs font-bold shadow-xs">
                  {totalRemaining} Days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Leaves Review Console (only visible to Admin/HR/Manager) */}
      {['ADMIN', 'HR', 'MANAGER'].includes(currentUser?.role) && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden mt-6">
          <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700">
            Team Leaves Review Console (Admin view)
          </div>
          
          {leaves.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-xs font-semibold">No pending team leave requests.</div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {leaves.map((l) => (
                <div key={l._id} className="p-4 flex items-start justify-between text-xs font-medium text-gray-700 hover:bg-gray-50">
                  <div className="space-y-1">
                    <div className="font-bold text-gray-900">{l.employee?.user?.name || 'Unknown User'}</div>
                    <div className="text-[10px] text-gray-500 font-bold">
                      {l.leaveType} LEAVE | {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                    </div>
                    <p className="text-gray-500 text-[11px] italic">"{l.reason}"</p>
                    {l.status !== 'PENDING' && (
                      <p className="text-slate-400 text-[10px]">
                        Reviewed By: {l.approvedBy?.name || 'System'} | Comments: {l.comments || 'None'}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {l.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleOpenReview(l, 'APPROVED')}
                          className="p-1.5 rounded bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 transition-colors cursor-pointer"
                          title="Approve"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenReview(l, 'REJECTED')}
                          className="p-1.5 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                          title="Reject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        l.status === 'APPROVED' 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {l.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Apply for Leave</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onApplySubmit)} className="p-5 space-y-4 text-xs font-semibold text-gray-700">
              {applyError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span className="font-semibold">{applyError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Leave Type</label>
                <select
                  {...register('leaveType', { required: 'Leave type is required' })}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-semibold text-gray-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="SICK">SICK LEAVE</option>
                  <option value="CASUAL">CASUAL LEAVE</option>
                  <option value="MATERNITY">MATERNITY LEAVE</option>
                  <option value="PATERNITY">PATERNITY LEAVE</option>
                  <option value="UNPAID">UNPAID LEAVE</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Start Date</label>
                  <input
                    {...register('startDate', { required: 'Start date is required' })}
                    type="date"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-semibold text-gray-700 focus:outline-none focus:border-blue-600"
                  />
                  {errors.startDate && <p className="text-red-600 text-[10px] mt-0.5">{errors.startDate.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">End Date</label>
                  <input
                    {...register('endDate', { required: 'End date is required' })}
                    type="date"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-semibold text-gray-700 focus:outline-none focus:border-blue-600"
                  />
                  {errors.endDate && <p className="text-red-600 text-[10px] mt-0.5">{errors.endDate.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Reason</label>
                <textarea
                  {...register('reason', { required: 'Reason is required' })}
                  placeholder="Explain why you are requesting leave..."
                  rows="3"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-600"
                ></textarea>
                {errors.reason && <p className="text-red-600 text-[10px] mt-0.5">{errors.reason.message}</p>}
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2563eb] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Leave Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Review Leave Request</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit(onReviewSubmit)} className="p-5 space-y-4">
              {reviewError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-xs">
                  <ShieldAlert className="w-4 h-4 mt-0.5" />
                  <span className="font-semibold">{reviewError}</span>
                </div>
              )}

              <div className="bg-[#f8f9fa] border border-gray-200 p-3 rounded-lg text-xs font-medium space-y-1 text-gray-700">
                <p>Employee: <span className="text-gray-900 font-bold">{selectedRequest?.employee?.user?.name}</span></p>
                <p>Type: <span className="text-gray-900 font-bold">{selectedRequest?.leaveType}</span></p>
                <p>Decision: <span className={`font-bold ${selectedRequest?.decision === 'APPROVED' ? 'text-green-600' : 'text-red-600'}`}>{selectedRequest?.decision}</span></p>
              </div>

              <div className="space-y-1 text-xs font-semibold text-gray-700">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Review Comments</label>
                <textarea
                  {...reviewRegister('comments')}
                  placeholder="Provide feedback/reasons for your decision..."
                  rows="3"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-600"
                ></textarea>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors cursor-pointer ${
                    selectedRequest?.decision === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
