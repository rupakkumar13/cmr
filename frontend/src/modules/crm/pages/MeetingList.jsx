import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeetings, createMeeting, fetchCustomers, fetchLeads } from '../../../store/crmSlice.js';
import { Loader2, Plus, Calendar, MapPin, Video, User, Timer, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

const MeetingList = () => {
  const dispatch = useDispatch();
  const { meetings, customers, leads, loading } = useSelector((state) => state.crm);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [meetError, setMeetError] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchMeetings());
    dispatch(fetchCustomers());
    dispatch(fetchLeads());
  }, [dispatch]);

  const onAddSubmit = async (data) => {
    setMeetError(null);
    const payload = {
      title: data.title,
      customer: data.customer || undefined,
      lead: data.lead || undefined,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
      participants: data.participants ? data.participants.split(',').map(p => p.trim()) : [],
      location: data.location,
      description: data.description
    };

    const result = await dispatch(createMeeting(payload));
    if (createMeeting.fulfilled.match(result)) {
      setShowModal(false);
      reset();
      dispatch(fetchMeetings());
    } else {
      setMeetError(result.payload || 'Failed to schedule meeting');
    }
  };

  return (
    <div className="space-y-6 text-xs text-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">CRM Meetings</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Schedule and audit client alignment calls and conferences</p>
        </div>

        <button
          onClick={() => {
            setMeetError(null);
            setShowModal(true);
          }}
          className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      {/* Grid list display */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-12 rounded-lg text-gray-500 text-xs font-medium">
          No scheduled meetings configured in the CRM scheduler.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {meetings.map((meet) => (
            <div key={meet._id} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm space-y-4">
              <div className="flex justify-between items-start gap-2 border-b pb-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{meet.title}</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    Client: <span className="text-blue-600 font-bold">{meet.customer?.companyName || meet.lead?.companyName || 'Private Client'}</span>
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                  meet.status === 'HELD' 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  {meet.status}
                </span>
              </div>

              <div className="space-y-2 text-gray-600 font-medium">
                <p className="flex items-center gap-1.5"><Timer className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {new Date(meet.startTime).toLocaleString()} - {new Date(meet.endTime).toLocaleTimeString()}
                </p>
                
                {meet.location && (
                  <p className="flex items-center gap-1.5 text-gray-500">
                    <Video className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate max-w-56">{meet.location}</span>
                  </p>
                )}

                <p className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  Host: <span className="text-gray-900 font-bold">{meet.host?.name}</span>
                </p>
              </div>

              <p className="text-[11px] text-gray-500 italic bg-[#f8f9fa] border border-gray-150 p-2.5 rounded min-h-10 leading-normal">
                {meet.description || 'No meeting objective notes provided.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Schedule Meeting</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmit(onAddSubmit)} className="p-5 space-y-4">
              {meetError && <p className="text-red-700 font-bold">{meetError}</p>}
              
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meeting Title</label>
                <input
                  {...register('title', { required: 'Meeting title is required' })}
                  type="text"
                  placeholder="e.g. Sales Alignment Call"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Associate Customer</label>
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

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Associate Lead</label>
                  <select
                    {...register('lead')}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                  >
                    <option value="">Unassigned...</option>
                    {leads.map(l => (
                      <option key={l._id} value={l._id}>{l.leadName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Start Time</label>
                  <input
                    {...register('startTime', { required: 'Start time is required' })}
                    type="datetime-local"
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-gray-750"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">End Time</label>
                  <input
                    {...register('endTime', { required: 'End time is required' })}
                    type="datetime-local"
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-gray-750"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Location / Call URL</label>
                <input
                  {...register('location')}
                  type="text"
                  placeholder="e.g. Google Meet Link"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea
                  {...register('description')}
                  placeholder="Detail objective of the sync..."
                  rows="2.5"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                ></textarea>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg font-semibold cursor-pointer">Schedule Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingList;
