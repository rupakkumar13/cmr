import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateLead, convertLead, fetchActivities } from '../../../store/crmSlice.js';
import { Loader2, ArrowLeft, Mail, Phone, Globe, Calendar, User, FileText, Check, ShieldAlert, Award } from 'lucide-react';
import ActivityTimeline from './ActivityTimeline.jsx';
import api from '../../../services/api.js';

const LeadDetail = ({ leadId, onBack }) => {
  const dispatch = useDispatch();
  const { activities, loading } = useSelector((state) => state.crm);

  const [lead, setLead] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [convertSuccess, setConvertSuccess] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    loadLeadDetails();
  }, [leadId]);

  const loadLeadDetails = async () => {
    try {
      const res = await api.get(`/api/v1/leads/${leadId}`);
      setLead(res.data.data.lead);
      dispatch(fetchActivities(leadId));
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Failed to retrieve lead data');
    }
  };

  const handleUpdateStatus = async (status) => {
    setBtnLoading(true);
    try {
      const result = await dispatch(updateLead({ id: leadId, data: { status } }));
      if (updateLead.fulfilled.match(result)) {
        setLead(result.payload);
        dispatch(fetchActivities(leadId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleConvert = async () => {
    if (window.confirm('Convert this lead to a Customer account? This creates a new Customer registry sequentially.')) {
      setBtnLoading(true);
      const result = await dispatch(convertLead(leadId));
      if (convertLead.fulfilled.match(result)) {
        setConvertSuccess(true);
        loadLeadDetails();
      } else {
        alert(result.payload || 'Conversion failed.');
      }
      setBtnLoading(false);
    }
  };

  if (loadError) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2 shadow-sm">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <span>{loadError}</span>
        <button onClick={onBack} className="underline font-semibold ml-auto cursor-pointer transition-colors duration-150 hover:text-red-900">Back to Pipeline</button>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div>
        <button
          onClick={onBack}
          className="btn-ghost inline-flex items-center gap-2 cursor-pointer transition-all duration-150"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pipeline
        </button>
      </div>

      {/* Main card */}
      <div className="stat-card flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <h2 className="page-title">{lead.leadName}</h2>
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border transition-colors duration-150 ${
              lead.convertedToCustomer 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}>
              {lead.convertedToCustomer ? 'CONVERTED TO CUSTOMER' : lead.status}
            </span>
          </div>

          <p className="text-sm text-indigo-600 font-semibold">{lead.companyName || 'Private Client'}</p>
          <p className="text-xs text-slate-400 font-medium">Lead Code: <span className="text-slate-700 font-semibold">{lead.leadCode}</span></p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm text-slate-600 font-medium">
            <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" />{lead.email || 'N/A'}</p>
            <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" />{lead.phone || 'N/A'}</p>
            <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-slate-400" />{lead.website || 'N/A'}</p>
            <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" />Source: {lead.source}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-3 w-full md:w-56 shrink-0 pt-4 md:pt-0">
          {!lead.convertedToCustomer && (
            <>
              <button
                onClick={handleConvert}
                disabled={btnLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Award className="w-4 h-4" /> Convert to Customer
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <div className="space-y-2">
                <label className="saas-label">Update Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus('CONTACTED')}
                    disabled={btnLoading}
                    className="py-2 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer transition-all duration-150"
                  >
                    Contacted
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('LOST')}
                    disabled={btnLoading}
                    className="py-2 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-red-50 hover:border-red-200 text-red-600 cursor-pointer transition-all duration-150"
                  >
                    Mark Lost
                  </button>
                </div>
              </div>
            </>
          )}

          {lead.convertedToCustomer && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-semibold space-y-1 shadow-sm">
              <p>Lead converted successfully.</p>
              <p>Customer Code: {lead.convertedCustomer?.customerCode}</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 stat-card space-y-4">
          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-3">
            Lead Activity Timeline
          </h3>
          <ActivityTimeline activities={activities} />
        </div>

        {/* Notes sidebar */}
        <div className="stat-card h-fit space-y-3">
          <h4 className="saas-label uppercase tracking-wider">Additional Notes</h4>
          <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50/80 border border-slate-200/80 p-4 rounded-xl min-h-16">
            {lead.notes || 'No description notes provided for this lead.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
