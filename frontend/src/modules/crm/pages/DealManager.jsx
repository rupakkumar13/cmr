import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeals, updateDeal, fetchCustomers, createDeal } from '../../../store/crmSlice.js';
import { fetchEmployees } from '../../../store/hrSlice.js';
import { 
  Loader2, Plus, ArrowRight, Check, X, MoreVertical, 
  Calendar, DollarSign, User, Briefcase, Clock, 
  Eye, Edit, Trash, FileText, CheckCircle2, XCircle, 
  AlertCircle, FileUp, MessageCircle, ChevronDown, Flag,
  Search, ShieldAlert
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../../services/api.js';

const DealManager = () => {
  const dispatch = useDispatch();
  const { deals = [], customers = [], loading } = useSelector((state) => state.crm);
  const { employees = [] } = useSelector((state) => state.hr);
  const { user: currentUser } = useSelector((state) => state.auth);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(null);
  const [showMeetingModal, setShowMeetingModal] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('');

  // Dropdown States
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [dealError, setDealError] = useState(null);
  const dropdownRef = useRef(null);

  const { register, handleSubmit, reset } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm();
  const { register: registerNote, handleSubmit: handleSubmitNote, reset: resetNote } = useForm();
  const { register: registerMeeting, handleSubmit: handleSubmitMeeting, reset: resetMeeting } = useForm();

  const stages = ['QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH'];

  useEffect(() => {
    dispatch(fetchDeals());
    dispatch(fetchCustomers());
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStageChange = async (id, stage) => {
    await dispatch(updateDeal({ id, data: { stage } }));
    dispatch(fetchDeals());
    setActiveMenuId(null);
  };

  const handleStatusChange = async (id, status) => {
    await dispatch(updateDeal({ id, data: { status } }));
    dispatch(fetchDeals());
    setActiveMenuId(null);
  };

  const handleDeleteDeal = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await api.delete(`/api/v1/deals/${id}`);
        dispatch(fetchDeals());
        setActiveMenuId(null);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete deal');
      }
    }
  };

  const onAddSubmit = async (data) => {
    setDealError(null);
    const payload = {
      title: data.title,
      customer: data.customer,
      company: data.company,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      amount: Number(data.amount),
      currency: data.currency || 'INR',
      pipeline: data.pipeline || 'Sales Pipeline',
      stage: data.stage || 'QUALIFICATION',
      priority: data.priority || 'MEDIUM',
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate).toISOString() : undefined,
      assignedSalesPerson: data.assignedSalesPerson || currentUser.id || currentUser._id,
      leadSource: data.leadSource,
      description: data.description,
    };

    const result = await dispatch(createDeal(payload));
    if (createDeal.fulfilled.match(result)) {
      setShowCreateModal(false);
      reset();
      dispatch(fetchDeals());
    } else {
      setDealError(result.payload || 'Failed to create deal.');
    }
  };

  const onEditSubmit = async (data) => {
    setDealError(null);
    const payload = {
      title: data.title,
      customer: data.customer,
      company: data.company,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      amount: Number(data.amount),
      currency: data.currency,
      pipeline: data.pipeline,
      stage: data.stage,
      priority: data.priority,
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate).toISOString() : undefined,
      assignedSalesPerson: data.assignedSalesPerson || undefined,
      leadSource: data.leadSource,
      description: data.description,
      status: data.status,
    };

    const result = await dispatch(updateDeal({ id: showEditModal._id, data: payload }));
    if (updateDeal.fulfilled.match(result)) {
      setShowEditModal(null);
      resetEdit();
      dispatch(fetchDeals());
    } else {
      setDealError(result.payload || 'Failed to update deal.');
    }
  };

  const onNoteSubmit = async (data) => {
    try {
      // Simulate registering activity note
      await api.post('/api/v1/activity-logs', {
        entityType: 'DEAL',
        entityId: showNoteModal._id,
        action: 'NOTE_ADDED',
        description: `Note added: ${data.noteText}`,
      });
      alert('Note saved to activity logs!');
      setShowNoteModal(null);
      resetNote();
      dispatch(fetchDeals());
    } catch (err) {
      alert('Failed to save activity log');
    }
  };

  const onMeetingSubmit = async (data) => {
    try {
      await api.post('/api/v1/activity-logs', {
        entityType: 'DEAL',
        entityId: showMeetingModal._id,
        action: 'MEETING_SCHEDULED',
        description: `Meeting scheduled: "${data.meetingSubject}" on ${new Date(data.meetingDate).toLocaleString()}`,
      });
      alert('Meeting scheduled successfully!');
      setShowMeetingModal(null);
      resetMeeting();
      dispatch(fetchDeals());
    } catch (err) {
      alert('Failed to schedule meeting');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    alert('Document uploaded successfully to Deal profile attachments!');
    setShowUploadModal(null);
  };

  const startQuotationFlow = (deal) => {
    localStorage.setItem('crm_active_deal_id', deal._id);
    localStorage.setItem('crm_active_deal_action', 'create_quotation');
    window.dispatchEvent(new CustomEvent('changeTab', { detail: { tab: 'billing', subTab: 'quotations' } }));
  };

  const startInvoiceFlow = (deal) => {
    localStorage.setItem('crm_active_deal_id', deal._id);
    localStorage.setItem('crm_active_deal_action', 'create_invoice');
    window.dispatchEvent(new CustomEvent('changeTab', { detail: { tab: 'billing', subTab: 'invoices' } }));
  };

  // Filter Deals client-side
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      deal.dealCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = stageFilter ? deal.stage === stageFilter : true;
    const matchesPriority = priorityFilter ? deal.priority === priorityFilter : true;
    const matchesSales = salespersonFilter ? deal.assignedSalesPerson?._id === salespersonFilter : true;

    return matchesSearch && matchesStage && matchesPriority && matchesSales;
  });

  const getStageTotalAmount = (stageName) => {
    return filteredDeals
      .filter(deal => deal.stage === stageName)
      .reduce((sum, deal) => sum + (deal.amount || 0), 0);
  };

  const getStageCount = (stageName) => {
    return filteredDeals.filter(deal => deal.stage === stageName).length;
  };

  const getPriorityBadgeColor = (prio) => {
    switch (prio) {
      case 'HIGH': return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 text-xs text-gray-700">
      
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Deals</div>
          <div className="text-xl font-bold text-gray-900 mt-1">{filteredDeals.length}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Active Deals Value</div>
          <div className="text-xl font-bold text-blue-600 mt-1">₹{filteredDeals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST').reduce((s, d) => s + d.amount, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Closed Won Value</div>
          <div className="text-xl font-bold text-green-600 mt-1">₹{filteredDeals.filter(d => d.stage === 'CLOSED_WON').reduce((s, d) => s + d.amount, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Win Rate</div>
          <div className="text-xl font-bold text-slate-800 mt-1">
            {filteredDeals.length > 0 
              ? `${Math.round((filteredDeals.filter(d => d.stage === 'CLOSED_WON').length / filteredDeals.length) * 100)}%`
              : '0%'
            }
          </div>
        </div>
      </div>

      {/* Header and Filter Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Deals Pipeline</h2>
            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Manage deals, convert workflows, and track closed won accounts.</p>
          </div>

          <button
            onClick={() => {
              setDealError(null);
              setShowCreateModal(true);
            }}
            className="bg-[#2563eb] text-white hover:bg-blue-700 px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Create Deal
          </button>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-150">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search Deal or Company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-gray-250 rounded-lg py-1.5 pl-9 pr-3 focus:outline-none text-[11px] text-gray-700"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-slate-50 border border-gray-250 rounded-lg py-1.5 px-3 focus:outline-none text-[11px] text-gray-700 cursor-pointer"
          >
            <option value="">All Stages</option>
            {stages.map(stg => (
              <option key={stg} value={stg}>{stg.replace('_', ' ')}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-gray-250 rounded-lg py-1.5 px-3 focus:outline-none text-[11px] text-gray-700 cursor-pointer"
          >
            <option value="">All Priorities</option>
            {priorities.map(prio => (
              <option key={prio} value={prio}>{prio}</option>
            ))}
          </select>

          <select
            value={salespersonFilter}
            onChange={(e) => setSalespersonFilter(e.target.value)}
            className="bg-slate-50 border border-gray-250 rounded-lg py-1.5 px-3 focus:outline-none text-[11px] text-gray-700 cursor-pointer"
          >
            <option value="">All Representatives</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp.user?._id || emp.user}>
                {emp.user?.name || 'Representative'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board columns */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = filteredDeals.filter(deal => deal.stage === stage);
            return (
              <div key={stage} className="bg-slate-50 border border-gray-200 p-3 rounded-xl min-w-64 space-y-4 flex flex-col h-[600px] shadow-xs">
                
                {/* Column header */}
                <div className="border-b border-gray-200 pb-2.5 flex justify-between items-center shrink-0">
                  <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px] truncate max-w-40 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      stage === 'CLOSED_WON' ? 'bg-green-600' :
                      stage === 'CLOSED_LOST' ? 'bg-red-600' :
                      stage === 'NEGOTIATION' ? 'bg-orange-600' : 'bg-blue-600'
                    }`} />
                    {stage.replace('_', ' ')} ({getStageCount(stage)})
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-white text-[9px] font-bold border text-gray-600">₹{getStageTotalAmount(stage).toLocaleString()}
                  </span>
                </div>

                {/* Deal Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {stageDeals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 font-medium">
                      <Briefcase className="w-5 h-5 text-gray-300 mb-1" />
                      <p className="text-[9px]">No deals</p>
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const priorityColor = getPriorityBadgeColor(deal.priority);
                      return (
                        <div 
                          key={deal._id} 
                          className={`bg-white border-l-4 border-y border-r border-gray-200 p-3 rounded-lg shadow-xs hover:shadow-md transition-all relative ${
                            deal.priority === 'HIGH' ? 'border-l-red-500' :
                            deal.priority === 'MEDIUM' ? 'border-l-amber-500' : 'border-l-slate-400'
                          }`}
                        >
                          {/* Title and Action Menu */}
                          <div className="flex justify-between items-start gap-2">
                            <div className="font-bold text-gray-900 text-[11px] leading-tight hover:text-blue-600 cursor-pointer" onClick={() => setShowDetailsModal(deal)}>
                              {deal.title}
                            </div>
                            
                            {/* Dropdown Menu Trigger */}
                            <div className="relative shrink-0">
                              <button 
                                onClick={() => setActiveMenuId(activeMenuId === deal._id ? null : deal._id)}
                                className="p-0.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {/* Dropdown Action list */}
                              {activeMenuId === deal._id && (
                                <div 
                                  ref={dropdownRef}
                                  className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 w-44 z-30 animate-fade-in text-[10px] text-gray-700 font-semibold"
                                >
                                  <button onClick={() => { setShowDetailsModal(deal); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
                                    <Eye className="w-3 h-3 text-slate-400" /> View Details
                                  </button>
                                  <button onClick={() => { setShowEditModal(deal); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
                                    <Edit className="w-3 h-3 text-blue-400" /> Edit Deal
                                  </button>

                                  <div className="border-t border-gray-100 my-1"></div>

                                  {/* Create Quotation (Enabled only for Proposal & Negotiation) */}
                                  <button 
                                    disabled={!['PROPOSAL', 'NEGOTIATION'].includes(deal.stage)}
                                    onClick={() => startQuotationFlow(deal)}
                                    className={`w-full text-left px-3 py-1.5 flex items-center gap-1.5 ${
                                      ['PROPOSAL', 'NEGOTIATION'].includes(deal.stage)
                                        ? 'hover:bg-slate-50 cursor-pointer text-gray-700'
                                        : 'opacity-40 cursor-not-allowed text-gray-400'
                                    }`}
                                  >
                                    <FileText className="w-3 h-3 text-amber-500" /> Create Quotation
                                  </button>

                                  {/* Create Invoice (Enabled only for Closed Won) */}
                                  <button 
                                    disabled={deal.stage !== 'CLOSED_WON'}
                                    onClick={() => startInvoiceFlow(deal)}
                                    className={`w-full text-left px-3 py-1.5 flex items-center gap-1.5 ${
                                      deal.stage === 'CLOSED_WON'
                                        ? 'hover:bg-slate-50 cursor-pointer text-gray-700'
                                        : 'opacity-40 cursor-not-allowed text-gray-400'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-3 h-3 text-green-500" /> Create Invoice
                                  </button>

                                  <div className="border-t border-gray-100 my-1"></div>

                                  <button onClick={() => { setShowMeetingModal(deal); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
                                    <Calendar className="w-3 h-3 text-blue-500" /> Schedule Meeting
                                  </button>
                                  <button onClick={() => { setShowNoteModal(deal); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
                                    <MessageCircle className="w-3 h-3 text-violet-500" /> Add Note
                                  </button>
                                  <button onClick={() => { setShowUploadModal(deal); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
                                    <FileUp className="w-3 h-3 text-emerald-500" /> Upload Document
                                  </button>

                                  <div className="border-t border-gray-100 my-1"></div>

                                  {deal.stage !== 'CLOSED_WON' && (
                                    <button onClick={() => handleStageChange(deal._id, 'CLOSED_WON')} className="w-full text-left px-3 py-1.5 hover:bg-green-50 text-green-700 flex items-center gap-1.5 cursor-pointer">
                                      <CheckCircle2 className="w-3 h-3" /> Mark Closed Won
                                    </button>
                                  )}
                                  {deal.stage !== 'CLOSED_LOST' && (
                                    <button onClick={() => handleStageChange(deal._id, 'CLOSED_LOST')} className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-700 flex items-center gap-1.5 cursor-pointer">
                                      <XCircle className="w-3 h-3" /> Mark Closed Lost
                                    </button>
                                  )}

                                  <div className="border-t border-gray-100 my-1"></div>

                                  <button onClick={() => handleDeleteDeal(deal._id)} className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-1.5 cursor-pointer">
                                    <Trash className="w-3 h-3" /> Delete Deal
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Customer Details */}
                          <div className="text-[10px] text-gray-500 font-semibold mt-1">
                            {deal.company || deal.customer?.companyName || 'Private Client'}
                          </div>
                          
                          {/* Owner & Value Info */}
                          <div className="flex justify-between items-center mt-2.5">
                            <span className="text-blue-600 font-bold text-xs">
                              {deal.currency === 'EUR' ? '€' : deal.currency === 'GBP' ? '£' : '₹'}
                              {(deal.amount || 0).toLocaleString()}
                            </span>
                            
                            <span className={`px-2 py-0.5 rounded-full border text-[8px] font-bold ${priorityColor}`}>
                              {deal.priority}
                            </span>
                          </div>

                          {/* Quick indicators */}
                          <div className="grid grid-cols-2 gap-1 pt-2 border-t border-gray-100 mt-2 text-[8px] text-gray-400 font-semibold">
                            <span className="truncate flex items-center gap-1" title="Sales Representative">
                              <User className="w-2.5 h-2.5 shrink-0" />
                              {deal.assignedSalesPerson?.name || 'Unassigned'}
                            </span>
                            <span className="text-right truncate" title="Expected Close Date">
                              {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'No Close Date'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE DEAL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-lg overflow-hidden my-8">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Create New Deal Entry</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmit(onAddSubmit)} className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              {dealError && <p className="text-red-700 font-bold">{dealError}</p>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Deal Name *</label>
                  <input {...register('title', { required: true })} type="text" placeholder="e.g. Migration deal" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Associated Customer *</label>
                  <select {...register('customer', { required: true })} className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none cursor-pointer">
                    <option value="">Choose Customer...</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.customerName} ({c.companyName})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Company Name</label>
                  <input {...register('company')} type="text" placeholder="e.g. Acme Corp" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Contact Person</label>
                  <input {...register('contactPerson')} type="text" placeholder="John Doe" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Contact Email</label>
                  <input {...register('email')} type="email" placeholder="john@example.com" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Contact Phone</label>
                  <input {...register('phone')} type="text" placeholder="+12345678" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Deal Value *</label>
                  <input {...register('amount', { required: true })} type="number" placeholder="5000" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Currency</label>
                  <select {...register('currency')} className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none cursor-pointer">
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Pipeline</label>
                  <input {...register('pipeline')} type="text" defaultValue="Sales Pipeline" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Stage</label>
                  <select {...register('stage')} className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none cursor-pointer">
                    {stages.map(stg => (
                      <option key={stg} value={stg}>{stg.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Priority</label>
                  <select {...register('priority')} className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none cursor-pointer">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM" selected>MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Expected Close Date</label>
                  <input {...register('expectedCloseDate')} type="date" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Salesperson Assigned</label>
                  <select {...register('assignedSalesPerson')} className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none cursor-pointer">
                    <option value="">Assign to Me</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp.user?._id || emp.user}>
                        {emp.user?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Lead Source</label>
                  <input {...register('leadSource')} type="text" placeholder="e.g. Website Call" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Description / Scope Details</label>
                <textarea {...register('description')} rows={3} placeholder="Provide details here..." className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-[11px]"></textarea>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4 rounded-b-xl">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="bg-[#2563eb] text-white px-4 py-2 rounded-lg font-semibold cursor-pointer">Create Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEAL MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-lg overflow-hidden my-8">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Edit Deal Profile</h3>
              <button onClick={() => setShowEditModal(null)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              {dealError && <p className="text-red-700 font-bold">{dealError}</p>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Deal Name *</label>
                  <input {...registerEdit('title', { required: true, defaultValue: showEditModal.title })} type="text" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Associated Customer *</label>
                  <select {...registerEdit('customer', { required: true, defaultValue: showEditModal.customer?._id || showEditModal.customer })} className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none cursor-pointer">
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.customerName} ({c.companyName})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Company Name</label>
                  <input {...registerEdit('company', { defaultValue: showEditModal.company })} type="text" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Contact Person</label>
                  <input {...registerEdit('contactPerson', { defaultValue: showEditModal.contactPerson })} type="text" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Contact Email</label>
                  <input {...registerEdit('email', { defaultValue: showEditModal.email })} type="email" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Contact Phone</label>
                  <input {...registerEdit('phone', { defaultValue: showEditModal.phone })} type="text" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Deal Value *</label>
                  <input {...registerEdit('amount', { required: true, defaultValue: showEditModal.amount })} type="number" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Currency</label>
                  <select {...registerEdit('currency', { defaultValue: showEditModal.currency })} className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none cursor-pointer">
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Pipeline</label>
                  <input {...registerEdit('pipeline', { defaultValue: showEditModal.pipeline })} type="text" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Stage</label>
                  <select {...registerEdit('stage', { defaultValue: showEditModal.stage })} className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none cursor-pointer">
                    {stages.map(stg => (
                      <option key={stg} value={stg}>{stg.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Priority</label>
                  <select {...registerEdit('priority', { defaultValue: showEditModal.priority })} className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none cursor-pointer">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Expected Close Date</label>
                  <input 
                    {...registerEdit('expectedCloseDate', { 
                      defaultValue: showEditModal.expectedCloseDate ? new Date(showEditModal.expectedCloseDate).toISOString().split('T')[0] : ''
                    })} 
                    type="date" 
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-gray-700" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Salesperson Assigned</label>
                  <select {...registerEdit('assignedSalesPerson', { defaultValue: showEditModal.assignedSalesPerson?._id || showEditModal.assignedSalesPerson })} className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none cursor-pointer">
                    <option value="">Assign to Me</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp.user?._id || emp.user}>
                        {emp.user?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Lead Source</label>
                  <input {...registerEdit('leadSource', { defaultValue: showEditModal.leadSource })} type="text" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Pipeline Status</label>
                  <select {...registerEdit('status', { defaultValue: showEditModal.status })} className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none cursor-pointer">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Description / Scope Details</label>
                <textarea {...registerEdit('description', { defaultValue: showEditModal.description })} rows={3} className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-[11px]"></textarea>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4 rounded-b-xl">
                <button type="button" onClick={() => setShowEditModal(null)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="bg-[#2563eb] text-white px-4 py-2 rounded-lg font-semibold cursor-pointer">Update Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-lg overflow-hidden my-8">
            <div className="p-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[8px] font-bold border border-blue-200 mr-2 uppercase tracking-wide">
                  {showDetailsModal.dealCode}
                </span>
                <span className="text-xs font-bold text-gray-900">Deal Details Card</span>
              </div>
              <button onClick={() => setShowDetailsModal(null)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 leading-tight">{showDetailsModal.title}</h3>
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{showDetailsModal.pipeline || 'Standard Sales Pipeline'}</div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-[11px] pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Associated Customer</div>
                  <div className="font-semibold text-gray-800">{showDetailsModal.customer?.customerName || 'None'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Company Name</div>
                  <div className="font-semibold text-gray-800">{showDetailsModal.company || showDetailsModal.customer?.companyName || 'Private Client'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Deal Value</div>
                  <div className="font-bold text-blue-600 text-xs">
                    {showDetailsModal.currency === 'EUR' ? '€' : showDetailsModal.currency === 'GBP' ? '£' : '₹'}
                    {(showDetailsModal.amount || 0).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Current Pipeline Stage</div>
                  <div className="font-semibold text-gray-800 uppercase">{showDetailsModal.stage?.replace('_', ' ')}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Deal Priority</div>
                  <div className="font-semibold text-gray-800">{showDetailsModal.priority || 'MEDIUM'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Assigned Salesperson</div>
                  <div className="font-semibold text-gray-800">{showDetailsModal.assignedSalesPerson?.name || 'Unassigned'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Expected Close Date</div>
                  <div className="font-semibold text-gray-800">
                    {showDetailsModal.expectedCloseDate ? new Date(showDetailsModal.expectedCloseDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Lead Source</div>
                  <div className="font-semibold text-gray-800">{showDetailsModal.leadSource || 'Direct Outreach'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Pipeline status</div>
                  <div className="font-semibold text-gray-800">{showDetailsModal.status || 'ACTIVE'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Last Activity Time</div>
                  <div className="font-semibold text-gray-800">
                    {showDetailsModal.lastActivity ? new Date(showDetailsModal.lastActivity).toLocaleString() : 'Just Now'}
                  </div>
                </div>
              </div>

              {showDetailsModal.description && (
                <div className="space-y-1.5 pt-4 border-t border-gray-100">
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Description details</div>
                  <p className="bg-slate-50 border border-gray-200 rounded-lg p-3 text-gray-700 leading-relaxed font-semibold">
                    {showDetailsModal.description}
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
              {['PROPOSAL', 'NEGOTIATION'].includes(showDetailsModal.stage) && (
                <button onClick={() => { startQuotationFlow(showDetailsModal); setShowDetailsModal(null); }} className="px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg font-bold cursor-pointer">
                  Create Quotation
                </button>
              )}
              {showDetailsModal.stage === 'CLOSED_WON' && (
                <button onClick={() => { startInvoiceFlow(showDetailsModal); setShowDetailsModal(null); }} className="px-3.5 py-2 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded-lg font-bold cursor-pointer">
                  Create Invoice
                </button>
              )}
              <button onClick={() => setShowDetailsModal(null)} className="px-4 py-2 border border-gray-250 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Schedule CRM Meeting</h3>
              <button onClick={() => setShowMeetingModal(null)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmitMeeting(onMeetingSubmit)} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Meeting Subject</label>
                <input {...registerMeeting('meetingSubject', { required: true })} type="text" placeholder="e.g. Contract Discussion" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Scheduled Date & Time</label>
                <input {...registerMeeting('meetingDate', { required: true })} type="datetime-local" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-gray-700" />
              </div>
              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4 rounded-b-xl">
                <button type="button" onClick={() => setShowMeetingModal(null)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="bg-[#2563eb] text-white px-4 py-2 rounded-lg font-semibold cursor-pointer">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NOTE MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Add Deal Activity Note</h3>
              <button onClick={() => setShowNoteModal(null)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmitNote(onNoteSubmit)} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase font-semibold">Note Description</label>
                <textarea {...registerNote('noteText', { required: true })} rows={4} placeholder="Type notes here..." className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-[11px]"></textarea>
              </div>
              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4 rounded-b-xl">
                <button type="button" onClick={() => setShowNoteModal(null)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="bg-[#2563eb] text-white px-4 py-2 rounded-lg font-semibold cursor-pointer">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Upload Attachments</h3>
              <button onClick={() => setShowUploadModal(null)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleFileUpload} className="p-5 space-y-4">
              <div className="space-y-2 border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400">
                <FileUp className="w-8 h-8 text-gray-300 mb-1" />
                <span className="text-[10px] font-semibold">Drag & drop files or click to choose</span>
                <input type="file" className="hidden" id="deal-file-upload" />
                <label htmlFor="deal-file-upload" className="px-3 py-1 bg-slate-50 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-md font-bold text-[9px] cursor-pointer mt-2">Select File</label>
              </div>
              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4 rounded-b-xl">
                <button type="button" onClick={() => setShowUploadModal(null)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="bg-[#2563eb] text-white px-4 py-2 rounded-lg font-semibold cursor-pointer">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DealManager;
