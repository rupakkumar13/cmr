import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from '../../../store/notificationsSlice.js';
import { X, Check, CheckCircle2, Trash2, Bell, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const NotificationDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);
  const [filterUnread, setFilterUnread] = useState(false);

  if (!isOpen) return null;

  const displayList = filterUnread ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-xs text-gray-700">
      {/* Backdrop overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-black/35 backdrop-blur-xs transition-opacity"></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-sm bg-white shadow-2xl border-l border-gray-200 flex flex-col h-full animate-slide-in">
          {/* Drawer Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#2563eb]" />
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Notifications Panel</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Bar */}
          <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between gap-2">
            <div className="flex border rounded overflow-hidden">
              <button
                onClick={() => setFilterUnread(false)}
                className={`px-3 py-1 font-semibold cursor-pointer ${!filterUnread ? 'bg-[#2563eb] text-white font-bold' : 'bg-white hover:bg-gray-50'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterUnread(true)}
                className={`px-3 py-1 font-semibold cursor-pointer ${filterUnread ? 'bg-[#2563eb] text-white font-bold' : 'bg-white hover:bg-gray-50'}`}
              >
                Unread
              </button>
            </div>

            <button
              onClick={() => dispatch(markAllNotificationsRead())}
              className="text-[10px] font-bold text-[#2563eb] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Mark all read
            </button>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto p-3 divide-y divide-gray-100">
            {displayList.length === 0 ? (
              <div className="py-24 text-center text-gray-400 font-medium">
                No alerts mapped inside this filter.
              </div>
            ) : (
              displayList.map((item) => {
                const Icon = item.type === 'SUCCESS' ? CheckCircle2 
                            : item.type === 'WARNING' ? AlertTriangle 
                            : item.type === 'ERROR' ? AlertCircle 
                            : Info;
                
                const typeColor = item.type === 'SUCCESS' ? 'text-green-600 bg-green-50'
                                : item.type === 'WARNING' ? 'text-yellow-600 bg-yellow-50'
                                : item.type === 'ERROR' ? 'text-red-650 bg-red-50'
                                : 'text-blue-600 bg-blue-50';

                return (
                  <div key={item._id} className={`py-3 flex gap-3 transition-colors ${!item.isRead ? 'bg-blue-50/20 px-2 rounded-lg' : ''}`}>
                    {/* Visual Indicator Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                        <span className="text-[9px] text-gray-400 font-medium shrink-0">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-500 text-[11px] leading-relaxed">{item.message}</p>
                      
                      {/* Action buttons */}
                      <div className="flex justify-end gap-2.5 pt-1.5">
                        {!item.isRead && (
                          <button
                            onClick={() => dispatch(markNotificationRead(item._id))}
                            className="text-[10px] text-gray-400 hover:text-green-600 font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Check className="w-3 h-3" /> Read
                          </button>
                        )}
                        <button
                          onClick={() => dispatch(deleteNotification(item._id))}
                          className="text-[10px] text-gray-405 hover:text-red-650 font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
