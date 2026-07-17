import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeById } from '../../../store/hrSlice.js';
import { Loader2, ArrowLeft, Mail, Shield, User, Calendar, MapPin, Phone, AlertCircle, FileText, Upload, Plus } from 'lucide-react';
import api from '../../../services/api.js';

const EmployeeDetail = ({ employeeId, onBack }) => {
  const dispatch = useDispatch();
  const { selectedEmployee: emp, loading, error } = useSelector((state) => state.hr);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [leaves, setLeaves] = useState([]);
  
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployeeById(employeeId));
  }, [dispatch, employeeId]);

  // Load contextual sub-data (attendance, payslips, leaves) for this specific employee
  useEffect(() => {
    const fetchSubData = async () => {
      try {
        const attRes = await api.get(`/api/v1/hr/attendance/employee/${employeeId}`);
        setAttendance(attRes.data.data.logs || []);

        const payRes = await api.get(`/api/v1/hr/payroll/employee/${employeeId}`);
        setPayroll(payRes.data.data.payslips || []);

        // Filter leave requests safely based on user privileges
        let leavesList = [];
        const isPrivileged = ['ADMIN', 'HR'].includes(currentUser?.role);
        if (isPrivileged) {
          const leaveRes = await api.get('/api/v1/hr/leaves');
          const allLeaves = leaveRes.data.data.leaves || [];
          leavesList = allLeaves.filter(l => l.employee?._id === employeeId);
        } else {
          const leaveRes = await api.get('/api/v1/hr/leaves/my-leaves');
          leavesList = leaveRes.data.data.leaves || [];
        }
        setLeaves(leavesList);
      } catch (err) {
        console.error('Failed to load employee contextual history sub-records:', err);
      }
    };

    if (emp) {
      fetchSubData();
    }
  }, [emp, employeeId, currentUser]);

  const handleDocUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(false);

    if (!docName || !docUrl) {
      setUploadError('Document name and secure url are required.');
      return;
    }

    try {
      await api.post(`/api/v1/hr/employees/${employeeId}/documents`, {
        name: docName,
        url: docUrl
      });
      setUploadSuccess(true);
      setDocName('');
      setDocUrl('');
      // Reload profile
      dispatch(fetchEmployeeById(employeeId));
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to attach document.');
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !emp) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>{error || 'Employee profile details not available.'}</span>
        <button onClick={onBack} className="underline font-bold ml-auto cursor-pointer">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      {onBack && (
        <div className="mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </button>
        </div>
      )}

      {/* Main Profile Summary Card */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563eb] text-xl font-bold uppercase shrink-0">
            {emp.user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{emp.user?.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                emp.status === 'ACTIVE' 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {emp.status}
              </span>
            </div>
            <p className="text-xs text-blue-600 font-bold mt-0.5">{emp.designation}</p>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">Employee ID: <span className="text-gray-700">{emp.employeeId}</span></p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-4 text-xs text-gray-600 font-medium">
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" />{emp.user?.email}</p>
              <p className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-gray-400" />Role: {emp.user?.role}</p>
              <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />Joined: {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : 'N/A'}</p>
              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" />{emp.personalInfo?.address || 'Address unassigned'}</p>
            </div>
          </div>
        </div>

        {/* Emergency contact */}
        <div className="bg-[#f8f9fa] border border-gray-200 p-4 rounded-lg md:w-80 shrink-0 text-xs">
          <h4 className="font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-2 text-[10px] text-gray-500">
            Emergency Contact Details
          </h4>
          <div className="space-y-1.5 text-gray-700 font-medium">
            <p>Name: <span className="text-gray-900 font-bold">{emp.personalInfo?.emergencyContact?.name || 'N/A'}</span></p>
            <p>Relationship: <span className="text-gray-900 font-bold">{emp.personalInfo?.emergencyContact?.relationship || 'N/A'}</span></p>
            <p>Phone: <span className="text-gray-900 font-bold">{emp.personalInfo?.emergencyContact?.phone || 'N/A'}</span></p>
          </div>
        </div>
      </div>

      {/* Details Grid Tabs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attendance & Leaves History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance History */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700">
              Clock Logs History (Recent)
            </div>
            {attendance.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs font-medium">No clock logs recorded.</div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {attendance.map((log) => (
                  <div key={log._id} className="p-3 flex items-center justify-between text-xs font-medium text-gray-700">
                    <div className="space-y-0.5">
                      <div className="font-bold text-gray-900">{log.date}</div>
                      <div className="text-[10px] text-gray-400">
                        In: {new Date(log.checkIn).toLocaleTimeString()} {log.checkOut ? `| Out: ${new Date(log.checkOut).toLocaleTimeString()}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {log.workHours > 0 && <span className="text-slate-500 text-[10px]">{log.workHours} hrs</span>}
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

          {/* Leave Log */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700">
              Leave Requests Logs
            </div>
            {leaves.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs font-medium">No leave requests found.</div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {leaves.map((l) => (
                  <div key={l._id} className="p-3 flex items-start justify-between text-xs font-medium text-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{l.leaveType} LEAVE</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-500 text-[11px] font-medium italic">"{l.reason}"</p>
                      {l.comments && <p className="text-slate-400 text-[10px]">Comments: {l.comments}</p>}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      l.status === 'APPROVED' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : l.status === 'REJECTED' 
                        ? 'bg-red-50 border-red-200 text-red-700' 
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Documents and Payslips */}
        <div className="space-y-6">
          {/* Payslips */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700">
              Payslips / Payroll history
            </div>
            {payroll.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs font-medium">No payslips generated yet.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {payroll.map((slip) => (
                  <div key={slip._id} className="p-3 flex items-center justify-between text-xs font-medium text-gray-700">
                    <div className="space-y-0.5">
                      <div className="font-bold text-gray-900">Payslip - Month {slip.month}/{slip.year}</div>
                      <div className="text-[10px] text-slate-500 font-bold">Net Salary: ₹{slip.netSalary}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      slip.status === 'PAID' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {slip.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attached Files & Documents */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700">
              Employee Documents
            </div>
            
            {/* Document upload simulator form */}
            <form onSubmit={handleDocUploadSubmit} className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Simulate Cloudinary Upload</h4>
              
              {uploadError && <p className="text-red-600 text-[10px] font-bold">{uploadError}</p>}
              {uploadSuccess && <p className="text-green-600 text-[10px] font-bold">Document attached successfully!</p>}
              
              <div className="grid grid-cols-1 gap-2.5">
                <input
                  type="text"
                  placeholder="Document Name (e.g. CV.pdf)"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs font-medium placeholder-gray-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Secure Cloudinary URL"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs font-medium placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="btn-primary w-full py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Attach Document URL
                </button>
              </div>
            </form>

            {emp.documents?.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs font-medium">No files uploaded.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {emp.documents?.map((doc) => (
                  <div key={doc._id} className="p-3 flex items-center justify-between text-xs font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-gray-900 truncate max-w-40">{doc.name}</span>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline text-[11px]"
                    >
                      Open
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
