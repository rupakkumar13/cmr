import React from 'react';
import { Calendar, User, Clock, ArrowRightLeft, FileText, CheckCircle2 } from 'lucide-react';

const ActivityTimeline = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="empty-state py-8">
        No historical activities recorded for this account timeline.
      </div>
    );
  }

  const getIcon = (action) => {
    switch (action) {
      case 'CREATED':
      case 'FOLLOWUP_CREATED':
        return <FileText className="w-3.5 h-3.5 text-indigo-600" />;
      case 'STAGE_CHANGED':
      case 'DEAL_ADDED':
      case 'DEAL_UPDATED':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />;
      case 'MEETING_SCHEDULED':
      case 'MEETING_UPDATED':
        return <Calendar className="w-3.5 h-3.5 text-violet-600" />;
      case 'FOLLOWUP_COMPLETED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getBg = (action) => {
    switch (action) {
      case 'CREATED':
      case 'FOLLOWUP_CREATED':
        return 'bg-indigo-50 border-indigo-200';
      case 'STAGE_CHANGED':
      case 'DEAL_ADDED':
      case 'DEAL_UPDATED':
        return 'bg-amber-50 border-amber-200';
      case 'MEETING_SCHEDULED':
      case 'MEETING_UPDATED':
        return 'bg-violet-50 border-violet-200';
      case 'FOLLOWUP_COMPLETED':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 text-sm text-slate-700 ml-4 py-2">
      {activities.map((act) => (
        <div key={act._id} className="relative transition-all duration-150">
          {/* Visual Indicator Icon pin */}
          <span className={`absolute -left-[35px] top-0.5 w-6 h-6 rounded-full border flex items-center justify-center shadow-sm transition-all duration-150 ${getBg(act.action)}`}>
            {getIcon(act.action)}
          </span>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold uppercase tracking-wide text-xs text-slate-500">
                {act.action.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {new Date(act.createdAt).toLocaleString()}
              </span>
            </div>
            
            <p className="font-medium text-slate-700">{act.description}</p>
            
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <User className="w-3 h-3" />
              Performed by: <span className="text-slate-600 font-semibold">{act.performedBy?.name || 'System'}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
