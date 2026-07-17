import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchQuotations, 
  createQuotation, 
  updateQuotation, 
  updateQuotationStatus, 
  convertQuotation, 
  deleteQuotation 
} from '../../../store/billingSlice.js';
import { fetchCustomers, fetchDeals } from '../../../store/crmSlice.js';
import { fetchProducts } from '../../../store/inventorySlice.js';
import { 
  Loader2, Plus, Search, Filter, Mail, Phone, Calendar, ArrowRight, FileText, 
  CheckCircle2, MoreVertical, X, Check, Eye, Edit, Trash2, Copy, Send, 
  Clock, DollarSign, Ban
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';

const QuotationList = ({ searchQuery }) => {
  const dispatch = useDispatch();
  const { quotations = [], loading } = useSelector((state) => state.billing);
  const { customers = [], deals = [] } = useSelector((state) => state.crm);
  const { products = [] } = useSelector((state) => state.inventory);
  const { user: currentUser } = useSelector((state) => state.auth);

  // Modal Control States
  const [showModal, setShowModal] = useState(false);
  const [showDealSelectModal, setShowDealSelectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingQuotation, setViewingQuotation] = useState(null);

  // Selection & Mode States
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [customItems, setCustomItems] = useState({});

  // Dropdown actions menu mapping
  const [activeActionsId, setActiveActionsId] = useState(null);

  // Select Deal Filter States
  const [dealSearchText, setDealSearchText] = useState('');
  const [dealStageFilter, setDealStageFilter] = useState('');
  const [dealSalespersonFilter, setDealSalespersonFilter] = useState('');

  // Primary Quotations List Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dealFilter, setDealFilter] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('');

  const { register, handleSubmit, control, watch, reset, setValue } = useForm({
    defaultValues: {
      products: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }],
      shippingCharge: 0,
      termsAndConditions: '',
      notes: '',
      expiryDate: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products'
  });

  const watchProducts = watch('products');
  const watchShipping = Number(watch('shippingCharge')) || 0;

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
    localGrandTotal += watchShipping;
  }

  // Load initial datasets
  useEffect(() => {
    const params = {};
    if (currentUser?.role === 'SALES') {
      params.salespersonId = currentUser.id || currentUser._id;
    }
    dispatch(fetchQuotations(params));
    dispatch(fetchCustomers());
    dispatch(fetchDeals());
    dispatch(fetchProducts());
  }, [dispatch, currentUser]);

  // Handle active deal preselection from crm deals board
  useEffect(() => {
    const activeDealId = localStorage.getItem('crm_active_deal_id');
    const activeDealAction = localStorage.getItem('crm_active_deal_action');
    if (activeDealId && activeDealAction === 'create_quotation' && deals.length > 0) {
      const deal = deals.find(d => String(d._id) === String(activeDealId));
      if (deal) {
        // Clear active deal keys
        localStorage.removeItem('crm_active_deal_id');
        localStorage.removeItem('crm_active_deal_action');
        
        // Select deal and move directly to form
        setSelectedDeal(deal);
        setIsEditMode(false);
        setEditingQuotation(null);
        
        reset({
          customerId: deal.customer?._id || deal.customer,
          companyId: deal.customer?._id || deal.customer,
          dealId: deal._id,
          salespersonId: deal.assignedSalesPerson?._id || deal.assignedSalesPerson || currentUser.id || currentUser._id,
          shippingCharge: 0,
          termsAndConditions: '',
          notes: '',
          expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          products: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }]
        });
        
        setShowDealSelectModal(false);
        setModalError(null);
        setShowModal(true);
      }
    }
  }, [deals, reset, currentUser]);

  // Click outside listener to close row action menus
  useEffect(() => {
    if (!activeActionsId) return;
    const closeMenu = () => setActiveActionsId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [activeActionsId]);

  // Global search bar sync
  useEffect(() => {
    if (searchQuery === undefined) return;
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchQuery);
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Submit search query
  const handleFilterSubmit = (e) => {
    e.preventDefault();
  };

  // Convert Quotation to Invoice
  const handleConvertToInvoice = async (id) => {
    if (window.confirm('Are you sure you want to convert this quotation into an Invoice?')) {
      const res = await dispatch(convertQuotation(id));
      if (convertQuotation.fulfilled.match(res)) {
        alert('Quotation converted to Invoice successfully!');
        const params = {};
        if (currentUser?.role === 'SALES') {
          params.salespersonId = currentUser.id || currentUser._id;
        }
        dispatch(fetchQuotations(params));
      } else {
        alert(res.payload || 'Failed to convert quotation to invoice.');
      }
    }
  };

  // Status transitions
  const handleStatusChange = async (id, status) => {
    const res = await dispatch(updateQuotationStatus({ id, status }));
    if (updateQuotationStatus.fulfilled.match(res)) {
      if (status === 'ACCEPTED') {
        alert('Quotation status updated to ACCEPTED! Linked Deal stage updated to Closed Won.');
      } else {
        alert(`Quotation status updated to ${status}.`);
      }
      const params = {};
      if (currentUser?.role === 'SALES') {
        params.salespersonId = currentUser.id || currentUser._id;
      }
      dispatch(fetchQuotations(params));
    } else {
      alert(res.payload || 'Failed to update quotation status.');
    }
  };

  // Create or Update submit handler
  const onFormSubmit = async (data) => {
    setModalError(null);

    // Validate that each product item has either a productId or a name
    const invalidItem = data.products.find(p => !p.productId && !p.name);
    if (invalidItem) {
      setModalError("Please select a product from the catalog or write a custom product name manually.");
      return;
    }

    const payload = {
      customerId: data.customerId,
      companyId: data.companyId,
      dealId: data.dealId,
      salespersonId: data.salespersonId,
      expiryDate: new Date(data.expiryDate).toISOString(),
      notes: data.notes,
      termsAndConditions: data.termsAndConditions,
      shippingCharge: Number(data.shippingCharge) || 0,
      products: data.products.map(p => ({
        productId: p.productId || undefined,
        name: p.name || undefined,
        quantity: Number(p.quantity),
        unitPrice: Number(p.unitPrice),
        discount: Number(p.discount) || 0,
        tax: Number(p.tax) || 0
      }))
    };

    let result;
    if (isEditMode && editingQuotation) {
      result = await dispatch(updateQuotation({ id: editingQuotation._id, data: payload }));
    } else {
      result = await dispatch(createQuotation(payload));
    }

    if (createQuotation.fulfilled.match(result) || updateQuotation.fulfilled.match(result)) {
      setShowModal(false);
      reset({
        products: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }],
        shippingCharge: 0,
        termsAndConditions: '',
        notes: '',
        expiryDate: ''
      });
      setSelectedDeal(null);
      setEditingQuotation(null);
      const params = {};
      if (currentUser?.role === 'SALES') {
        params.salespersonId = currentUser.id || currentUser._id;
      }
      dispatch(fetchQuotations(params));
    } else {
      setModalError(result.payload || 'Failed to save quotation proposal.');
    }
  };

  // Duplicate quotation
  const handleDuplicate = async (q) => {
    if (window.confirm('Do you want to duplicate this quotation proposal?')) {
      const payload = {
        customerId: q.customerId?._id || q.customerId,
        companyId: q.companyId?._id || q.companyId || q.customerId?._id || q.customerId,
        dealId: q.dealId?._id || q.dealId,
        salespersonId: q.salespersonId?._id || q.salesPersonId?._id || q.salespersonId || q.salesPersonId,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        notes: q.notes,
        termsAndConditions: q.termsAndConditions,
        shippingCharge: q.shippingCharge || 0,
        products: q.products.map(p => ({
          productId: p.productId?._id || p.productId,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          discount: p.discount || 0,
          tax: p.tax || 0
        }))
      };

      const result = await dispatch(createQuotation(payload));
      if (createQuotation.fulfilled.match(result)) {
        const params = {};
        if (currentUser?.role === 'SALES') {
          params.salespersonId = currentUser.id || currentUser._id;
        }
        dispatch(fetchQuotations(params));
      } else {
        alert(result.payload || 'Failed to duplicate quotation.');
      }
    }
  };

  // Delete quotation
  const handleDeleteQuotation = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this quotation proposal?')) {
      const res = await dispatch(deleteQuotation(id));
      if (deleteQuotation.fulfilled.match(res)) {
        const params = {};
        if (currentUser?.role === 'SALES') {
          params.salespersonId = currentUser.id || currentUser._id;
        }
        dispatch(fetchQuotations(params));
      }
    }
  };

  // Filter deals for selection (must be in Proposal or Negotiation stages)
  const allowedDeals = deals.filter(deal => {
    const isStageAllowed = ['PROPOSAL', 'NEGOTIATION'].includes(deal.stage);
    if (!isStageAllowed) return false;

    // Sales Executive restriction
    if (currentUser?.role === 'SALES') {
      const repId = deal.assignedSalesPerson?._id || deal.assignedSalesPerson || '';
      return repId.toString() === (currentUser.id || currentUser._id).toString();
    }
    return true; // Manager and Admin see all
  });

  // Apply filters on the allowed deals selection list
  const filteredDeals = allowedDeals.filter(deal => {
    if (dealSearchText && !deal.title.toLowerCase().includes(dealSearchText.toLowerCase())) return false;
    if (dealStageFilter && deal.stage !== dealStageFilter) return false;
    if (dealSalespersonFilter) {
      const repId = deal.assignedSalesPerson?._id || deal.assignedSalesPerson || '';
      if (repId.toString() !== dealSalespersonFilter) return false;
    }
    return true;
  });

  // Filter quotations list displayed in the ledger table
  const filteredQuotations = quotations.filter(q => {
    if (search && !q.quotationNumber.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && q.quotationStatus !== statusFilter) return false;
    if (customerFilter && q.customerId?._id !== customerFilter) return false;
    if (dealFilter && q.dealId?._id !== dealFilter) return false;
    if (salespersonFilter) {
      const repId = q.salespersonId?._id || q.salesPersonId?._id || q.salespersonId || q.salesPersonId || '';
      if (repId.toString() !== salespersonFilter) return false;
    }
    return true;
  });

  // Extract unique sales representatives from deals dataset to populate filters
  const uniqueSalesReps = Array.from(
    new Map(
      deals
        .filter(d => d.assignedSalesPerson)
        .map(d => [d.assignedSalesPerson._id || d.assignedSalesPerson, d.assignedSalesPerson])
    ).values()
  );

  // Trigger Deal Selection modal
  const handleOpenDealSelect = () => {
    setSelectedDeal(null);
    setDealSearchText('');
    setDealStageFilter('');
    setDealSalespersonFilter('');
    setShowDealSelectModal(true);
  };

  // Continue to quotation form once a Deal is chosen
  const handleSelectDealContinue = () => {
    if (!selectedDeal) return;
    setIsEditMode(false);
    setEditingQuotation(null);
    
    // Auto-fill values in form
    reset({
      customerId: selectedDeal.customer?._id || selectedDeal.customer,
      companyId: selectedDeal.customer?._id || selectedDeal.customer,
      dealId: selectedDeal._id,
      salespersonId: selectedDeal.assignedSalesPerson?._id || selectedDeal.assignedSalesPerson || currentUser.id || currentUser._id,
      shippingCharge: 0,
      termsAndConditions: '',
      notes: '',
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days validity
      products: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }]
    });

    setShowDealSelectModal(false);
    setModalError(null);
    setShowModal(true);
  };

  // Open Edit form modal
  const handleOpenEdit = (q) => {
    setIsEditMode(true);
    setEditingQuotation(q);
    setSelectedDeal(q.dealId);

    reset({
      customerId: q.customerId?._id || q.customerId,
      companyId: q.companyId?._id || q.companyId || q.customerId?._id || q.customerId,
      dealId: q.dealId?._id || q.dealId,
      salespersonId: q.salespersonId?._id || q.salesPersonId?._id || q.salespersonId || q.salesPersonId || currentUser.id || currentUser._id,
      shippingCharge: q.shippingCharge || 0,
      termsAndConditions: q.termsAndConditions || '',
      notes: q.notes || '',
      expiryDate: q.expiryDate ? new Date(q.expiryDate).toISOString().split('T')[0] : '',
      products: q.products.map(p => ({
        productId: p.productId?._id || p.productId,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        discount: p.discount || 0,
        tax: p.tax || 0
      }))
    });

    setModalError(null);
    setShowModal(true);
  };

  // Open View Modal
  const handleOpenView = (q) => {
    setViewingQuotation(q);
    setShowViewModal(true);
  };

  // Mock sends
  const handleSendEmail = (q) => {
    alert(`Proposal quote ${q.quotationNumber} successfully queued and dispatched to client email: ${q.customerId?.email || 'N/A'}`);
    if (q.quotationStatus === 'DRAFT') {
      handleStatusChange(q._id, 'SENT');
    }
  };

  const handleDownloadPDF = (q) => {
    alert(`Initiating PDF generation for ${q.quotationNumber}. Document downloaded successfully.`);
  };

  return (
    <div className="space-y-6 text-xs text-gray-700">
      
      {/* Quotation Module Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Quotes */}
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs flex flex-col justify-between min-h-[90px]">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total Quotations</p>
          <h3 className="text-xl font-extrabold text-gray-900 mt-2">{quotations.length}</h3>
          <p className="text-[8px] text-gray-400 font-semibold mt-1">Acquisition Proposals</p>
        </div>
        {/* Pending Approval */}
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs flex flex-col justify-between min-h-[90px]">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Pending Approval</p>
          <h3 className="text-xl font-extrabold text-blue-600 mt-2">
            {quotations.filter(q => ['DRAFT', 'SENT', 'VIEWED'].includes(q.quotationStatus)).length}
          </h3>
          <p className="text-[8px] text-blue-500 font-semibold mt-1">Review status</p>
        </div>
        {/* Accepted */}
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs flex flex-col justify-between min-h-[90px]">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Accepted</p>
          <h3 className="text-xl font-extrabold text-green-600 mt-2">
            {quotations.filter(q => q.quotationStatus === 'ACCEPTED').length}
          </h3>
          <p className="text-[8px] text-green-500 font-semibold mt-1">Closed Won matches</p>
        </div>
        {/* Rejected */}
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs flex flex-col justify-between min-h-[90px]">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Rejected</p>
          <h3 className="text-xl font-extrabold text-red-650 mt-2">
            {quotations.filter(q => q.quotationStatus === 'REJECTED').length}
          </h3>
          <p className="text-[8px] text-red-500 font-semibold mt-1">Negotiation retry</p>
        </div>
        {/* Expired */}
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs flex flex-col justify-between min-h-[90px]">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Expired</p>
          <h3 className="text-xl font-extrabold text-gray-500 mt-2">
            {quotations.filter(q => q.quotationStatus === 'EXPIRED').length}
          </h3>
          <p className="text-[8px] text-gray-400 font-semibold mt-1">Passed validity dates</p>
        </div>
        {/* Revenue from Accepted */}
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs flex flex-col justify-between min-h-[90px]">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Revenue (Accepted)</p>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2 truncate">₹{quotations.filter(q => q.quotationStatus === 'ACCEPTED').reduce((sum, q) => sum + (q.totalAmount || 0), 0).toFixed(0)}
          </h3>
          <p className="text-[8px] text-gray-500 font-semibold mt-1">Gross Contract Value</p>
        </div>
      </div>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Quotation Proposals</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Acquire approvals, calculate prices, and transition quotes to invoices</p>
        </div>

        {['ADMIN', 'MANAGER', 'SALES'].includes(currentUser?.role) && (
          <button
            onClick={handleOpenDealSelect}
            className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Quotation
          </button>
        )}
      </div>

      {/* Filters Form Panel */}
      <form onSubmit={handleFilterSubmit} className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by quote number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-gray-300 rounded-lg py-1.5 pl-9 pr-3 text-xs font-medium placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer</label>
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="w-full bg-slate-50 border border-gray-300 rounded-lg py-1.5 px-3 text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-xs"
          >
            <option value="">All Customers</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>{c.customerName}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Associated Deal</label>
          <select
            value={dealFilter}
            onChange={(e) => setDealFilter(e.target.value)}
            className="w-full bg-slate-50 border border-gray-300 rounded-lg py-1.5 px-3 text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-xs"
          >
            <option value="">All Deals</option>
            {deals.map(d => (
              <option key={d._id} value={d._id}>{d.title}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sales Representative</label>
          <select
            value={salespersonFilter}
            onChange={(e) => setSalespersonFilter(e.target.value)}
            className="w-full bg-slate-50 border border-gray-300 rounded-lg py-1.5 px-3 text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-xs"
          >
            <option value="">All Representatives</option>
            {uniqueSalesReps.map(rep => (
              <option key={rep._id} value={rep._id}>{rep.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-gray-300 rounded-lg py-1.5 px-3 text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-xs"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SENT">SENT</option>
            <option value="VIEWED">VIEWED</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </form>

      {/* Main Ledger Table or Empty State */}
      {loading ? (
        <div className="py-24 bg-white border border-gray-200 rounded-xl shadow-xs flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredQuotations.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-16 px-6 rounded-xl flex flex-col items-center justify-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1 text-center">
            <h3 className="text-sm font-bold text-gray-900">No quotations yet</h3>
            <p className="text-[10px] text-gray-400 max-w-xs font-semibold leading-relaxed">
              Create your first quotation by selecting an active Deal currently in the Proposal or Negotiation stage.
            </p>
          </div>
          {['ADMIN', 'MANAGER', 'SALES'].includes(currentUser?.role) && (
            <button
              onClick={handleOpenDealSelect}
              className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" /> Select Deal
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Quotation Number</th>
                  <th className="p-4">Deal Name</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Salesperson</th>
                  <th className="p-4">Deal Stage</th>
                  <th className="p-4">Grand Total</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs text-gray-700 font-semibold">
                {filteredQuotations.map((q) => {
                  const repName = q.salespersonId?.name || q.salesPersonId?.name || 'Unassigned';
                  const isAccepted = q.quotationStatus === 'ACCEPTED';
                  const hasInvoice = q.invoiceId;

                  return (
                    <tr key={q._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900 whitespace-nowrap">{q.quotationNumber}</td>
                      <td className="p-4 text-gray-900 font-bold whitespace-nowrap">{q.dealId?.title || 'Direct Quote'}</td>
                      <td className="p-4 whitespace-nowrap">{q.customerId?.customerName}</td>
                      <td className="p-4 whitespace-nowrap">{q.customerId?.companyName}</td>
                      <td className="p-4 text-gray-600 whitespace-nowrap">{repName}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-100 text-slate-700 border font-bold uppercase">
                          {q.dealId?.stage?.replace('_', ' ') || 'NONE'}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-[#2563eb] whitespace-nowrap">₹{q.totalAmount?.toFixed(2)}</td>
                      <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(q.expiryDate).toLocaleDateString()}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border inline-block ${
                          q.quotationStatus === 'ACCEPTED' 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : q.quotationStatus === 'DRAFT'
                            ? 'bg-gray-150 border-gray-250 text-gray-700'
                            : q.quotationStatus === 'SENT'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : q.quotationStatus === 'VIEWED'
                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                          {q.quotationStatus}
                        </span>
                      </td>
                      <td className="p-4 relative text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionsId(activeActionsId === q._id ? null : q._id);
                          }}
                          className="p-1 rounded-full hover:bg-gray-100 cursor-pointer text-gray-500 hover:text-gray-900 transition-colors inline-block"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown action menu */}
                        {activeActionsId === q._id && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-4 top-10 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-30 text-xs font-semibold text-gray-700 animate-fade-in text-left divide-y divide-gray-100"
                          >
                            <div className="py-1">
                              <button
                                onClick={() => { handleOpenView(q); setActiveActionsId(null); }}
                                className="w-full text-left px-4 py-1.5 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-gray-400" /> View Quote
                              </button>
                              <button
                                onClick={() => { handleOpenEdit(q); setActiveActionsId(null); }}
                                className="w-full text-left px-4 py-1.5 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 text-gray-400" /> Edit Quote
                              </button>
                              <button
                                onClick={() => { handleDuplicate(q); setActiveActionsId(null); }}
                                className="w-full text-left px-4 py-1.5 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-gray-400" /> Duplicate
                              </button>
                            </div>

                            <div className="py-1">
                              <button
                                onClick={() => { handleDownloadPDF(q); setActiveActionsId(null); }}
                                className="w-full text-left px-4 py-1.5 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-gray-400" /> Download PDF
                              </button>
                              <button
                                onClick={() => { handleSendEmail(q); setActiveActionsId(null); }}
                                className="w-full text-left px-4 py-1.5 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5 text-gray-400" /> Send Email
                              </button>
                            </div>

                            <div className="py-1">
                              {q.quotationStatus !== 'ACCEPTED' && (
                                <button
                                  onClick={() => { handleStatusChange(q._id, 'ACCEPTED'); setActiveActionsId(null); }}
                                  className="w-full text-left px-4 py-1.5 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2 text-green-600 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" /> Mark Accepted
                                </button>
                              )}
                              {q.quotationStatus !== 'REJECTED' && (
                                <button
                                  onClick={() => { handleStatusChange(q._id, 'REJECTED'); setActiveActionsId(null); }}
                                  className="w-full text-left px-4 py-1.5 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 text-red-600 cursor-pointer"
                                >
                                  <Ban className="w-3.5 h-3.5" /> Mark Rejected
                                </button>
                              )}
                              {isAccepted && !hasInvoice && (
                                <button
                                  onClick={() => { handleConvertToInvoice(q._id); setActiveActionsId(null); }}
                                  className="w-full text-left px-4 py-1.5 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2 text-[#2563eb] font-bold cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Convert to Invoice
                                </button>
                              )}
                            </div>

                            <div className="py-1">
                              <button
                                onClick={() => { handleDeleteQuotation(q._id); setActiveActionsId(null); }}
                                className="w-full text-left px-4 py-1.5 hover:bg-red-50 hover:text-red-755 transition-colors flex items-center gap-2 text-red-650 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
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

      {/* SELECT DEAL MODAL */}
      {showDealSelectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-250 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Select Deal for Quotation Proposal</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Quotations must be created against an active Deal stage</p>
              </div>
              <button onClick={() => setShowDealSelectModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>

            {/* Deal Search and Filters */}
            <div className="p-5 bg-slate-50 border-b border-gray-200 flex flex-wrap sm:flex-nowrap gap-3 items-center">
              <div className="relative flex-1 min-w-44">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Deal name..."
                  value={dealSearchText}
                  onChange={(e) => setDealSearchText(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg py-1.5 pl-8 pr-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              <select
                value={dealStageFilter}
                onChange={(e) => setDealStageFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs font-semibold focus:outline-none"
              >
                <option value="">All stages</option>
                <option value="PROPOSAL">PROPOSAL</option>
                <option value="NEGOTIATION">NEGOTIATION</option>
              </select>

              {currentUser?.role !== 'SALES' && (
                <select
                  value={dealSalespersonFilter}
                  onChange={(e) => setDealSalespersonFilter(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs font-semibold focus:outline-none max-w-40"
                >
                  <option value="">All representatives</option>
                  {uniqueSalesReps.map(rep => (
                    <option key={rep._id} value={rep._id}>{rep.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Deals list cards */}
            <div className="p-5 max-h-[350px] overflow-y-auto space-y-3">
              {filteredDeals.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-semibold text-xs">
                  No matching Proposal or Negotiation deals found.
                </div>
              ) : (
                filteredDeals.map((deal) => {
                  const isSelected = selectedDeal?._id === deal._id;
                  const clientName = deal.customer?.customerName || 'Private Client';
                  const compName = deal.customer?.companyName || 'Private Org';
                  const repName = deal.assignedSalesPerson?.name || 'Unassigned';

                  return (
                    <div
                      key={deal._id}
                      onClick={() => setSelectedDeal(deal)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50 flex items-start justify-between gap-4 ${
                        isSelected 
                          ? 'border-[#2563eb] bg-blue-50/20 ring-1 ring-blue-600 shadow-sm' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="font-extrabold text-gray-900 text-xs">{deal.title}</div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400 font-bold">
                          <span>Client: <strong className="text-gray-750">{clientName}</strong></span>
                          <span>Company: <strong className="text-gray-750">{compName}</strong></span>
                          <span>Rep: <strong className="text-gray-750">{repName}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.5 rounded text-[8px] bg-blue-50 text-[#2563eb] border border-blue-200 font-extrabold uppercase">
                            {deal.stage}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">
                            Close: {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-[#2563eb]">₹{deal.amount}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-extrabold text-[10px] mt-2 shadow-xs">
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDealSelectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedDeal}
                onClick={handleSelectDealContinue}
                className={`px-4 py-2 rounded-lg font-semibold cursor-pointer ${
                  selectedDeal 
                    ? 'btn-primary' 
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT QUOTATION FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {isEditMode ? 'Edit Quotation Proposal' : 'Create Quotation Proposal'}
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  Linked to Deal: <strong className="text-gray-700">{selectedDeal?.title || 'Unknown'}</strong>
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 font-bold">
                  {modalError}
                </div>
              )}

              {/* Deal Details Panel (Read-only Enterprise Banner) */}
              <div className="bg-blue-50/30 border border-[#2563eb]/20 rounded-xl p-4 grid grid-cols-2 gap-y-3 gap-x-6 text-[10px] font-bold text-gray-500">
                <div>
                  <span className="block text-gray-400 uppercase text-[8px]">Associated Customer</span>
                  <span className="text-gray-900 text-xs font-extrabold">
                    {selectedDeal?.customer?.customerName || customers.find(c => c._id === selectedDeal?.customer)?.customerName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 uppercase text-[8px]">Company Name</span>
                  <span className="text-gray-900 text-xs font-extrabold">
                    {selectedDeal?.customer?.companyName || customers.find(c => c._id === selectedDeal?.customer)?.companyName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 uppercase text-[8px]">Salesperson / Representative</span>
                  <span className="text-gray-900 text-xs font-extrabold">
                    {selectedDeal?.assignedSalesPerson?.name || uniqueSalesReps.find(r => r._id === selectedDeal?.assignedSalesPerson)?.name || currentUser?.name || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 uppercase text-[8px]">Deal Value</span>
                  <span className="text-[#2563eb] text-xs font-extrabold">₹{selectedDeal?.amount || 0} INR
                  </span>
                </div>
                {selectedDeal?.customer?.billingAddress && (
                  <div className="col-span-2 border-t pt-2 mt-1">
                    <span className="block text-gray-400 uppercase text-[8px]">Billing Address</span>
                    <span className="text-gray-700 font-semibold leading-relaxed">
                      {selectedDeal.customer.billingAddress.street}, {selectedDeal.customer.billingAddress.city}, {selectedDeal.customer.billingAddress.state}, {selectedDeal.customer.billingAddress.country}
                    </span>
                  </div>
                )}
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expiry Date</label>
                  <input
                    {...register('expiryDate', { required: true })}
                    type="date"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-850 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Shipping Charge (₹)</label>
                  <input
                    {...register('shippingCharge')}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-850 font-semibold"
                  />
                </div>
              </div>

              {/* Products Section */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center border-b pb-1">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Line Items</h4>
                  <button
                    type="button"
                    onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 })}
                    className="px-2.5 py-1 text-[9px] font-bold border border-[#2563eb] text-[#2563eb] rounded-lg hover:bg-blue-50 cursor-pointer shadow-xs transition-all flex items-center gap-1"
                  >
                    + Add Product
                  </button>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50/50 p-2.5 border border-gray-255 rounded-xl shadow-2xs">
                      <div className="col-span-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-[8px] font-bold text-gray-400 uppercase">
                            {customItems[index] ? 'Custom Product' : 'Product Catalog'}
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const wasCustom = !!customItems[index];
                              setCustomItems(prev => ({ ...prev, [index]: !wasCustom }));
                              setValue(`products.${index}.productId`, '');
                              setValue(`products.${index}.name`, '');
                              setValue(`products.${index}.unitPrice`, 0);
                            }}
                            className="text-[8px] font-extrabold text-[#2563eb] hover:underline cursor-pointer"
                          >
                            {customItems[index] ? 'Use Catalog' : 'Write Manually'}
                          </button>
                        </div>
                        {customItems[index] ? (
                          <>
                            <input
                              {...register(`products.${index}.name`)}
                              placeholder="Type custom product name..."
                              className="w-full bg-white border border-gray-300 rounded-lg p-1 text-[10px] focus:outline-none font-bold"
                            />
                            <input type="hidden" {...register(`products.${index}.productId`)} value="" />
                          </>
                        ) : (
                          <>
                            <select
                              {...register(`products.${index}.productId`, {
                                onChange: (e) => {
                                  const pId = e.target.value;
                                  const prod = products.find(p => p._id === pId);
                                  if (prod) {
                                    setValue(`products.${index}.unitPrice`, prod.price || 0);
                                    setValue(`products.${index}.name`, prod.name);
                                  } else {
                                    setValue(`products.${index}.name`, '');
                                  }
                                }
                              })}
                              className="w-full bg-white border border-gray-300 rounded-lg p-1 text-[10px] focus:outline-none text-gray-700 font-bold cursor-pointer"
                            >
                              <option value="">Choose product...</option>
                              {products.map(p => (
                                <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                              ))}
                            </select>
                            <input type="hidden" {...register(`products.${index}.name`)} />
                          </>
                        )}
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label className="block text-[8px] font-bold text-gray-400 uppercase">Quantity</label>
                        <input
                          {...register(`products.${index}.quantity`, { required: true, min: 1 })}
                          type="number"
                          className="w-full bg-white border border-gray-300 rounded-lg p-1 text-[10px] focus:outline-none font-bold"
                        />
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label className="block text-[8px] font-bold text-gray-400 uppercase">Price (₹)</label>
                        <input
                          {...register(`products.${index}.unitPrice`, { required: true })}
                          type="number"
                          step="0.01"
                          className="w-full bg-white border border-gray-300 rounded-lg p-1 text-[10px] focus:outline-none font-bold"
                        />
                      </div>

                      <div className="col-span-1.5 space-y-1">
                        <label className="block text-[8px] font-bold text-gray-400 uppercase">Disc (₹)</label>
                        <input
                          {...register(`products.${index}.discount`)}
                          type="number"
                          step="0.01"
                          className="w-full bg-white border border-gray-300 rounded-lg p-1 text-[10px] focus:outline-none font-bold"
                        />
                      </div>

                      <div className="col-span-1.5 space-y-1">
                        <label className="block text-[8px] font-bold text-gray-400 uppercase">Tax (₹)</label>
                        <input
                          {...register(`products.${index}.tax`)}
                          type="number"
                          step="0.01"
                          className="w-full bg-white border border-gray-300 rounded-lg p-1 text-[10px] focus:outline-none font-bold"
                        />
                      </div>

                      <div className="col-span-1 flex justify-center pt-3">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-650 hover:text-red-755 font-bold cursor-pointer p-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Math summaries layout */}
              <div className="p-4 bg-slate-50 border border-gray-255 rounded-xl flex flex-wrap justify-between items-center text-xs font-bold text-gray-500 gap-4 mt-2 shadow-2xs">
                <div>Subtotal: <span className="text-gray-900 font-extrabold">₹{localSubtotal.toFixed(2)}</span></div>
                <div>Discount: <span className="text-red-650 font-extrabold">-₹{localDiscount.toFixed(2)}</span></div>
                <div>Tax: <span className="text-green-700 font-extrabold">+₹{localTax.toFixed(2)}</span></div>
                <div>Shipping: <span className="text-[#2563eb] font-extrabold">+₹{watchShipping.toFixed(2)}</span></div>
                <div className="text-sm">Grand Total: <span className="text-blue-600 font-extrabold">₹{localGrandTotal.toFixed(2)}</span></div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Terms & Conditions</label>
                <textarea
                  {...register('termsAndConditions')}
                  placeholder="Validity terms, delivery timelines, payment schedules..."
                  rows="2"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700 font-bold placeholder-gray-400 text-xs"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Internal Notes</label>
                <textarea
                  {...register('notes')}
                  placeholder="Internal notes (not visible on client PDF)..."
                  rows="2"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700 font-bold placeholder-gray-400 text-xs"
                ></textarea>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-5 py-2 rounded-lg font-bold cursor-pointer shadow-sm">
                  {isEditMode ? 'Update Quotation' : 'Save Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW QUOTATION PROPOSAL DETAILED MODAL */}
      {showViewModal && viewingQuotation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Quotation Proposal Sheet</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Reference Number: <strong className="text-gray-700">{viewingQuotation.quotationNumber}</strong></p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border inline-block uppercase ${
                  viewingQuotation.quotationStatus === 'ACCEPTED' 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : viewingQuotation.quotationStatus === 'DRAFT'
                    ? 'bg-gray-150 border-gray-250 text-gray-700'
                    : viewingQuotation.quotationStatus === 'SENT'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : viewingQuotation.quotationStatus === 'VIEWED'
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {viewingQuotation.quotationStatus}
                </span>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer ml-2">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-gray-700">
              
              {/* Top Row: Client vs Rep */}
              <div className="grid grid-cols-2 gap-6 border-b pb-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] text-gray-400 font-bold uppercase">Customer details</h4>
                  <p className="text-gray-900 font-extrabold text-sm">{viewingQuotation.customerId?.customerName}</p>
                  <p className="font-semibold text-gray-600">{viewingQuotation.customerId?.companyName}</p>
                  <p className="text-gray-500 font-medium">{viewingQuotation.customerId?.email}</p>
                  <p className="text-gray-500 font-medium">{viewingQuotation.customerId?.phone}</p>
                  {viewingQuotation.customerId?.billingAddress && (
                    <p className="text-gray-500 font-semibold mt-1">
                      {viewingQuotation.customerId.billingAddress.street}, {viewingQuotation.customerId.billingAddress.city}, {viewingQuotation.customerId.billingAddress.state}, {viewingQuotation.customerId.billingAddress.country}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-right">
                  <h4 className="text-[10px] text-gray-400 font-bold uppercase">Proposal parameters</h4>
                  <p className="text-gray-700 font-semibold">Deal Linked: <strong className="text-gray-900">{viewingQuotation.dealId?.title || 'Direct Quote'}</strong></p>
                  <p className="text-gray-700 font-semibold">Representative: <strong className="text-gray-900">{viewingQuotation.salespersonId?.name || viewingQuotation.salesPersonId?.name || 'Unassigned'}</strong></p>
                  <p className="text-gray-700 font-semibold">Stage of Deal: <strong className="text-gray-900">{viewingQuotation.dealId?.stage || 'N/A'}</strong></p>
                  <p className="text-red-650 font-bold mt-2">Valid Until: {new Date(viewingQuotation.expiryDate).toLocaleDateString()}</p>
                  
                  {viewingQuotation.invoiceId && (
                    <div className="pt-2 border-t mt-2 inline-block">
                      <span className="text-[9px] bg-green-50 border border-green-200 text-green-700 px-1.5 py-0.5 rounded font-extrabold">
                        Invoice Generated: {viewingQuotation.invoiceId.invoiceNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Products Table */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-gray-400 font-bold uppercase">Pricing & Line Items</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-bold text-[9px] uppercase tracking-wider border-b">
                        <th className="p-3">Product Name</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3">Unit Price</th>
                        <th className="p-3">Discount</th>
                        <th className="p-3">Tax</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-bold">
                      {viewingQuotation.products?.map((item, idx) => {
                        const product = products.find(p => p._id === (item.productId?._id || item.productId));
                        return (
                          <tr key={idx}>
                            <td className="p-3 text-gray-900">{item.name || product?.name || 'Standard Service Package'}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3">₹{item.unitPrice?.toFixed(2)}</td>
                            <td className="p-3 text-red-650">-₹{item.discount?.toFixed(2)}</td>
                            <td className="p-3 text-green-700">+₹{item.tax?.toFixed(2)}</td>
                            <td className="p-3 text-right text-gray-900">₹{item.total?.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Summaries */}
              <div className="grid grid-cols-2 gap-6 items-start pt-2">
                <div className="space-y-2">
                  {viewingQuotation.termsAndConditions && (
                    <div className="p-3 bg-slate-50 border rounded-xl leading-relaxed">
                      <span className="block text-[8px] font-bold text-gray-400 uppercase mb-0.5">Terms & Conditions</span>
                      <p className="text-[10px] text-gray-600 font-bold">{viewingQuotation.termsAndConditions}</p>
                    </div>
                  )}
                  {viewingQuotation.notes && (
                    <div className="p-3 bg-slate-50 border rounded-xl leading-relaxed">
                      <span className="block text-[8px] font-bold text-gray-400 uppercase mb-0.5">Internal Notes</span>
                      <p className="text-[10px] text-gray-600 font-bold">{viewingQuotation.notes}</p>
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-xl p-4 space-y-2.5 font-bold text-gray-500">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-gray-900">₹{viewingQuotation.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-650">
                    <span>Discount:</span>
                    <span>-₹{viewingQuotation.discount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Tax:</span>
                    <span>+₹{viewingQuotation.tax?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#2563eb]">
                    <span>Shipping:</span>
                    <span>+₹{viewingQuotation.shippingCharge?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-900 pt-2 border-t font-extrabold">
                    <span>Grand Total:</span>
                    <span className="text-[#2563eb]">₹{viewingQuotation.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleDownloadPDF(viewingQuotation)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer"
              >
                Download PDF
              </button>
              <button
                type="button"
                onClick={() => handleSendEmail(viewingQuotation)}
                className="btn-primary px-4 py-2 rounded-lg font-semibold cursor-pointer"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationList;
