import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers, createCustomer } from '../../../store/crmSlice.js';
import { Loader2, Plus, Search, Filter, Mail, Phone, Calendar, ArrowRightLeft, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';

const CustomerList = ({ onViewDetails, searchQuery }) => {
  const dispatch = useDispatch();
  const { customers, loading } = useSelector((state) => state.crm);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [industry, setIndustry] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (searchQuery === undefined) return;
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchQuery);
      dispatch(fetchCustomers({ search: searchQuery, status: selectedStatus, industry }));
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, dispatch, selectedStatus, industry]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchCustomers({ search, status: selectedStatus, industry }));
  };

  const onAddSubmit = async (data) => {
    setErrorMsg(null);
    const formattedData = {
      ...data,
      billingAddress: {
        street: data.billingStreet,
        city: data.billingCity,
        state: data.billingState,
        country: data.billingCountry,
        zipCode: data.billingZip
      }
    };

    const resultAction = await dispatch(createCustomer(formattedData));
    if (createCustomer.fulfilled.match(resultAction)) {
      setShowModal(false);
      reset();
      dispatch(fetchCustomers());
    } else {
      setErrorMsg(resultAction.payload || 'Failed to onboard customer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Directory</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Audit active customer portfolios and organizational accounts</p>
        </div>

        {['ADMIN', 'HR', 'MANAGER', 'SALES'].includes(currentUser?.role) && (
          <button
            onClick={() => {
              setErrorMsg(null);
              setShowModal(true);
            }}
            className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Customer Profile
          </button>
        )}
      </div>

      {/* Filters Form */}
      <form onSubmit={handleFilterSubmit} className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-1.5">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, company, email, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-xs font-medium placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="w-full md:w-44 space-y-1.5">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="LEAD">LEAD</option>
          </select>
        </div>

        <div className="w-full md:w-44 space-y-1.5">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Industry</label>
          <input
            type="text"
            placeholder="e.g. Technology"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-600"
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full md:w-auto px-4 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" /> Filter
        </button>
      </form>

      {/* Directory Table */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-12 rounded-lg text-gray-500 text-xs font-medium">
          No customer profiles registered.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Customer Code</th>
                  <th className="p-4">Name / Company</th>
                  <th className="p-4">Industry</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Assigned Sales</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs text-gray-700">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">{c.customerCode}</td>
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-gray-900">{c.customerName}</div>
                        <div className="text-gray-500 text-[10px] font-semibold mt-0.5">{c.companyName}</div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-700">{c.industry || 'Unassigned'}</td>
                    <td className="p-4 space-y-0.5 text-gray-500 font-medium">
                      <div>{c.email || 'N/A'}</div>
                      <div>{c.phone || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {c.assignedSalesPerson?.name || 'Unassigned'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        c.status === 'ACTIVE' 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onViewDetails(c._id)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in text-xs">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Add Customer Profile</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onAddSubmit)} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contact Name</label>
                  <input
                    {...register('customerName', { required: 'Customer name is required' })}
                    type="text"
                    placeholder="e.g. Tony Stark"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-600"
                  />
                  {errors.customerName && <p className="text-red-600 text-[10px] mt-0.5">{errors.customerName.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Company Name</label>
                  <input
                    {...register('companyName', { required: 'Company name is required' })}
                    type="text"
                    placeholder="e.g. Stark Industries"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-600"
                  />
                  {errors.companyName && <p className="text-red-600 text-[10px] mt-0.5">{errors.companyName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="tony@stark.com"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                  <input
                    {...register('phone')}
                    type="text"
                    placeholder="555-3000"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Website URL</label>
                  <input
                    {...register('website')}
                    type="text"
                    placeholder="https://stark.com"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Industry</label>
                  <input
                    {...register('industry')}
                    type="text"
                    placeholder="e.g. Tech, Defence"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-gray-150 pt-3 space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billing Address</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    {...register('billingStreet')}
                    type="text"
                    placeholder="Street Address"
                    className="col-span-2 w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
                  />
                  <input
                    {...register('billingCity')}
                    type="text"
                    placeholder="City"
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
                  />
                  <input
                    {...register('billingState')}
                    type="text"
                    placeholder="State"
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
                  />
                  <input
                    {...register('billingCountry')}
                    type="text"
                    placeholder="Country"
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
                  />
                  <input
                    {...register('billingZip')}
                    type="text"
                    placeholder="Zip Code"
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Notes</label>
                <textarea
                  {...register('notes')}
                  placeholder="Key corporate parameters details..."
                  rows="3"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs focus:outline-none"
                ></textarea>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
