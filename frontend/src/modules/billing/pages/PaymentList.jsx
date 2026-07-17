import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments, createPayment, fetchInvoices } from '../../../store/billingSlice.js';
import { fetchCustomers } from '../../../store/crmSlice.js';
import { 
  Loader2, Plus, Search, Filter, CreditCard, DollarSign,
  MoreVertical, Eye, FileDown, RotateCcw, CheckCircle,
  XCircle, Clock, Calendar, User, ShieldAlert
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../../services/api.js';

const PaymentList = () => {
  const dispatch = useDispatch();
  const { payments = [], invoices = [], loading } = useSelector((state) => state.billing);
  const { customers = [] } = useSelector((state) => state.crm);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [selectedCustId, setSelectedCustId] = useState('');
  
  // Active row actions state
  const [activeActionsId, setActiveActionsId] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchPayments());
    dispatch(fetchInvoices());
    dispatch(fetchCustomers());
  }, [dispatch]);

  // Click outside to close row action menu
  useEffect(() => {
    if (!activeActionsId) return;
    const closeMenu = () => setActiveActionsId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [activeActionsId]);

  // Filter unpaid or partially paid invoices for the selected customer
  const filteredInvoices = invoices.filter(
    (inv) =>
      String(inv.customerId?._id || inv.customerId) === String(selectedCustId) &&
      inv.invoiceStatus !== 'CANCELLED' &&
      inv.paymentStatus !== 'PAID'
  );

  const onAddSubmit = async (data) => {
    setModalError(null);
    const payload = {
      customerId: data.customerId,
      invoiceId: data.invoiceId,
      amount: Number(data.amount),
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      referenceNumber: data.referenceNumber,
      paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : undefined,
      notes: data.notes,
      paymentStatus: 'COMPLETED'
    };

    const result = await dispatch(createPayment(payload));
    if (createPayment.fulfilled.match(result)) {
      setShowModal(false);
      setSelectedCustId('');
      reset();
      dispatch(fetchPayments());
      dispatch(fetchInvoices());
    } else {
      setModalError(result.payload || 'Failed to submit payment transaction.');
    }
  };

  const handleRefundPayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to refund this payment? This will adjust the outstanding invoice balance and reopen the associated deal.')) {
      try {
        await api.put(`/api/v1/payments/${paymentId}/status`, { status: 'REFUNDED' });
        alert('Payment refunded successfully!');
        dispatch(fetchPayments());
        dispatch(fetchInvoices());
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to process refund');
      }
    }
  };

  // Client side filters
  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.paymentNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.referenceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceId?.invoiceNumber?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter ? p.paymentStatus === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = filteredPayments.filter(p => p.paymentStatus === 'COMPLETED').reduce((s, p) => s + p.amount, 0);
  const totalRefunded = filteredPayments.filter(p => p.paymentStatus === 'REFUNDED').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 text-xs text-gray-700">
      
      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Collected</div>
          <div className="text-lg font-bold text-green-600 mt-1">₹{totalCollected.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Refunded</div>
          <div className="text-lg font-bold text-red-600 mt-1">₹{totalRefunded.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Net Collections</div>
          <div className="text-lg font-bold text-gray-900 mt-1">₹{(totalCollected - totalRefunded).toLocaleString()}</div>
        </div>
      </div>

      {/* Filter and control panel */}
      <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Collections Directory</h2>
            <p className="text-[11px] text-gray-400 font-semibold mt-0.5 font-medium">Verify payment receipts, transaction reference keys, and refund audits.</p>
          </div>

          {['ADMIN', 'MANAGER', 'ACCOUNTANT', 'SALES'].includes(currentUser?.role) && (
            <button
              onClick={() => {
                setModalError(null);
                setSelectedCustId('');
                reset();
                setShowModal(true);
              }}
              className="bg-[#2563eb] text-white hover:bg-blue-700 px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Record Payment
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-150">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search by Payment ID, Invoice, Ref or Transaction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-gray-250 rounded-lg py-1.5 pl-9 pr-3 focus:outline-none text-[11px] text-gray-700"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-gray-250 rounded-lg py-1.5 px-3 focus:outline-none text-[11px] text-gray-700 cursor-pointer"
          >
            <option value="">All Payment Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {/* Ledger table */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-16 rounded-xl text-gray-400 font-semibold">
          No matching payment transactions registered yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-3.5 pl-5">Payment ID</th>
                  <th className="p-3.5">Invoice Number</th>
                  <th className="p-3.5">Customer / Company</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5">Payment Date</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5">Reference #</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {filteredPayments.map((p) => {
                  const clientName = p.customerId?.customerName || 'Private Customer';
                  const compName = p.customerId?.companyName || 'Private Corporate';

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 pl-5 font-bold text-gray-900">{p.paymentNumber}</td>
                      <td className="p-3.5 font-bold text-blue-600">{p.invoiceId?.invoiceNumber}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-gray-900">{clientName}</div>
                        <div className="text-[9px] text-gray-400 font-semibold">{compName}</div>
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-green-700">
                        {p.paymentStatus === 'REFUNDED' ? '-' : '+'}₹{p.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-gray-500 font-semibold">
                        {new Date(p.paymentDate || p.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-gray-800 font-bold">{p.paymentMethod}</td>
                      <td className="p-3.5 text-gray-600 font-mono">{p.transactionId || 'N/A'}</td>
                      <td className="p-3.5 text-gray-600 font-mono font-bold">{p.referenceNumber || 'N/A'}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${
                          p.paymentStatus === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                          p.paymentStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-250' :
                          p.paymentStatus === 'REFUNDED' ? 'bg-red-50 text-red-700 border-red-200 font-bold' :
                          'bg-red-100 text-red-700 border-red-300'
                        }`}>
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-center relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveActionsId(activeActionsId === p._id ? null : p._id); }}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeActionsId === p._id && (
                          <div className="absolute right-6 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36 z-30 text-[10px] text-gray-700 text-left font-semibold">
                            <button onClick={() => { setViewingPayment(p); setShowViewModal(true); }} className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
                              <Eye className="w-3 h-3 text-slate-400" /> View Receipt
                            </button>
                            <button onClick={() => { alert('Downloading payment PDF receipt statement!'); }} className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
                              <FileDown className="w-3 h-3 text-gray-400" /> Download Receipt
                            </button>

                            {p.paymentStatus === 'COMPLETED' && ['ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(currentUser?.role) && (
                              <button onClick={() => handleRefundPayment(p._id)} className="w-full px-3 py-1.5 hover:bg-red-50 text-red-650 flex items-center gap-1.5 cursor-pointer font-bold border-t">
                                <RotateCcw className="w-3 h-3 text-red-500" /> Refund Transaction
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Record Payment Received</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit(onAddSubmit)} className="p-5 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 font-bold">
                  {modalError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Client Customer *</label>
                <select
                  {...register('customerId', {
                    required: true,
                    onChange: (e) => setSelectedCustId(e.target.value)
                  })}
                  className={`w-full bg-white border rounded-lg py-2 px-3 focus:outline-none text-gray-700 text-xs font-semibold cursor-pointer ${errors.customerId ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                >
                  <option value="">Choose Customer...</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.customerName} ({c.companyName})</option>
                  ))}
                </select>
                {errors.customerId && (
                  <p className="text-red-500 text-[10px] font-semibold mt-0.5">Customer is required</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Open Invoice *</label>
                <select
                  {...register('invoiceId', {
                    required: true,
                    onChange: (e) => {
                      const val = e.target.value;
                      const matched = invoices.find(i => i._id === val);
                      if (matched) {
                        setValue('amount', matched.remainingAmount);
                      }
                    }
                  })}
                  disabled={!selectedCustId}
                  className={`w-full bg-white border rounded-lg py-2 px-3 focus:outline-none text-gray-700 text-xs font-semibold disabled:bg-slate-50 cursor-pointer ${errors.invoiceId ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                >
                  <option value="">{selectedCustId ? 'Choose Invoice...' : 'Please choose Customer first'}</option>
                  {filteredInvoices.map(i => (
                    <option key={i._id} value={i._id}>{i.invoiceNumber} [Remaining: ₹{i.remainingAmount}]</option>
                  ))}
                </select>
                {errors.invoiceId && (
                  <p className="text-red-500 text-[10px] font-semibold mt-0.5">Invoice selection is required</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment Method *</label>
                  <select
                    {...register('paymentMethod', { required: true })}
                    className={`w-full bg-white border rounded-lg py-2 px-3 focus:outline-none text-gray-700 text-xs font-semibold cursor-pointer ${errors.paymentMethod ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Wallet">Wallet</option>
                  </select>
                  {errors.paymentMethod && (
                    <p className="text-red-500 text-[10px] font-semibold mt-0.5">Method is required</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Amount Paid (₹) *</label>
                  <input
                    {...register('amount', { required: true, min: 0.01 })}
                    type="number"
                    step="0.01"
                    className={`w-full bg-white border rounded-lg py-2 px-3 focus:outline-none font-semibold text-xs ${errors.amount ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-[10px] font-semibold mt-0.5">
                      {errors.amount.type === 'min' ? 'Must be > 0' : 'Amount is required'}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Transaction ID</label>
                  <input
                    {...register('transactionId')}
                    type="text"
                    placeholder="txn-88776655"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Reference Number</label>
                  <input
                    {...register('referenceNumber')}
                    type="text"
                    placeholder="REF-9090"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment Date</label>
                <input
                  {...register('paymentDate')}
                  type="datetime-local"
                  className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-gray-750 text-xs cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Transaction Notes</label>
                <textarea
                  {...register('notes')}
                  placeholder="Routing bank logs, receipt notes..."
                  rows="2"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-[11px]"
                ></textarea>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4 rounded-b-xl">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="bg-[#2563eb] text-white px-4 py-2 rounded-lg font-semibold cursor-pointer">Record Collection</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RECEIPT MODAL */}
      {showViewModal && viewingPayment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Receipt Details: {viewingPayment.paymentNumber}</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            
            <div className="p-5 space-y-4 text-xs font-semibold">
              <div className="border border-green-200 bg-green-50/20 p-4 rounded-xl text-center space-y-1">
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Amount Paid</div>
                <div className="text-2xl font-extrabold text-green-700">
                  {viewingPayment.paymentStatus === 'REFUNDED' ? '-' : ''}₹{viewingPayment.amount.toLocaleString()}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                  Status: {viewingPayment.paymentStatus}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 font-bold">Client Customer</span>
                  <span className="text-gray-800">{viewingPayment.customerId?.customerName || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 font-bold">Company Name</span>
                  <span className="text-gray-800">{viewingPayment.customerId?.companyName || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 font-bold">Invoice Code</span>
                  <span className="text-gray-800 text-blue-600 font-bold">{viewingPayment.invoiceId?.invoiceNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 font-bold">Payment Method</span>
                  <span className="text-gray-800 font-bold">{viewingPayment.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 font-bold">Transaction ID</span>
                  <span className="text-gray-700 font-mono">{viewingPayment.transactionId || 'None'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 font-bold">Reference Number</span>
                  <span className="text-gray-700 font-mono font-bold">{viewingPayment.referenceNumber || 'None'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 font-bold">Payment Log Date</span>
                  <span className="text-gray-650">{new Date(viewingPayment.paymentDate || viewingPayment.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-gray-400 font-bold">Logged By User</span>
                  <span className="text-gray-650">{viewingPayment.createdBy?.name || 'System Operator'}</span>
                </div>
              </div>

              {viewingPayment.notes && (
                <div className="space-y-1 pt-2 border-t">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Transaction Notes</span>
                  <p className="bg-slate-50 border p-2.5 rounded-lg text-gray-600 font-semibold">{viewingPayment.notes}</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
              <button onClick={() => { alert('Downloading receipt statement!'); }} className="px-3.5 py-2 bg-slate-50 border border-gray-250 hover:bg-gray-100 text-gray-700 font-bold rounded-lg cursor-pointer flex items-center gap-1.5">
                <FileDown className="w-3.5 h-3.5 text-gray-400" /> Download PDF
              </button>
              {viewingPayment.paymentStatus === 'COMPLETED' && ['ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(currentUser?.role) && (
                <button onClick={() => { handleRefundPayment(viewingPayment._id); setShowViewModal(false); }} className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-lg font-bold cursor-pointer">
                  Refund Payment
                </button>
              )}
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 border border-gray-250 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentList;
