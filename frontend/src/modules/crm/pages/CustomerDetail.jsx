import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerById, updateCustomer, fetchActivities, createDeal, createMeeting, createFollowUp } from '../../../store/crmSlice.js';
import { Loader2, ArrowLeft, Mail, Phone, Globe, Calendar, User, FileText, Check, ShieldAlert, Award, Layers, Plus, Timer, CheckSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import ActivityTimeline from './ActivityTimeline.jsx';
import api from '../../../services/api.js';

const CustomerDetail = ({ customerId, onBack }) => {
  const dispatch = useDispatch();
  const { selectedCustomer: customer, activities, loading } = useSelector((state) => state.crm);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [activeSubTab, setActiveSubTab] = useState('timeline');
  const [deals, setDeals] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [followups, setFollowups] = useState([]);

  // Forms modals states
  const [showDealModal, setShowDealModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);

  const [dealError, setDealError] = useState(null);
  const [meetError, setMeetError] = useState(null);
  const [followError, setFollowError] = useState(null);

  const { register: registerDeal, handleSubmit: handleSubmitDeal, reset: resetDeal } = useForm();
  const { register: registerMeet, handleSubmit: handleSubmitMeet, reset: resetMeet } = useForm();
  const { register: registerFollow, handleSubmit: handleSubmitFollow, reset: resetFollow } = useForm();

  useEffect(() => {
    dispatch(fetchCustomerById(customerId));
    dispatch(fetchActivities(customerId));
    loadCustomerSubrecords();
  }, [dispatch, customerId]);

  const loadCustomerSubrecords = async () => {
    try {
      const dealsRes = await api.get('/api/v1/deals', { params: { customer: customerId } });
      setDeals(dealsRes.data.data.deals || []);

      const meetsRes = await api.get('/api/v1/meetings', { params: { customer: customerId } });
      setMeetings(meetsRes.data.data.meetings || []);

      const followsRes = await api.get('/api/v1/followups', { params: { customer: customerId } });
      setFollowups(followsRes.data.data.followUps || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (status) => {
    await dispatch(updateCustomer({ id: customerId, data: { status } }));
    dispatch(fetchCustomerById(customerId));
    dispatch(fetchActivities(customerId));
  };

  const onAddDeal = async (data) => {
    setDealError(null);
    const payload = {
      title: data.title,
      customer: customerId,
      amount: Number(data.amount),
      stage: data.stage,
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate).toISOString() : undefined,
      assignedSalesPerson: currentUser.id || currentUser._id
    };

    const result = await dispatch(createDeal(payload));
    if (createDeal.fulfilled.match(result)) {
      setShowDealModal(false);
      resetDeal();
      loadCustomerSubrecords();
      dispatch(fetchActivities(customerId));
    } else {
      setDealError(result.payload || 'Failed to create deal.');
    }
  };

  const onAddMeeting = async (data) => {
    setMeetError(null);
    const payload = {
      title: data.title,
      customer: customerId,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
      participants: data.participants ? data.participants.split(',').map(p => p.trim()) : [],
      location: data.location,
      description: data.description
    };

    const result = await dispatch(createMeeting(payload));
    if (createMeeting.fulfilled.match(result)) {
      setShowMeetingModal(false);
      resetMeet();
      loadCustomerSubrecords();
      dispatch(fetchActivities(customerId));
    } else {
      setMeetError(result.payload || 'Failed to schedule meeting.');
    }
  };

  const onAddFollowUp = async (data) => {
    setFollowError(null);
    const payload = {
      title: data.title,
      customer: customerId,
      dueDate: new Date(data.dueDate).toISOString(),
      priority: data.priority,
      assignedTo: currentUser.id || currentUser._id,
      notes: data.notes
    };

    const result = await dispatch(createFollowUp(payload));
    if (createFollowUp.fulfilled.match(result)) {
      setShowFollowModal(false);
      resetFollow();
      loadCustomerSubrecords();
      dispatch(fetchActivities(customerId));
    } else {
      setFollowError(result.payload || 'Failed to schedule follow-up.');
    }
  };

  if (!customer) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs text-gray-700">
      {/* Navigation */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
      </div>

      {/* Main card */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{customer.customerName}</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-green-50 border-green-200 text-green-700">
              {customer.status}
            </span>
          </div>

          <p className="text-xs text-blue-600 font-bold">{customer.companyName}</p>
          <p className="text-[10px] text-gray-400 font-semibold">Customer Code: <span className="text-gray-700">{customer.customerCode}</span></p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-xs text-gray-600 font-medium">
            <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" />{customer.email || 'N/A'}</p>
            <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" />{customer.phone || 'N/A'}</p>
            <p className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-gray-400" />{customer.website || 'N/A'}</p>
            <p className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-gray-400" />Industry: {customer.industry || 'Unassigned'}</p>
          </div>
        </div>

        {/* Status updates */}
        <div className="flex flex-col gap-2 w-full md:w-56 shrink-0 pt-4 md:pt-0">
          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Account Operations</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleUpdateStatus('ACTIVE')}
              className="py-1 border border-gray-200 text-[10px] font-bold rounded hover:bg-gray-50 text-green-600 cursor-pointer"
            >
              Set Active
            </button>
            <button
              onClick={() => handleUpdateStatus('INACTIVE')}
              className="py-1 border border-gray-200 text-[10px] font-bold rounded hover:bg-gray-50 text-gray-500 cursor-pointer"
            >
              Set Inactive
            </button>
          </div>
          <div className="border border-gray-200 rounded p-2.5 bg-gray-50 font-medium text-gray-500 space-y-1">
            <div className="font-bold text-gray-700 text-[10px] uppercase">Billing Address</div>
            <div>{customer.billingAddress?.street || 'No street'}</div>
            <div>{customer.billingAddress?.city}, {customer.billingAddress?.state} {customer.billingAddress?.zipCode}</div>
            <div>{customer.billingAddress?.country}</div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 text-xs font-semibold text-gray-500 gap-1">
        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'timeline' ? 'border-[#2563eb] text-gray-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Activity Timeline
        </button>
        <button
          onClick={() => setActiveSubTab('deals')}
          className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'deals' ? 'border-[#2563eb] text-gray-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Deals ({deals.length})
        </button>
        <button
          onClick={() => setActiveSubTab('meetings')}
          className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'meetings' ? 'border-[#2563eb] text-gray-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Meetings ({meetings.length})
        </button>
        <button
          onClick={() => setActiveSubTab('followups')}
          className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'followups' ? 'border-[#2563eb] text-gray-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Follow Ups ({followups.length})
        </button>
      </div>

      {/* Tab bodies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-5 min-h-[300px]">
          {activeSubTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Historical timeline</h3>
              <ActivityTimeline activities={activities} />
            </div>
          )}

          {activeSubTab === 'deals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 mb-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Associated Deals</h3>
                <button
                  onClick={() => setShowDealModal(true)}
                  className="px-2.5 py-1 text-[10px] font-bold border border-[#2563eb] text-[#2563eb] rounded hover:bg-blue-50 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Deal
                </button>
              </div>

              {deals.length === 0 ? (
                <p className="text-gray-500 font-medium py-4 text-center">No active deals mapped for this customer.</p>
              ) : (
                <div className="divide-y divide-gray-150">
                  {deals.map(d => (
                    <div key={d._id} className="py-2.5 flex justify-between items-center font-semibold text-gray-700">
                      <div>
                        <div className="text-gray-900 font-bold">{d.title}</div>
                        <div className="text-[10px] text-gray-400">{d.dealCode} | Expected close: {d.expectedCloseDate ? new Date(d.expectedCloseDate).toLocaleDateString() : 'N/A'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-600 font-bold">₹{d.amount}</div>
                        <span className="text-[9px] font-bold uppercase text-gray-400">{d.stage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'meetings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 mb-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Meetings List</h3>
                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="px-2.5 py-1 text-[10px] font-bold border border-[#2563eb] text-[#2563eb] rounded hover:bg-blue-50 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Schedule Meeting
                </button>
              </div>

              {meetings.length === 0 ? (
                <p className="text-gray-500 font-medium py-4 text-center">No meetings scheduled.</p>
              ) : (
                <div className="divide-y divide-gray-150">
                  {meetings.map(m => (
                    <div key={m._id} className="py-2.5 flex justify-between items-center font-semibold text-gray-700">
                      <div>
                        <div className="text-gray-900 font-bold">{m.title}</div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(m.startTime).toLocaleString()} - {new Date(m.endTime).toLocaleTimeString()}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">{m.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'followups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 mb-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Follow Up Reminders</h3>
                <button
                  onClick={() => setShowFollowModal(true)}
                  className="px-2.5 py-1 text-[10px] font-bold border border-[#2563eb] text-[#2563eb] rounded hover:bg-blue-50 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Task
                </button>
              </div>

              {followups.length === 0 ? (
                <p className="text-gray-500 font-medium py-4 text-center">No pending reminders.</p>
              ) : (
                <div className="divide-y divide-gray-150">
                  {followups.map(f => (
                    <div key={f._id} className="py-2.5 flex justify-between items-center font-semibold text-gray-700">
                      <div>
                        <div className="text-gray-900 font-bold">{f.title}</div>
                        <div className="text-[10px] text-gray-400">Due: {new Date(f.dueDate).toLocaleString()}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        f.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>{f.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes side info bar */}
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm h-fit space-y-4">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account Notes</h4>
          <p className="text-xs text-gray-600 font-medium leading-relaxed bg-[#f8f9fa] border border-gray-200 p-3 rounded-lg min-h-16">
            {customer.notes || 'No notes records written.'}
          </p>
        </div>
      </div>

      {/* CREATE DEAL MODAL */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Add Deal</h3>
              <button onClick={() => setShowDealModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmitDeal(onAddDeal)} className="p-5 space-y-4">
              {dealError && <p className="text-red-600 font-semibold">{dealError}</p>}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Deal Title</label>
                <input
                  {...registerDeal('title', { required: true })}
                  type="text"
                  placeholder="e.g. Server Renewal"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Amount (₹)</label>
                <input
                  {...registerDeal('amount', { required: true, valueAsNumber: true })}
                  type="number"
                  placeholder="1000"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expected Close Date</label>
                <input
                  {...registerDeal('expectedCloseDate')}
                  type="date"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Deal Stage</label>
                <select
                  {...registerDeal('stage')}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                >
                  <option value="QUALIFICATION">QUALIFICATION</option>
                  <option value="PROPOSAL">PROPOSAL</option>
                  <option value="NEGOTIATION">NEGOTIATION</option>
                </select>
              </div>
              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setShowDealModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg font-semibold cursor-pointer">Create Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Schedule Meeting</h3>
              <button onClick={() => setShowMeetingModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmitMeet(onAddMeeting)} className="p-5 space-y-4">
              {meetError && <p className="text-red-600 font-semibold">{meetError}</p>}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Title</label>
                <input
                  {...registerMeet('title', { required: true })}
                  type="text"
                  placeholder="e.g. Alignment Call"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Start Time</label>
                  <input
                    {...registerMeet('startTime', { required: true })}
                    type="datetime-local"
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">End Time</label>
                  <input
                    {...registerMeet('endTime', { required: true })}
                    type="datetime-local"
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-gray-700"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Participants (Emails, comma separated)</label>
                <input
                  {...registerMeet('participants')}
                  type="text"
                  placeholder="tony@stark.com, sales@stark.com"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Location / Call URL</label>
                <input
                  {...registerMeet('location')}
                  type="text"
                  placeholder="Google Meet Link"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea
                  {...registerMeet('description')}
                  rows="2"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                ></textarea>
              </div>
              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setShowMeetingModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg font-semibold cursor-pointer">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE FOLLOW UP MODAL */}
      {showFollowModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Create Follow Up Task</h3>
              <button onClick={() => setShowFollowModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmitFollow(onAddFollowUp)} className="p-5 space-y-4">
              {followError && <p className="text-red-600 font-semibold">{followError}</p>}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Task Title</label>
                <input
                  {...registerFollow('title', { required: true })}
                  type="text"
                  placeholder="e.g. Send updated pricing brochure"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Due Date</label>
                <input
                  {...registerFollow('dueDate', { required: true })}
                  type="datetime-local"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Priority</label>
                <select
                  {...registerFollow('priority')}
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
                  {...registerFollow('notes')}
                  rows="2"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                ></textarea>
              </div>
              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setShowFollowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg font-semibold cursor-pointer">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
