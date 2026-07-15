import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clockIn, clockOut, fetchMyAttendance, fetchLeaves } from '../../../store/hrSlice.js';
import { Loader2, AlertCircle, Play, Square, Calendar, Timer, User } from 'lucide-react';
import api from '../../../services/api.js';

const AttendanceLogs = () => {
  const dispatch = useDispatch();
  const { attendanceLogs: logs, loading, error } = useSelector((state) => state.hr);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [allLogs, setAllLogs] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [clockError, setClockError] = useState(null);

  // Checks if user is currently clocked in (today's record has checkOut: null)
  const todayStr = new Date().toISOString().split('T')[0];
  const activeSession = logs.find(log => log.date === todayStr && log.checkOut === null);
  const alreadyClockedOutToday = logs.find(log => log.date === todayStr && log.checkOut !== null);

  useEffect(() => {
    dispatch(fetchMyAttendance());
    if (['ADMIN', 'HR', 'MANAGER'].includes(currentUser?.role)) {
      fetchAllLogs();
    }
  }, [dispatch, currentUser]);

  const fetchAllLogs = async () => {
    setAdminLoading(true);
    try {
      const res = await api.get('/api/v1/hr/attendance');
      setAllLogs(res.data.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleClockIn = async () => {
    setClockError(null);
    const resultAction = await dispatch(clockIn());
    if (clockIn.rejected.match(resultAction)) {
      setClockError(resultAction.payload || 'Failed to clock in');
    } else {
      if (['ADMIN', 'HR', 'MANAGER'].includes(currentUser?.role)) {
        fetchAllLogs();
      }
    }
  };

  const handleClockOut = async () => {
    setClockError(null);
    const resultAction = await dispatch(clockOut());
    if (clockOut.rejected.match(resultAction)) {
      setClockError(resultAction.payload || 'Failed to clock out');
    } else {
      if (['ADMIN', 'HR', 'MANAGER'].includes(currentUser?.role)) {
        fetchAllLogs();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Attendance Log Board</h2>
        <p className="text-xs text-gray-500 font-medium mt-1">Register work hours and audit team check-in status logs</p>
      </div>

      {clockError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{clockError}</span>
        </div>
      )}

      {/* Clock Controls Card */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-base font-bold text-gray-900">Daily Attendance Registry</h3>
          <p className="text-xs text-gray-500 font-medium">
            {alreadyClockedOutToday 
              ? 'You have completed your work session for today.' 
              : activeSession 
              ? `Session active since ${new Date(activeSession.checkIn).toLocaleTimeString()}`
              : 'Start your shift by clocking in.'}
          </p>
        </div>

        <div className="flex gap-4 w-full sm:w-auto shrink-0">
          <button
            onClick={handleClockIn}
            disabled={loading || !!activeSession || !!alreadyClockedOutToday}
            className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 disabled:bg-gray-100 disabled:text-gray-400 border disabled:border-gray-200 text-white rounded-lg px-6 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Play className="w-3.5 h-3.5" /> Clock In
          </button>
          <button
            onClick={handleClockOut}
            disabled={loading || !activeSession}
            className="flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-700 disabled:bg-gray-100 disabled:text-gray-400 border disabled:border-gray-200 text-white rounded-lg px-6 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Square className="w-3.5 h-3.5" /> Clock Out
          </button>
        </div>
      </div>

      {/* Detail logs section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Self Logs */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700">
            My Clock Logs History
          </div>
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-xs font-medium">No clock logs found.</div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div key={log._id} className="p-4 flex items-center justify-between text-xs font-medium text-gray-700 hover:bg-gray-50">
                  <div className="space-y-1">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {log.date}
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5" />
                      In: {new Date(log.checkIn).toLocaleTimeString()} {log.checkOut ? `| Out: ${new Date(log.checkOut).toLocaleTimeString()}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {log.workHours > 0 && <span className="text-[10px] text-slate-500">{log.workHours} hrs</span>}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      log.status === 'PRESENT' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : log.status === 'LATE' 
                        ? 'bg-amber-50 border-amber-200 text-amber-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Admin view of team logs */}
        {['ADMIN', 'HR', 'MANAGER'].includes(currentUser?.role) && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700">
              Team Clock Logs (Audit view)
            </div>
            {adminLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : allLogs.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs font-medium">No clock logs compiled today.</div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {allLogs.map((log) => (
                  <div key={log._id} className="p-4 flex items-center justify-between text-xs font-medium text-gray-700 hover:bg-gray-50">
                    <div className="space-y-1">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {log.employee?.user?.name || 'Unknown User'}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Date: {log.date} | In: {new Date(log.checkIn).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {log.workHours > 0 && <span className="text-[10px] text-slate-500">{log.workHours} hrs</span>}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        log.status === 'PRESENT' 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : log.status === 'LATE' 
                          ? 'bg-amber-50 border-amber-200 text-amber-700' 
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceLogs;
