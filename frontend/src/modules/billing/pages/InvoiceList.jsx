import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchInvoices, createInvoice, updateInvoiceStatus, 
  fetchQuotations, convertQuotation 
} from '../../../store/billingSlice.js';
import { fetchCustomers, fetchDeals } from '../../../store/crmSlice.js';
import { fetchProducts } from '../../../store/inventorySlice.js';
import { 
  Loader2, Plus, Search, Filter, Calendar, FileText, 
  CheckCircle, XCircle, MoreVertical, Eye, FileDown, 
  CreditCard, Trash2, ShieldAlert, Badge, DollarSign,
  AlertTriangle
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../../services/api.js';

const InvoiceList = ({ searchQuery }) => {
  const dispatch = useDispatch();
  const { invoices = [], quotations = [], loading } = useSelector((state) => state.billing);
  const { customers = [], deals = [] } = useSelector((state) => state.crm);
  const { products = [] } = useSelector((state) => state.inventory);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [payFilter, setPayFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [customItems, setCustomItems] = useState({});

  // Active Menu action row
  const [activeActionsId, setActiveActionsId] = useState(null);

  // Origin selection inside Create Modal
  const [originType, setOriginType] = useState('DEAL'); // 'DEAL' or 'QUOTATION'
  const [selectedOriginId, setSelectedOriginId] = useState('');

  // Recording manual payment state
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(null);

  const { register, handleSubmit, control, watch, reset, setValue } = useForm({
    defaultValues: {
      products: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }],
      shippingCharge: 0,
      additionalDiscount: 0,
      paymentTerms: '',
      notes: '',
      dueDate: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products'
  });

  const watchProducts = watch('products');
  const watchShipping = Number(watch('shippingCharge')) || 0;
  const watchAdditionalDiscount = Number(watch('additionalDiscount')) || 0;

  // Interactively calculate subtotal, discount, tax, total in React state
  let localSubtotal = 0;
  let localDiscount = 0;
  let localTax = 0;
  let localGrandTotal = 0;

  if (watchProducts) {
    watchProducts.forEach((p) => {
      const quantity = Number(p.quantity) || 0;
      const price = Number(p.unitPrice) || 0;
      const disc = Number(p.discount) || 0;
      const tx = Number(p.tax) || 0;

      const sub = quantity * price;
      localSubtotal += sub;
      localDiscount += disc;
      localTax += tx;
      localGrandTotal += (sub - disc + tx);
    });
    localGrandTotal = Math.max(0, localGrandTotal + watchShipping - watchAdditionalDiscount);
  }

  // Load initial datasets
  const loadInvoices = () => {
    const params = {};
    if (currentUser?.role === 'SALES') {
      params.salesPersonId = currentUser.id || currentUser._id;
    }
    dispatch(fetchInvoices(params));
  };

  useEffect(() => {
    loadInvoices();
    dispatch(fetchCustomers());
    dispatch(fetchDeals());
    dispatch(fetchQuotations());
    dispatch(fetchProducts());
  }, [dispatch, currentUser]);

  // Handle active deal preselection from crm deals board for invoices
  useEffect(() => {
    const activeDealId = localStorage.getItem('crm_active_deal_id');
    const activeDealAction = localStorage.getItem('crm_active_deal_action');
    if (activeDealId && activeDealAction === 'create_invoice' && deals.length > 0) {
      const deal = deals.find(d => String(d._id) === String(activeDealId));
      if (deal) {
        localStorage.removeItem('crm_active_deal_id');
        localStorage.removeItem('crm_active_deal_action');
        
        if (deal.stage !== 'CLOSED_WON') {
          alert('Warning: Invoices can only be created from Closed Won deals or Accepted quotations!');
          return;
        }

        // Pre-fill Deal origin setup
        setOriginType('DEAL');
        setSelectedOriginId(deal._id);

        reset({
          customerId: deal.customer?._id || deal.customer,
          dealId: deal._id,
          salesPersonId: deal.assignedSalesPerson?._id || deal.assignedSalesPerson || currentUser.id || currentUser._id,
          shippingCharge: 0,
          notes: `Invoice issued from Deal Reference: ${deal.title}`,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          products: [{ productId: '', quantity: 1, unitPrice: deal.amount, discount: 0, tax: 0 }]
        });

        setModalError(null);
        setShowModal(true);
      }
    }
  }, [deals, reset, currentUser]);

  // Click outside to close row action menu
  useEffect(() => {
    if (!activeActionsId) return;
    const closeMenu = () => setActiveActionsId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [activeActionsId]);

  // Handle Global Search Sync
  useEffect(() => {
    if (searchQuery === undefined) return;
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchQuery);
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Dropdown origin selector helper
  const handleOriginChange = (id) => {
    setSelectedOriginId(id);
    if (!id) return;

    if (originType === 'QUOTATION') {
      const quote = quotations.find(q => q._id === id);
      if (quote) {
        // Pre-fill from quotation values
        reset({
          customerId: quote.customerId?._id || quote.customerId,
          dealId: quote.dealId?._id || quote.dealId,
          salesPersonId: quote.salesPersonId?._id || quote.salespersonId?._id || quote.salesPersonId || quote.salespersonId || currentUser.id || currentUser._id,
          shippingCharge: quote.shippingCharge || 0,
          notes: quote.notes || `Invoice generated from quotation ${quote.quotationNumber}`,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          products: quote.products.map(p => ({
            productId: p.productId?._id || p.productId,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            discount: p.discount || 0,
            tax: p.tax || 0
          }))
        });
      }
    } else {
      const deal = deals.find(d => d._id === id);
      if (deal) {
        // Pre-fill from Deal
        reset({
          customerId: deal.customer?._id || deal.customer,
          dealId: deal._id,
          salesPersonId: deal.assignedSalesPerson?._id || deal.assignedSalesPerson || currentUser.id || currentUser._id,
          shippingCharge: 0,
          additionalDiscount: 0,
          paymentTerms: 'Due on Receipt',
          notes: `Invoice issued from Deal Reference: ${deal.title}`,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          products: [{ productId: '', name: `Service Contract: ${deal.title}`, quantity: 1, unitPrice: deal.amount, discount: 0, tax: 0 }]
        });
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    if (window.confirm(`Are you sure you want to change invoice status to ${status}?`)) {
      const res = await dispatch(updateInvoiceStatus({ id, status }));
      if (updateInvoiceStatus.fulfilled.match(res)) {
        loadInvoices();
        dispatch(fetchProducts());
      }
    }
  };

  const onAddSubmit = async (data) => {
    setModalError(null);
    
    // Safety check
    if (!selectedOriginId) {
      setModalError('Please select a valid Origin Deal or Quotation source.');
      return;
    }

    // Validate that each product item has either a productId or a name
    const invalidItem = data.products.find(p => !p.productId && !p.name);
    if (invalidItem) {
      setModalError("Please select a product SKU from the catalog or write a custom product name manually.");
      return;
    }

    const payload = {
      dealId: data.dealId,
      quotationId: originType === 'QUOTATION' ? selectedOriginId : undefined,
      customerId: data.customerId,
      salesPersonId: data.salesPersonId || currentUser.id || currentUser._id,
      dueDate: new Date(data.dueDate).toISOString(),
      shippingCharge: Number(data.shippingCharge || 0),
      paymentTerms: data.paymentTerms || '',
      additionalDiscount: Number(data.additionalDiscount || 0),
      notes: data.notes,
      products: data.products.map(p => ({
        productId: p.productId || undefined,
        name: p.name || undefined,
        quantity: Number(p.quantity),
        unitPrice: Number(p.unitPrice),
        discount: Number(p.discount || 0),
        tax: Number(p.tax || 0)
      }))
    };

    const res = await dispatch(createInvoice(payload));
    if (createInvoice.fulfilled.match(res)) {
      setShowModal(false);
      reset();
      loadInvoices();
      dispatch(fetchProducts());
    } else {
      setModalError(res.payload || 'Failed to issue invoice.');
    }
  };

  const onRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const amount = Number(data.get('amount'));
    const paymentMethod = data.get('paymentMethod');
    const transactionId = data.get('transactionId');
    const referenceNumber = data.get('referenceNumber');
    const notes = data.get('notes');

    try {
      await api.post('/api/v1/payments', {
        invoiceId: showRecordPaymentModal._id,
        customerId: showRecordPaymentModal.customerId?._id || showRecordPaymentModal.customerId,
        amount,
        paymentMethod,
        transactionId,
        referenceNumber,
        paymentStatus: 'COMPLETED',
        notes
      });
      alert('Payment recorded successfully!');
      setShowRecordPaymentModal(null);
      loadInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  // Client side filters
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? inv.invoiceStatus === statusFilter : true;
    const matchesPay = payFilter ? inv.paymentStatus === payFilter : true;
    return matchesSearch && matchesStatus && matchesPay;
  });

  // Closed Won Deals and Accepted Quotes
  const activeOriginDeals = deals.filter(d => d.stage === 'CLOSED_WON');
  const activeOriginQuotes = quotations.filter(q => q.quotationStatus === 'ACCEPTED' && !q.invoiceId);

  // Stats Card data
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const paidAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const remainingReceivables = filteredInvoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);
  const overdueCount = filteredInvoices.filter(inv => inv.paymentStatus === 'UNPAID' && new Date(inv.dueDate) < new Date()).length;

  return (
    <div className="space-y-6 text-xs text-gray-700">
      
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Invoiced</div>
          <div className="text-lg font-bold text-gray-900 mt-1">₹{totalAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Collected</div>
          <div className="text-lg font-bold text-green-600 mt-1">₹{paidAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Receivables</div>
          <div className="text-lg font-bold text-blue-600 mt-1">₹{remainingReceivables.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Overdue Accounts</div>
          <div className="text-lg font-bold text-red-600 mt-1">{overdueCount} Invoices</div>
        </div>
      </div>

      {/* Filter and controls */}
      <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Invoices Ledger</h2>
            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">View customer statements and register collections against deals.</p>
          </div>

          <button
            onClick={() => {
              setModalError(null);
              setSelectedOriginId('');
              reset({
                products: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }],
                shippingCharge: 0,
                notes: '',
                dueDate: ''
              });
              setShowModal(true);
            }}
            className="bg-[#2563eb] text-white hover:bg-blue-700 px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-150">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search Invoice Number..."
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
            <option value="">All Invoice Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SENT">SENT</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={payFilter}
            onChange={(e) => setPayFilter(e.target.value)}
            className="bg-slate-50 border border-gray-250 rounded-lg py-1.5 px-3 focus:outline-none text-[11px] text-gray-700 cursor-pointer"
          >
            <option value="">All Payment Statuses</option>
            <option value="UNPAID">UNPAID</option>
            <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
            <option value="PAID">PAID</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-3.5 pl-5">Invoice Number</th>
                  <th className="p-3.5">Associated Deal</th>
                  <th className="p-3.5">Customer / Company</th>
                  <th className="p-3.5 text-right">Grand Total</th>
                  <th className="p-3.5 text-right">Remaining</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-16 text-gray-400 font-semibold">
                      No invoices found matching query logs.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const clientName = inv.customerId?.customerName || 'Private Customer';
                    const compName = inv.customerId?.companyName || 'Individual Entity';
                    const isOverdue = inv.paymentStatus === 'UNPAID' && new Date(inv.dueDate) < new Date();

                    return (
                      <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3.5 pl-5 font-bold text-blue-600 cursor-pointer" onClick={() => { setViewingInvoice(inv); setShowViewModal(true); }}>
                          {inv.invoiceNumber}
                        </td>
                        <td className="p-3.5 font-semibold text-gray-700">
                          {inv.dealId?.title || 'Direct Ledger'}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900">{clientName}</div>
                          <div className="text-[9px] text-gray-400 font-semibold">{compName}</div>
                        </td>
                        <td className="p-3.5 text-right font-extrabold text-gray-900">₹{(inv.grandTotal || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right font-bold text-blue-600">₹{(inv.remainingAmount || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className={`font-semibold ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border uppercase tracking-wider ${
                            inv.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                            inv.paymentStatus === 'PARTIALLY_PAID' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase ${
                            inv.invoiceStatus === 'SENT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            inv.invoiceStatus === 'CANCELLED' ? 'bg-slate-100 text-slate-600 border-gray-300' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {inv.invoiceStatus}
                          </span>
                        </td>
                        <td className="p-3.5 text-center relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveActionsId(activeActionsId === inv._id ? null : inv._id); }}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeActionsId === inv._id && (
                            <div className="absolute right-6 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36 z-30 text-[10px] text-gray-700 text-left font-semibold">
                              <button onClick={() => { setViewingInvoice(inv); setShowViewModal(true); }} className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
                                <Eye className="w-3 h-3 text-slate-400" /> View Invoice
                              </button>
                              
                              {inv.invoiceStatus === 'DRAFT' && (
                                <button onClick={() => handleStatusChange(inv._id, 'SENT')} className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
                                  <FileText className="w-3 h-3 text-blue-500" /> Mark Sent
                                </button>
                              )}

                              {inv.paymentStatus !== 'PAID' && (
                                <button onClick={() => setShowRecordPaymentModal(inv)} className="w-full px-3 py-1.5 hover:bg-green-50 text-green-700 flex items-center gap-1.5 cursor-pointer font-bold">
                                  <CreditCard className="w-3 h-3 text-green-600" /> Record Payment
                                </button>
                              )}

                              {inv.invoiceStatus !== 'CANCELLED' && (
                                <button onClick={() => handleStatusChange(inv._id, 'CANCELLED')} className="w-full px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-1.5 cursor-pointer">
                                  <XCircle className="w-3 h-3 text-red-500" /> Cancel Invoice
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Issue Deal Invoice</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit(onAddSubmit)} className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  {modalError}
                </div>
              )}

              {/* Selector setup */}
              <div className="bg-slate-50 border p-4 rounded-xl space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[10px] uppercase text-gray-500">
                    <input 
                      type="radio" 
                      checked={originType === 'DEAL'} 
                      onChange={() => { setOriginType('DEAL'); setSelectedOriginId(''); }} 
                    />
                    From Closed Won Deal
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[10px] uppercase text-gray-500">
                    <input 
                      type="radio" 
                      checked={originType === 'QUOTATION'} 
                      onChange={() => { setOriginType('QUOTATION'); setSelectedOriginId(''); }} 
                    />
                    From Accepted Quotation
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Origin Record *</label>
                  <select
                    value={selectedOriginId}
                    onChange={(e) => handleOriginChange(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700 text-xs font-semibold cursor-pointer"
                  >
                    <option value="">-- Choose Origin Log --</option>
                    {originType === 'DEAL' ? (
                      activeOriginDeals.map(d => (
                        <option key={d._id} value={d._id}>
                          {d.dealCode} - {d.title} ({d.customer?.companyName || 'Private Corp'}) [Value: ${d.amount}]
                        </option>
                      ))
                    ) : (
                      activeOriginQuotes.map(q => (
                        <option key={q._id} value={q._id}>
                          {q.quotationNumber} - Deal: {q.dealId?.title || 'N/A'} ({q.customerId?.companyName || 'Private Corp'}) [Total: ${q.totalAmount}]
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {selectedOriginId && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Customer Profile</label>
                      <select disabled {...register('customerId')} className="w-full bg-slate-50 border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-gray-500 cursor-not-allowed">
                        {customers.map(c => (
                          <option key={c._id} value={c._id}>{c.customerName} ({c.companyName})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Associated Deal</label>
                      <select disabled {...register('dealId')} className="w-full bg-slate-50 border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-gray-500 cursor-not-allowed font-bold">
                        <option value="">No Linked Deal</option>
                        {deals.map(d => (
                          <option key={d._id} value={d._id}>{d.title} ({d.dealCode})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase font-bold">Due Date *</label>
                      <input {...register('dueDate', { required: true })} type="date" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-gray-700 font-bold" />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase font-bold">Payment Terms</label>
                      <select {...register('paymentTerms')} className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-gray-700 font-bold cursor-pointer">
                        <option value="Due on Receipt">Due on Receipt</option>
                        <option value="Net 15">Net 15</option>
                        <option value="Net 30">Net 30</option>
                        <option value="Net 45">Net 45</option>
                        <option value="Net 60">Net 60</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase font-bold">Additional Discount (₹)</label>
                      <input {...register('additionalDiscount')} type="number" step="0.01" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-gray-700 font-bold" />
                    </div>
                  </div>

                  {/* Products table */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center border-b pb-1">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Line Items (Locked)</h4>
                    </div>

                    <div className="space-y-2.5 max-h-48 overflow-y-auto">
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50/50 p-2 border rounded-lg">
                          <div className="col-span-5 space-y-1">
                            <label className="block text-[8px] font-bold text-gray-400 uppercase">Product Details</label>
                            {customItems[index] || !field.productId ? (
                              <input
                                disabled={true}
                                {...register(`products.${index}.name`)}
                                className="w-full bg-slate-50 border border-gray-300 rounded p-1 text-[10px] focus:outline-none font-bold text-gray-500 cursor-not-allowed"
                              />
                            ) : (
                              <select
                                disabled={true}
                                {...register(`products.${index}.productId`)}
                                className="w-full bg-slate-50 border border-gray-300 rounded p-1 text-[10px] focus:outline-none text-gray-500 cursor-not-allowed"
                              >
                                {products.map(p => (
                                  <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                                ))}
                              </select>
                            )}
                          </div>

                          <div className="col-span-2 space-y-1">
                            <label className="block text-[8px] font-bold text-gray-400 uppercase">Qty</label>
                            <input
                              disabled={true}
                              {...register(`products.${index}.quantity`)}
                              type="number"
                              className="w-full bg-slate-50 border border-gray-300 rounded p-1 text-[10px] focus:outline-none text-gray-500 cursor-not-allowed font-bold"
                            />
                          </div>

                          <div className="col-span-2 space-y-1">
                            <label className="block text-[8px] font-bold text-gray-400 uppercase">Unit Price</label>
                            <input
                              disabled={true}
                              {...register(`products.${index}.unitPrice`)}
                              type="number"
                              className="w-full bg-slate-50 border border-gray-300 rounded p-1 text-[10px] focus:outline-none text-gray-500 cursor-not-allowed font-bold"
                            />
                          </div>

                          <div className="col-span-1.5 space-y-1">
                            <label className="block text-[8px] font-bold text-gray-400 uppercase">Tax (₹)</label>
                            <input
                              disabled={true}
                              {...register(`products.${index}.tax`)}
                              type="number"
                              className="w-full bg-slate-50 border border-gray-300 rounded p-1 text-[10px] focus:outline-none text-gray-500 cursor-not-allowed font-bold"
                            />
                          </div>

                          <div className="col-span-1.5 space-y-1">
                            <label className="block text-[8px] font-bold text-gray-400 uppercase">Disc (₹)</label>
                            <input
                              disabled={true}
                              {...register(`products.${index}.discount`)}
                              type="number"
                              className="w-full bg-slate-50 border border-gray-300 rounded p-1 text-[10px] focus:outline-none text-gray-500 cursor-not-allowed font-bold"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center pt-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Shipping Charge (₹)</label>
                      <input
                        {...register('shippingCharge')}
                        type="number"
                        step="0.01"
                        className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none font-bold"
                      />
                    </div>

                    <div className="p-3 bg-gray-50 border rounded-lg flex flex-col items-end justify-center font-bold text-xs gap-1">
                      <div>Subtotal: <span className="font-mono">₹{localSubtotal}</span></div>
                      <div>Tax: <span className="font-mono text-green-700">+₹{localTax}</span></div>
                      <div>Discount: <span className="font-mono text-red-650">-₹{localDiscount}</span></div>
                      <div>Additional Discount: <span className="font-mono text-red-600">-₹{watchAdditionalDiscount}</span></div>
                      <div>Grand Total: <span className="text-sm text-[#2563eb] font-extrabold font-mono">₹{localGrandTotal}</span></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Invoice Terms / Notes</label>
                    <textarea {...register('notes')} rows={2} className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-[11px] font-bold"></textarea>
                  </div>
                </div>
              )}

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4 rounded-b-xl">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-250 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={!selectedOriginId} className="bg-[#2563eb] text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  {originType === 'QUOTATION' ? 'Convert to Invoice' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Record Payment Received</h3>
              <button onClick={() => setShowRecordPaymentModal(null)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={onRecordPaymentSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5 bg-slate-50 border p-3.5 rounded-xl font-bold">
                <div>Invoice Code: <span className="font-semibold text-blue-600">{showRecordPaymentModal.invoiceNumber}</span></div>
                <div>Grand Total: <span className="font-semibold text-gray-700">₹{showRecordPaymentModal.grandTotal}</span></div>
                <div>Remaining Balance: <span className="font-semibold text-red-600">₹{showRecordPaymentModal.remainingAmount}</span></div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Received Amount (₹) *</label>
                <input 
                  type="number" 
                  name="amount" 
                  step="0.01" 
                  required 
                  defaultValue={showRecordPaymentModal.remainingAmount} 
                  max={showRecordPaymentModal.remainingAmount}
                  className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" 
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Payment Method *</label>
                <select name="paymentMethod" required className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none cursor-pointer">
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Wallet">Wallet</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Transaction ID</label>
                <input type="text" name="transactionId" placeholder="txn-1234567" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Reference Number</label>
                <input type="text" name="referenceNumber" placeholder="REF-8877" className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Transaction Notes</label>
                <textarea name="notes" rows={2} placeholder="Add payment receipt notes..." className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none text-[11px]"></textarea>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4 rounded-b-xl">
                <button type="button" onClick={() => setShowRecordPaymentModal(null)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="bg-[#2563eb] text-white px-4 py-2 rounded-lg font-semibold cursor-pointer">Record Collection</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && viewingInvoice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Billing Statement: {viewingInvoice.invoiceNumber}</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 text-[11px] bg-slate-50 p-4 border rounded-xl">
                <div className="space-y-2">
                  <h4 className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider border-b pb-0.5">Client & Address</h4>
                  <div>
                    <div className="text-[8px] text-gray-400 font-bold uppercase">Customer Name</div>
                    <div className="font-bold text-gray-800">{viewingInvoice.customerId?.customerName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[8px] text-gray-400 font-bold uppercase">Company Name</div>
                    <div className="font-bold text-gray-800">{viewingInvoice.customerId?.companyName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[8px] text-gray-400 font-bold uppercase">Billing Address</div>
                    <div className="font-bold text-gray-800 text-[10px]">
                      {(() => {
                        const addr = viewingInvoice.customerId?.billingAddress;
                        if (!addr) return 'N/A';
                        if (typeof addr === 'string') return addr;
                        const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
                        return parts.length > 0 ? parts.join(', ') : 'N/A';
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] text-gray-400 font-bold uppercase">Contact Person</div>
                    <div className="font-bold text-gray-800 text-[10px]">{viewingInvoice.customerId?.email} {viewingInvoice.customerId?.phone && `| ${viewingInvoice.customerId?.phone}`}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider border-b pb-0.5">References & Meta</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[8px] text-gray-400 font-bold uppercase">Deal Name</div>
                      <div className="font-bold text-gray-800">{viewingInvoice.dealId?.title || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-gray-400 font-bold uppercase">Deal Number</div>
                      <div className="font-bold text-gray-800">{viewingInvoice.dealId?.dealCode || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-gray-400 font-bold uppercase">Quotation Ref</div>
                      <div className="font-bold text-blue-600 font-mono">{viewingInvoice.quotationId?.quotationNumber || 'Direct Conversion'}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-gray-400 font-bold uppercase">Salesperson</div>
                      <div className="font-bold text-gray-850">{viewingInvoice.salesPersonId?.name || 'Operator'}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-gray-400 font-bold uppercase">Invoice Date</div>
                      <div className="font-bold text-gray-800">
                        {(() => {
                          const dateVal = viewingInvoice.invoiceDate || viewingInvoice.createdAt;
                          if (!dateVal) return 'N/A';
                          const d = new Date(dateVal);
                          return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
                        })()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] text-gray-400 font-bold uppercase">Currency</div>
                      <div className="font-bold text-gray-800">INR (₹)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 border-b font-bold text-gray-500">
                      <th className="p-2">Item</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Unit Price</th>
                      <th className="p-2 text-right">Tax</th>
                      <th className="p-2 text-right">Discount</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingInvoice.products?.map((p, idx) => {
                      const matched = products.find(prod => prod._id === (p.productId?._id || p.productId));
                      return (
                        <tr key={idx} className="border-b last:border-0 hover:bg-slate-50/50">
                          <td className="p-2 font-semibold text-gray-700">{p.name || matched?.name || 'Standard Product Line'}</td>
                          <td className="p-2 text-right">{p.quantity}</td>
                          <td className="p-2 text-right">₹{p.unitPrice}</td>
                          <td className="p-2 text-right">₹{p.tax || 0}</td>
                          <td className="p-2 text-right">-₹{p.discount || 0}</td>
                          <td className="p-2 text-right font-bold text-gray-850">₹{p.total || (p.quantity * p.unitPrice + (p.tax || 0) - (p.discount || 0))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-start pt-4 border-t font-semibold text-[11px]">
                <div className="space-y-1">
                  {viewingInvoice.paymentTerms && (
                    <div>Payment Terms: <span className="text-gray-800 font-bold">{viewingInvoice.paymentTerms}</span></div>
                  )}
                  {viewingInvoice.notes && (
                    <div className="text-[10px] text-gray-500 max-w-[250px]">Notes: {viewingInvoice.notes}</div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 font-bold text-xs">
                  <div>Subtotal: <span className="font-semibold">₹{viewingInvoice.subtotal}</span></div>
                  <div>Tax: <span className="font-semibold text-green-700">+₹{viewingInvoice.tax}</span></div>
                  <div>Discount: <span className="font-semibold text-red-650">-₹{viewingInvoice.discount}</span></div>
                  {viewingInvoice.additionalDiscount > 0 && (
                    <div>Additional Discount: <span className="font-semibold text-red-600">-₹{viewingInvoice.additionalDiscount}</span></div>
                  )}
                  <div>Shipping: <span className="font-semibold">+₹{viewingInvoice.shippingCharge || 0}</span></div>
                  <div className="text-sm text-blue-600 font-extrabold mt-1">Grand Total: ${viewingInvoice.grandTotal}</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
              <button onClick={() => { alert('Downloading simulated PDF receipt!'); }} className="px-3.5 py-2 bg-slate-50 border border-gray-250 hover:bg-gray-100 text-gray-700 font-bold rounded-lg cursor-pointer flex items-center gap-1.5">
                <FileDown className="w-3.5 h-3.5 text-gray-400" /> Download PDF
              </button>
              {viewingInvoice.paymentStatus !== 'PAID' && (
                <button onClick={() => { setShowRecordPaymentModal(viewingInvoice); setShowViewModal(false); }} className="px-3.5 py-2 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded-lg font-bold cursor-pointer">
                  Record Payment
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

export default InvoiceList;
