import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories, fetchSuppliers } from '../../../store/inventorySlice.js';
import { Loader2, Plus, Search, Filter, Trash2, Edit2, Layers, Tag, DollarSign, Box } from 'lucide-react';
import { useForm } from 'react-hook-form';

const ProductList = ({ searchQuery }) => {
  const dispatch = useDispatch();
  const { products, categories, suppliers, loading } = useSelector((state) => state.inventory);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    if (searchQuery === undefined) return;
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchQuery);
      dispatch(fetchProducts({ search: searchQuery, categoryId: catFilter }));
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, dispatch, catFilter]);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchProducts({ search, categoryId: catFilter }));
  };

  const onAddSubmit = async (data) => {
    setModalError(null);
    const payload = {
      name: data.name,
      sku: data.sku,
      barcode: data.barcode || undefined,
      categoryId: data.categoryId,
      brand: data.brand,
      unit: data.unit || 'units',
      purchasePrice: Number(data.purchasePrice),
      sellingPrice: Number(data.sellingPrice),
      tax: Number(data.tax || 0),
      discount: Number(data.discount || 0),
      minimumStock: Number(data.minimumStock || 5),
      currentStock: Number(data.currentStock || 0),
      warehouseLocation: data.warehouseLocation,
      supplierId: data.supplierId || undefined,
      status: data.status || 'ACTIVE'
    };

    let result;
    if (editingProduct) {
      result = await dispatch(updateProduct({ id: editingProduct._id, data: payload }));
    } else {
      result = await dispatch(createProduct(payload));
    }

    if (createProduct.fulfilled.match(result) || updateProduct.fulfilled.match(result)) {
      setShowModal(false);
      setEditingProduct(null);
      reset();
      dispatch(fetchProducts());
    } else {
      setModalError(result.payload || 'Failed to save product profile.');
    }
  };

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setModalError(null);
    setShowModal(true);
    // Populate form values
    setTimeout(() => {
      setValue('name', prod.name);
      setValue('sku', prod.sku);
      setValue('barcode', prod.barcode || '');
      setValue('categoryId', prod.categoryId?._id || prod.categoryId || '');
      setValue('brand', prod.brand || '');
      setValue('unit', prod.unit || 'units');
      setValue('purchasePrice', prod.purchasePrice);
      setValue('sellingPrice', prod.sellingPrice);
      setValue('tax', prod.tax || 0);
      setValue('discount', prod.discount || 0);
      setValue('minimumStock', prod.minimumStock || 5);
      setValue('currentStock', prod.currentStock || 0);
      setValue('warehouseLocation', prod.warehouseLocation || '');
      setValue('supplierId', prod.supplierId?._id || prod.supplierId || '');
      setValue('status', prod.status || 'ACTIVE');
    }, 50);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to archive this product profile?')) {
      const res = await dispatch(deleteProduct(id));
      if (deleteProduct.fulfilled.match(res)) {
        dispatch(fetchProducts());
      }
    }
  };

  return (
    <div className="space-y-6 text-xs text-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products Catalog</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Manage SKUs, unit prices, minimum levels, and warehouse locations</p>
        </div>

        {['ADMIN', 'INVENTORY_MANAGER', 'MANAGER'].includes(currentUser?.role) && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setModalError(null);
              reset();
              setShowModal(true);
            }}
            className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <form onSubmit={handleFilterSubmit} className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-1.5">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by SKU, name, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="w-full md:w-56 space-y-1.5">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs font-medium text-gray-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn-primary w-full md:w-auto px-4 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" /> Filter
        </button>
      </form>

      {/* Product Table */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-12 rounded-lg text-gray-500 text-xs font-medium">
          No products listed in catalog.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Code</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">SKU / Brand</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4">Prices (Purchase/Sell)</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs text-gray-700 font-medium">
                {products.map((p) => {
                  const isLowStock = p.currentStock <= p.minimumStock;
                  return (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-900">{p.productCode}</td>
                      <td className="p-4">
                        <div>
                          <div className="font-bold text-gray-900">{p.name}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{p.warehouseLocation || 'No Warehouse Location'}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="font-bold text-gray-800">{p.sku}</span>
                          {p.brand && <span className="text-[10px] text-gray-400 block mt-0.5">{p.brand}</span>}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{p.categoryId?.name || 'Uncategorized'}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold">{p.currentStock} {p.unit || 'units'}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border w-max ${
                            isLowStock 
                              ? 'bg-red-50 border-red-200 text-red-750' 
                              : 'bg-green-50 border-green-200 text-green-700'
                          }`}>
                            {isLowStock ? 'LOW STOCK' : 'AVAILABLE'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5 font-bold">
                          <div className="text-gray-500">Buy: ${p.purchasePrice}</div>
                          <div className="text-blue-600">Sell: ${p.sellingPrice}</div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 truncate max-w-44">{p.supplierId?.companyName || 'None'}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {['ADMIN', 'INVENTORY_MANAGER', 'MANAGER'].includes(currentUser?.role) && (
                            <>
                              <button
                                onClick={() => handleEditClick(p)}
                                className="p-1 hover:bg-gray-100 rounded text-blue-600 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(p._id)}
                                className="p-1 hover:bg-gray-100 rounded text-red-650 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE/UPDATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">
                {editingProduct ? 'Edit Product SKU' : 'Add New Product'}
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
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Name</label>
                  <input
                    {...register('name', { required: true })}
                    type="text"
                    placeholder="e.g. Dell Latitude 5420"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">SKU Code</label>
                  <input
                    {...register('sku', { required: true })}
                    type="text"
                    placeholder="e.g. DELL-LAT-5420"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Barcode</label>
                  <input
                    {...register('barcode')}
                    type="text"
                    placeholder="Optional barcode value"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                  <select
                    {...register('categoryId', { required: true })}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                  >
                    <option value="">Select Category...</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Brand</label>
                  <input
                    {...register('brand')}
                    type="text"
                    placeholder="e.g. Dell"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unit Measurement</label>
                  <input
                    {...register('unit')}
                    type="text"
                    placeholder="e.g. units, pcs, boxes"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Warehouse Location</label>
                  <input
                    {...register('warehouseLocation')}
                    type="text"
                    placeholder="e.g. Aisle 4, Shelf B"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Buy Price (₹)</label>
                  <input
                    {...register('purchasePrice', { required: true })}
                    type="number"
                    step="0.01"
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-2.5 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Sell Price (₹)</label>
                  <input
                    {...register('sellingPrice', { required: true })}
                    type="number"
                    step="0.01"
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-2.5 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Tax Rate (₹)</label>
                  <input
                    {...register('tax')}
                    type="number"
                    step="0.01"
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-2.5 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Discount (₹)</label>
                  <input
                    {...register('discount')}
                    type="number"
                    step="0.01"
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Min Stock Alarm</label>
                  <input
                    {...register('minimumStock')}
                    type="number"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Initial Stock</label>
                  <input
                    {...register('currentStock')}
                    type="number"
                    disabled={!!editingProduct}
                    className="w-full bg-white border border-gray-355 rounded-lg py-2 px-3 focus:outline-none disabled:bg-gray-100"
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

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Registered Supplier</label>
                <select
                  {...register('supplierId')}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                >
                  <option value="">Select Supplier...</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.companyName} ({s.supplierCode})</option>
                  ))}
                </select>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg font-semibold cursor-pointer">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
