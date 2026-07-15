import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../../store/inventorySlice.js';
import { Loader2, Plus, Search, Filter, Trash2, Edit2, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';

const SupplierList = () => {
  const dispatch = useDispatch();
  const { suppliers, loading } = useSelector((state) => state.inventory);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [modalError, setModalError] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchSuppliers({ search }));
  };

  const onAddSubmit = async (data) => {
    setModalError(null);
    const payload = {
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      email: data.email || undefined,
      phone: data.phone || undefined,
      gstNumber: data.gstNumber || undefined,
      website: data.website || undefined,
      billingAddress: data.billingAddress || undefined,
      shippingAddress: data.shippingAddress || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      country: data.country || undefined,
      status: data.status || 'ACTIVE',
      notes: data.notes || undefined
    };

    let result;
    if (editingSupplier) {
      result = await dispatch(updateSupplier({ id: editingSupplier._id, data: payload }));
    } else {
      result = await dispatch(createSupplier(payload));
    }

    if (createSupplier.fulfilled.match(result) || updateSupplier.fulfilled.match(result)) {
      setShowModal(false);
      setEditingSupplier(null);
      reset();
      dispatch(fetchSuppliers());
    } else {
      setModalError(result.payload || 'Failed to save supplier profile.');
    }
  };

  const handleEditClick = (supplier) => {
    setEditingSupplier(supplier);
    setModalError(null);
    setShowModal(true);
    setTimeout(() => {
      setValue('companyName', supplier.companyName);
      setValue('contactPerson', supplier.contactPerson || '');
      setValue('email', supplier.email || '');
      setValue('phone', supplier.phone || '');
      setValue('gstNumber', supplier.gstNumber || '');
      setValue('website', supplier.website || '');
      setValue('billingAddress', supplier.billingAddress || '');
      setValue('shippingAddress', supplier.shippingAddress || '');
      setValue('city', supplier.city || '');
      setValue('state', supplier.state || '');
      setValue('country', supplier.country || '');
      setValue('status', supplier.status || 'ACTIVE');
      setValue('notes', supplier.notes || '');
    }, 50);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier profile? This action cannot be undone.')) {
      const res = await dispatch(deleteSupplier(id));
      if (deleteSupplier.fulfilled.match(res)) {
        dispatch(fetchSuppliers());
      }
    }
  };

  return (
    <div className="space-y-6 text-xs text-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Suppliers Directory</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Manage vendor contact cards, shipping addresses, and GST registry details</p>
        </div>

        {['ADMIN', 'INVENTORY_MANAGER', 'MANAGER'].includes(currentUser?.role) && (
          <button
            onClick={() => {
              setEditingSupplier(null);
              setModalError(null);
              reset();
              setShowModal(true);
            }}
            className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Onboard Supplier
          </button>
        )}
      </div>

      {/* Filter Form */}
      <form onSubmit={handleFilterSubmit} className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex gap-4 items-end">
        <div className="flex-1 space-y-1.5">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name, contact representative, or vendor code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" /> Search
        </button>
      </form>

      {/* Supplier Grid list */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-12 rounded-lg text-gray-500 text-xs font-medium">
          No suppliers recorded.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map((s) => (
            <div key={s._id} className="bg-white border border-gray-200 rounded-lg shadow-xs p-5 flex flex-col justify-between gap-4">
              <div className="space-y-3.5">
                <div className="flex justify-between items-start border-b pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-snug">{s.companyName}</h3>
                    <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{s.supplierCode}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                    s.status === 'ACTIVE'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-100 border-gray-200 text-gray-500'
                  }`}>
                    {s.status}
                  </span>
                </div>

                <div className="space-y-2 text-gray-600 font-semibold text-[11px]">
                  {s.contactPerson && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Contact Representative: <span className="text-gray-900 font-bold">{s.contactPerson}</span></span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Email: <span className="text-blue-600 font-bold">{s.email}</span></span>
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Phone: <span className="text-gray-950">{s.phone}</span></span>
                    </div>
                  )}
                  {(s.city || s.country) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Location: <span className="text-gray-800">{[s.city, s.state, s.country].filter(Boolean).join(', ')}</span></span>
                    </div>
                  )}
                </div>

                {s.notes && (
                  <p className="text-[11px] text-gray-500 italic bg-[#f8f9fa] border p-2.5 rounded leading-normal">
                    {s.notes}
                  </p>
                )}
              </div>

              {['ADMIN', 'INVENTORY_MANAGER', 'MANAGER'].includes(currentUser?.role) && (
                <div className="flex justify-end gap-2 border-t pt-2 mt-1">
                  <button
                    onClick={() => handleEditClick(s)}
                    className="px-2 py-1 text-[10px] font-bold border rounded flex items-center gap-1.5 hover:bg-gray-100 text-blue-600 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(s._id)}
                    className="px-2 py-1 text-[10px] font-bold border rounded flex items-center gap-1.5 hover:bg-gray-100 text-red-650 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ONBOARD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">
                {editingSupplier ? 'Edit Supplier Details' : 'Onboard Supplier Vendor'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit(onAddSubmit)} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-750 font-bold">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Company Name</label>
                  <input
                    {...register('companyName', { required: true })}
                    type="text"
                    placeholder="e.g. Intel Electronics Inc."
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contact Person</label>
                  <input
                    {...register('contactPerson')}
                    type="text"
                    placeholder="e.g. John Doe"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <input
                    {...register('email')}
                    type="text"
                    placeholder="e.g. sales@intel.com"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                  <input
                    {...register('phone')}
                    type="text"
                    placeholder="e.g. +1-555-0199"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">GST Registry Number</label>
                  <input
                    {...register('gstNumber')}
                    type="text"
                    placeholder="Optional GSTIN"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Website URL</label>
                  <input
                    {...register('website')}
                    type="text"
                    placeholder="e.g. https://intel.com"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
                  <select
                    {...register('status')}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">City</label>
                  <input
                    {...register('city')}
                    type="text"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">State</label>
                  <input
                    {...register('state')}
                    type="text"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Country</label>
                  <input
                    {...register('country')}
                    type="text"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Billing Address</label>
                <textarea
                  {...register('billingAddress')}
                  rows="1.5"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Shipping Address</label>
                <textarea
                  {...register('shippingAddress')}
                  rows="1.5"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Notes / Summary</label>
                <textarea
                  {...register('notes')}
                  rows="2"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                ></textarea>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg font-semibold cursor-pointer">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierList;
