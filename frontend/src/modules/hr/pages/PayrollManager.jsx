import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayrolls, fetchMyPayroll, generatePayroll, markPayrollAsPaid, fetchEmployees } from '../../../store/hrSlice.js';
import { Loader2, Plus, DollarSign, AlertCircle, ShieldAlert, Check, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';

const PayrollManager = () => {
  const dispatch = useDispatch();
  const { payrollStatements = [], myPayroll = [], employees = [], loading, error } = useSelector((state) => state.hr);
  const statements = payrollStatements;
  const { user: currentUser } = useSelector((state) => state.auth);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchMyPayroll());
    if (['ADMIN', 'HR'].includes(currentUser?.role)) {
      dispatch(fetchPayrolls());
      dispatch(fetchEmployees());
    }
  }, [dispatch, currentUser]);

  const onGenerateSubmit = async (data) => {
    setGenerateError(null);
    const payload = {
      employee: data.employee,
      month: Number(data.month),
      year: Number(data.year),
      basicSalary: Number(data.basicSalary),
      allowances: Number(data.allowances || 0),
      deductions: Number(data.deductions || 0)
    };

    const resultAction = await dispatch(generatePayroll(payload));
    if (generatePayroll.fulfilled.match(resultAction)) {
      setShowGenerateModal(false);
      reset();
      dispatch(fetchPayrolls());
    } else {
      setGenerateError(resultAction.payload || 'Failed to generate payslip');
    }
  };

  const handleMarkPaid = async (id) => {
    if (window.confirm('Mark this payslip transaction as PAID?')) {
      await dispatch(markPayrollAsPaid(id));
      dispatch(fetchPayrolls());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payroll Statements</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Review payouts and generate monthly employee payslips</p>
        </div>

        {['ADMIN', 'HR'].includes(currentUser?.role) && (
          <button
            onClick={() => {
              setGenerateError(null);
              setShowGenerateModal(true);
            }}
            className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Generate Payslip
          </button>
        )}
      </div>

      <div className={['ADMIN', 'HR'].includes(currentUser?.role) ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : "w-full"}>
        {/* Left Columns: Payroll Registry (Admin/HR View) */}
        {['ADMIN', 'HR'].includes(currentUser?.role) && (
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700">
              Enterprise Payroll Registry Logs
            </div>
            
            {statements.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs font-medium">No payroll logs generated.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {statements.map((slip) => (
                  <div key={slip._id} className="p-4 flex items-center justify-between text-xs font-medium text-gray-700 hover:bg-gray-50">
                    <div className="space-y-1">
                      <div className="font-bold text-gray-900">{slip.employee?.user?.name || 'Unknown Employee'}</div>
                      <div className="text-[10px] text-gray-400 font-semibold">
                        ID: {slip.employee?.employeeId} | Month: {slip.month}/{slip.year}
                      </div>
                      <div className="text-[11px] text-gray-600 font-bold">
                        Basic: ${slip.basicSalary} | Allw: ${slip.allowances} | Ded: ${slip.deductions}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="font-bold text-[#2563eb]">₹{slip.netSalary}</div>
                        <div className="text-[9px] text-gray-400 font-bold">Net Salary</div>
                      </div>
                      
                      {slip.status === 'UNPAID' ? (
                        <button
                          onClick={() => handleMarkPaid(slip._id)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-green-50 border border-green-200 text-green-600 rounded hover:bg-green-100 cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-bold bg-green-50 border border-green-200 text-green-700 rounded">
                          PAID
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Column: My Payslips */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700">
            My Monthly Payslips
          </div>
          {myPayroll.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-xs font-medium">No payslips generated for your profile.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {myPayroll.map((slip) => (
                <div key={slip._id} className="p-4 space-y-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Payslip - {slip.month}/{slip.year}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      slip.status === 'PAID' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {slip.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500 font-bold">
                    <div>Basic: ${slip.basicSalary}</div>
                    <div>Allw: ${slip.allowances}</div>
                    <div>Ded: ${slip.deductions}</div>
                  </div>
                  <div className="pt-1.5 border-t border-gray-100 flex justify-between font-bold">
                    <span>Net Salary Paid:</span>
                    <span className="text-blue-600">₹{slip.netSalary}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Generate Payroll Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Generate Payslip</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onGenerateSubmit)} className="p-5 space-y-4">
              {generateError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-xs">
                  <ShieldAlert className="w-4 h-4 mt-0.5" />
                  <span className="font-semibold">{generateError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Employee Profile</label>
                <select
                  {...register('employee', { required: 'Employee selection is required' })}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="">Choose Employee...</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.user?.name} ({emp.employeeId} - {emp.designation})
                    </option>
                  ))}
                </select>
                {errors.employee && <p className="text-red-600 text-[10px] mt-0.5">{errors.employee.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Month (1-12)</label>
                  <input
                    {...register('month', { required: 'Month is required' })}
                    type="number"
                    min="1"
                    max="12"
                    placeholder="e.g. 7"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-600"
                  />
                  {errors.month && <p className="text-red-600 text-[10px] mt-0.5">{errors.month.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Year</label>
                  <input
                    {...register('year', { required: 'Year is required' })}
                    type="number"
                    placeholder="e.g. 2026"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-600"
                  />
                  {errors.year && <p className="text-red-600 text-[10px] mt-0.5">{errors.year.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Basic Salary (₹)</label>
                <input
                  {...register('basicSalary', { required: 'Basic Salary is required' })}
                  type="number"
                  placeholder="e.g. 50000"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-600"
                />
                {errors.basicSalary && <p className="text-red-600 text-[10px] mt-0.5">{errors.basicSalary.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Allowances (₹)</label>
                  <input
                    {...register('allowances')}
                    type="number"
                    placeholder="0"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Deductions (₹)</label>
                  <input
                    {...register('deductions')}
                    type="number"
                    placeholder="0"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Generate Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManager;
