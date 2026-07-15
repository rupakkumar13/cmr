import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReportData, setReportType } from '../../../store/reportsSlice.js';
import { Loader2, Search, Calendar, ArrowUpDown, FileDown, Printer, Info } from 'lucide-react';

const ReportView = () => {
  const dispatch = useDispatch();
  const { reportType, data, summary, total, totalPages, currentPage, loading } = useSelector((state) => state.reports);

  // Filters state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  const reportOptions = [
    { value: 'sales', label: 'Sales Report' },
    { value: 'revenue', label: 'Revenue Report' },
    { value: 'customers', label: 'Customers Performance' },
    { value: 'employees', label: 'Employees Directory' },
    { value: 'inventory', label: 'Inventory Valuation' },
    { value: 'invoices', label: 'Invoices Report' },
    { value: 'payments', label: 'Payments Collections' },
    { value: 'payroll', label: 'Payroll Ledger' }
  ];

  // Fetch report data on tab/filter updates
  const loadReport = () => {
    dispatch(fetchReportData({
      reportType,
      params: {
        startDate: startDate ? new Date(startDate).toISOString() : '',
        endDate: endDate ? new Date(endDate).toISOString() : '',
        search,
        page,
        sortBy,
        sortOrder
      }
    }));
  };

  useEffect(() => {
    loadReport();
  }, [dispatch, reportType, page, sortBy, sortOrder]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadReport();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // CSV Data Export Handler
  const exportToCSV = () => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).filter(k => k !== '__v' && k !== 'isDeleted');
    
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        if (val && typeof val === 'object') {
          return `"${(val.customerName || val.name || val.companyName || val.id || JSON.stringify(val)).replace(/"/g, '""')}"`;
        }
        return `"${String(val || '').replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  // Excel (TSV) Data Export Handler
  const exportToExcel = () => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).filter(k => k !== '__v' && k !== 'isDeleted');
    let content = headers.join('\t') + '\n';

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        if (val && typeof val === 'object') {
          return val.customerName || val.name || val.companyName || val.id || JSON.stringify(val);
        }
        return String(val || '');
      });
      content += values.join('\t') + '\n';
    }

    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.xls`);
    link.click();
  };

  // Print PDF Dialog Handler
  const triggerPDFPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-xs text-slate-700 print:p-0 print:m-0 max-w-7xl mx-auto">
      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header controls - hidden in print */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Enterprise Reports Ledger</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Generate lists, filters parameters, and export spreadsheets</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={reportType}
            onChange={(e) => {
              dispatch(setReportType(e.target.value));
              setPage(1);
            }}
            className="bg-white border border-slate-200 rounded-md py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs hover:border-slate-350 transition-all duration-150 h-9 cursor-pointer"
          >
            {reportOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <button
            onClick={exportToCSV}
            className="px-3 h-9 border border-slate-200 rounded-md bg-white text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5 transition-all duration-150 shadow-xs active:scale-[0.98]"
          >
            <FileDown className="w-3.5 h-3.5" /> CSV
          </button>

          <button
            onClick={exportToExcel}
            className="px-3 h-9 border border-slate-200 rounded-md bg-white text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5 transition-all duration-150 shadow-xs active:scale-[0.98]"
          >
            <FileDown className="w-3.5 h-3.5" /> Excel
          </button>

          <button
            onClick={triggerPDFPrint}
            className="px-3 h-9 border border-slate-200 rounded-md bg-white text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5 transition-all duration-150 shadow-xs active:scale-[0.98]"
          >
            <Printer className="w-3.5 h-3.5" /> Print PDF
          </button>
        </div>
      </div>

      {/* Filters Form - hidden in print */}
      <form onSubmit={handleFilterSubmit} className="bg-slate-50/50 border border-slate-200 p-5 rounded-xl flex flex-wrap gap-4 items-end no-print shadow-2xs">
        <div className="flex-1 min-w-[240px] space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Search terms</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, names, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs font-medium text-slate-700 placeholder-slate-450 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs h-9 transition-all"
            />
          </div>
        </div>

        <div className="w-full sm:w-40 space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 text-xs font-medium text-slate-750 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs h-9 transition-all"
          />
        </div>

        <div className="w-full sm:w-40 space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 text-xs font-medium text-slate-750 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs h-9 transition-all"
          />
        </div>

        <button
          type="submit"
          className="px-5 h-9 bg-indigo-650 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold rounded-md flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow transition-all duration-150"
        >
          Generate Report
        </button>
      </form>

      {/* Report Summary stats */}
      {summary && (
        <div className="p-5 bg-indigo-50/20 border border-indigo-100/50 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 no-print shadow-3xs">
          {reportType === 'sales' && (
            <>
              <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-2xs">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Invoice Sales</p>
                <p className="text-lg font-extrabold text-indigo-600 mt-1">₹{summary.totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-2xs">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Taxes collected</p>
                <p className="text-lg font-extrabold text-slate-900 mt-1">₹{summary.totalTax.toLocaleString()}</p>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-2xs">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Discounts applied</p>
                <p className="text-lg font-extrabold text-slate-900 mt-1">₹{summary.totalDiscount.toLocaleString()}</p>
              </div>
            </>
          )}

          {reportType === 'revenue' && (
            <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-2xs">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Cash Revenue</p>
              <p className="text-lg font-extrabold text-emerald-600 mt-1">₹{summary.totalRevenue.toLocaleString()}</p>
            </div>
          )}

          {reportType === 'inventory' && (
            <>
              <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-2xs">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Active SKUs</p>
                <p className="text-lg font-extrabold text-slate-900 mt-1">{summary.totalSKUs}</p>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-2xs">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Low Stock Alerts</p>
                <p className="text-lg font-extrabold text-rose-600 mt-1">{summary.lowStockCount}</p>
              </div>
            </>
          )}

          {reportType === 'payroll' && (
            <>
              <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-2xs">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Basic Salaries</p>
                <p className="text-lg font-extrabold text-slate-900 mt-1">₹{summary.totalBasic.toLocaleString()}</p>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-2xs">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Allowances disbursed</p>
                <p className="text-lg font-extrabold text-slate-900 mt-1">₹{summary.totalAllowances.toLocaleString()}</p>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-2xs">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Tax Deductions</p>
                <p className="text-lg font-extrabold text-slate-900 mt-1">₹{summary.totalDeductions.toLocaleString()}</p>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-2xs">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Net Payroll Outlay</p>
                <p className="text-lg font-extrabold text-indigo-650 mt-1">₹{summary.totalNetPay.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Print / View Area */}
      <div id="print-area" className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Print Header (Only visible in PDF prints) */}
        <div className="hidden print:block p-6 border-b border-slate-200 bg-slate-50/55 space-y-1.5">
          <h1 className="text-sm font-extrabold text-slate-950 uppercase tracking-wide">Enterprise ERP Report Ledger</h1>
          <p className="text-[9px] text-slate-500 font-bold uppercase">Report Category: {reportType} | Date Generated: {new Date().toLocaleDateString()}</p>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-3xs">
              <Search className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-900 font-semibold text-sm">No report data matched your criteria</p>
              <p className="text-slate-500 max-w-xs text-xs mx-auto">Adjust your search term or select a wider date range to regenerate the report.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {reportType === 'sales' && (
                    <>
                      <th className="p-3.5 cursor-pointer hover:bg-slate-100/50 hover:text-slate-900 transition-colors" onClick={() => handleSort('invoiceNumber')}>Invoice No</th>
                      <th className="p-3.5">Customer Client</th>
                      <th className="p-3.5 cursor-pointer hover:bg-slate-100/50 hover:text-slate-900 transition-colors" onClick={() => handleSort('invoiceDate')}>Billing Date</th>
                      <th className="p-3.5">Subtotal</th>
                      <th className="p-3.5">Tax</th>
                      <th className="p-3.5">Discount</th>
                      <th className="p-3.5 cursor-pointer hover:bg-slate-100/50 hover:text-slate-900 transition-colors" onClick={() => handleSort('grandTotal')}>Grand Total</th>
                    </>
                  )}

                  {reportType === 'revenue' && (
                    <>
                      <th className="p-3.5">Payment Receipt No</th>
                      <th className="p-3.5">Invoice No</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5 cursor-pointer hover:bg-slate-100/50 hover:text-slate-900 transition-colors" onClick={() => handleSort('amount')}>Amount Received</th>
                      <th className="p-3.5">Payment Method</th>
                      <th className="p-3.5 cursor-pointer hover:bg-slate-100/50 hover:text-slate-900 transition-colors" onClick={() => handleSort('paymentDate')}>Collection Date</th>
                    </>
                  )}

                  {reportType === 'customers' && (
                    <>
                      <th className="p-3.5 cursor-pointer hover:bg-slate-100/50 hover:text-slate-900 transition-colors" onClick={() => handleSort('customerCode')}>Code</th>
                      <th className="p-3.5 cursor-pointer hover:bg-slate-100/50 hover:text-slate-900 transition-colors" onClick={() => handleSort('customerName')}>Customer</th>
                      <th className="p-3.5">Company</th>
                      <th className="p-3.5">Invoices Raised</th>
                      <th className="p-3.5">Total Billed</th>
                      <th className="p-3.5">Total Received</th>
                      <th className="p-3.5">Remaining Balance</th>
                    </>
                  )}

                  {reportType === 'employees' && (
                    <>
                      <th className="p-3.5">Employee ID</th>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Designation</th>
                      <th className="p-3.5">Onboarding Date</th>
                      <th className="p-3.5">Status</th>
                    </>
                  )}

                  {reportType === 'inventory' && (
                    <>
                      <th className="p-3.5">Product Code</th>
                      <th className="p-3.5">Product Name</th>
                      <th className="p-3.5">SKU Code</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5 cursor-pointer hover:bg-slate-100/50 hover:text-slate-900 transition-colors" onClick={() => handleSort('purchasePrice')}>Purchase Price</th>
                      <th className="p-3.5 cursor-pointer hover:bg-slate-100/50 hover:text-slate-900 transition-colors" onClick={() => handleSort('sellingPrice')}>Selling Price</th>
                      <th className="p-3.5 cursor-pointer hover:bg-slate-100/50 hover:text-slate-900 transition-colors" onClick={() => handleSort('currentStock')}>Current Stock</th>
                      <th className="p-3.5">Stock Status</th>
                    </>
                  )}

                  {reportType === 'invoices' && (
                    <>
                      <th className="p-3.5">Invoice Number</th>
                      <th className="p-3.5">Customer Client</th>
                      <th className="p-3.5">Invoice Date</th>
                      <th className="p-3.5">Due Date</th>
                      <th className="p-3.5">Total Amount</th>
                      <th className="p-3.5">Payment Status</th>
                    </>
                  )}

                  {reportType === 'payments' && (
                    <>
                      <th className="p-3.5">Payment No</th>
                      <th className="p-3.5">Invoice Reference</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Method</th>
                      <th className="p-3.5">Transaction ID</th>
                    </>
                  )}

                  {reportType === 'payroll' && (
                    <>
                      <th className="p-3.5">Employee</th>
                      <th className="p-3.5">Pay Period</th>
                      <th className="p-3.5">Basic Salary</th>
                      <th className="p-3.5">Allowances</th>
                      <th className="p-3.5">Deductions</th>
                      <th className="p-3.5">Net Salary Paid</th>
                      <th className="p-3.5">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {data.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/50 transition-colors">
                    {reportType === 'sales' && (
                      <>
                        <td className="p-3.5 font-semibold text-slate-900">{row.invoiceNumber}</td>
                        <td className="p-3.5 text-slate-900">{row.customerId?.customerName}</td>
                        <td className="p-3.5 text-slate-500">{new Date(row.invoiceDate).toLocaleDateString()}</td>
                        <td className="p-3.5">₹{row.subtotal.toLocaleString()}</td>
                        <td className="p-3.5 text-emerald-600">+₹{row.tax.toLocaleString()}</td>
                        <td className="p-3.5 text-rose-600">-₹{row.discount.toLocaleString()}</td>
                        <td className="p-3.5 font-bold text-indigo-600">₹{row.grandTotal.toLocaleString()}</td>
                      </>
                    )}

                    {reportType === 'revenue' && (
                      <>
                        <td className="p-3.5 font-semibold text-slate-900">{row.paymentNumber}</td>
                        <td className="p-3.5 text-slate-500">{row.invoiceId?.invoiceNumber}</td>
                        <td className="p-3.5 text-slate-900">{row.customerId?.customerName}</td>
                        <td className="p-3.5 font-bold text-emerald-650">₹{row.amount.toLocaleString()}</td>
                        <td className="p-3.5 text-slate-500">{row.paymentMethod}</td>
                        <td className="p-3.5 text-slate-500">{new Date(row.paymentDate).toLocaleDateString()}</td>
                      </>
                    )}

                    {reportType === 'customers' && (
                      <>
                        <td className="p-3.5 font-semibold text-slate-900">{row.customerCode}</td>
                        <td className="p-3.5 text-slate-900">{row.customerName}</td>
                        <td className="p-3.5 text-slate-500">{row.companyName}</td>
                        <td className="p-3.5 text-center text-slate-800">{row.invoiceCount}</td>
                        <td className="p-3.5 font-bold text-slate-900">₹{row.totalInvoiced.toLocaleString()}</td>
                        <td className="p-3.5 text-emerald-600">₹{row.totalPaid.toLocaleString()}</td>
                        <td className="p-3.5 text-rose-600">₹{row.totalRemaining.toLocaleString()}</td>
                      </>
                    )}

                    {reportType === 'employees' && (
                      <>
                        <td className="p-3.5 font-semibold text-slate-900">{row.employeeId}</td>
                        <td className="p-3.5 text-slate-900">{row.name}</td>
                        <td className="p-3.5 text-slate-500">{row.department?.name || 'General'}</td>
                        <td className="p-3.5 text-slate-600">{row.designation}</td>
                        <td className="p-3.5 text-slate-500">{new Date(row.dateOfJoining).toLocaleDateString()}</td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            row.status === 'ACTIVE' 
                              ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' 
                              : 'bg-slate-100/70 border-slate-200 text-slate-600'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}

                    {reportType === 'inventory' && (
                      <>
                        <td className="p-3.5 font-semibold text-slate-900">{row.productCode}</td>
                        <td className="p-3.5 text-slate-900">{row.name}</td>
                        <td className="p-3.5 font-mono text-slate-500">{row.sku}</td>
                        <td className="p-3.5 text-slate-600">{row.categoryId?.name || 'Uncategorized'}</td>
                        <td className="p-3.5">₹{row.purchasePrice.toLocaleString()}</td>
                        <td className="p-3.5">₹{row.sellingPrice.toLocaleString()}</td>
                        <td className="p-3.5 text-center font-bold text-slate-900">{row.currentStock}</td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            row.currentStock <= row.minimumStock 
                              ? 'bg-rose-55 border-rose-100 text-rose-700' 
                              : 'bg-emerald-50/50 border-emerald-100 text-emerald-700'
                          }`}>
                            {row.currentStock <= row.minimumStock ? 'LOW STOCK' : 'STOCKED'}
                          </span>
                        </td>
                      </>
                    )}

                    {reportType === 'invoices' && (
                      <>
                        <td className="p-3.5 font-semibold text-slate-900">{row.invoiceNumber}</td>
                        <td className="p-3.5 text-slate-900">{row.customerId?.customerName}</td>
                        <td className="p-3.5 text-slate-500">{new Date(row.invoiceDate).toLocaleDateString()}</td>
                        <td className="p-3.5 text-slate-500">{new Date(row.dueDate).toLocaleDateString()}</td>
                        <td className="p-3.5 font-bold text-indigo-600">₹{row.grandTotal.toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            row.paymentStatus === 'PAID' 
                              ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' 
                              : row.paymentStatus === 'PARTIALLY_PAID'
                              ? 'bg-amber-50/50 border-amber-100 text-amber-700'
                              : 'bg-rose-50/50 border-rose-100 text-rose-700'
                          }`}>
                            {row.paymentStatus}
                          </span>
                        </td>
                      </>
                    )}

                    {reportType === 'payments' && (
                      <>
                        <td className="p-3.5 font-semibold text-slate-900">{row.paymentNumber}</td>
                        <td className="p-3.5 text-slate-500">{row.invoiceId?.invoiceNumber}</td>
                        <td className="p-3.5 text-slate-900">{row.customerId?.customerName}</td>
                        <td className="p-3.5 font-bold text-emerald-600">₹{row.amount.toLocaleString()}</td>
                        <td className="p-3.5 text-slate-500">{row.paymentMethod}</td>
                        <td className="p-3.5 font-mono text-[10px] text-slate-400">{row.transactionId || '—'}</td>
                      </>
                    )}

                    {reportType === 'payroll' && (
                      <>
                        <td className="p-3.5 font-semibold text-slate-900">{row.employee?.name}</td>
                        <td className="p-3.5 text-slate-500">
                          {new Date(row.payPeriod?.startDate).toLocaleDateString()} - {new Date(row.payPeriod?.endDate).toLocaleDateString()}
                        </td>
                        <td className="p-3.5">₹{row.basicSalary.toLocaleString()}</td>
                        <td className="p-3.5 text-emerald-600">+₹{row.allowances.toLocaleString()}</td>
                        <td className="p-3.5 text-rose-600">-₹{row.deductions.toLocaleString()}</td>
                        <td className="p-3.5 font-bold text-indigo-600">₹{row.netSalary.toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            row.status === 'PAID' 
                              ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' 
                              : 'bg-amber-50/50 border-amber-100 text-amber-700'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination controls - hidden in print */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-slate-50/50 p-4 border border-slate-200 rounded-xl no-print shadow-3xs">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white font-semibold cursor-pointer shadow-2xs transition-all active:scale-[0.98]"
          >
            Previous
          </button>
          <span className="font-medium text-slate-500">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white font-semibold cursor-pointer shadow-2xs transition-all active:scale-[0.98]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportView;
