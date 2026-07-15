import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPurchaseOrders, createPurchaseOrder, updatePurchaseOrderStatus, fetchSuppliers, fetchProducts } from '../../../store/inventorySlice.js';
import { Loader2, Plus, Calendar, MapPin, DollarSign, Box, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';

const PurchaseOrderList = () => {
  const dispatch = useDispatch();
  const { purchaseOrders, suppliers, products, loading } = useSelector((state) => state.inventory);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState(null);

  const { register, handleSubmit, control, watch, reset, setValue } = useForm({
    defaultValues: {
      products: [{ productId: '', quantity: 1, purchasePrice: 0, tax: 0, discount: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products'
  });

  const watchProducts = watch('products');

  let localTotal = 0;
  if (watchProducts) {
    watchProducts.forEach((p) => {
      const qty = Number(p.quantity) || 0;
      const price = Number(p.purchasePrice) || 0;
      const tax = Number(p.tax) || 0;
      const disc = Number(p.discount) || 0;
      localTotal += (qty * price) + tax - disc;
    });
  }

  useEffect(() => {
    dispatch(fetchPurchaseOrders());
    dispatch(fetchSuppliers());
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleStatusChange = async (id, orderStatus) => {
    if (window.confirm(`Are you sure you want to change order status to ${orderStatus}? If marked RECEIVED, it will automatically increment stock levels.`)) {
      const res = await dispatch(updatePurchaseOrderStatus({ id, data: { orderStatus } }));
      if (updatePurchaseOrderStatus.fulfilled.match(res)) {
        dispatch(fetchPurchaseOrders());
        dispatch(fetchProducts()); // Reload stock numbers
      }
    }
  };

  const onAddSubmit = async (data) => {
    setModalError(null);
    const payload = {
      supplierId: data.supplierId,
      expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate).toISOString() : undefined,
      products: data.products.map(p => ({
        productId: p.productId,
        quantity: Number(p.quantity),
        purchasePrice: Number(p.purchasePrice),
        tax: Number(p.tax || 0),
        discount: Number(p.discount || 0)
      }))
    };

    const result = await dispatch(createPurchaseOrder(payload));
    if (createPurchaseOrder.fulfilled.match(result)) {
      setShowModal(false);
      reset({
        products: [{ productId: '', quantity: 1, purchasePrice: 0, tax: 0, discount: 0 }]
      });
      dispatch(fetchPurchaseOrders());
    } else {
      setModalError(result.payload || 'Failed to issue purchase order.');
    }
  };

  return (
    <div className="space-y-6 text-xs text-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Purchase Orders</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Issue raw material or product purchase tickets to vendor suppliers</p>
        </div>

        {['ADMIN', 'INVENTORY_MANAGER', 'MANAGER'].includes(currentUser?.role) && (
          <button
            onClick={() => {
              setModalError(null);
              reset({
                products: [{ productId: '', quantity: 1, purchasePrice: 0, tax: 0, discount: 0 }]
              });
              setShowModal(true);
            }}
            className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Issue PO Ticket
          </button>
        )}
      </div>

      {/* PO List Grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : purchaseOrders.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-12 rounded-lg text-gray-500 text-xs font-medium">
          No purchase orders issued.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {purchaseOrders.map((po) => (
            <div key={po._id} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-start border-b pb-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{po.purchaseOrderNumber}</h3>
                  <p className="text-[10px] text-gray-400 font-bold block mt-0.5">Supplier: <span className="text-blue-600">{po.supplierId?.companyName}</span></p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                    po.orderStatus === 'RECEIVED'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : po.orderStatus === 'CANCELLED'
                      ? 'bg-red-50 border-red-200 text-red-750'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                  }`}>
                    {po.orderStatus}
                  </span>
                </div>
              </div>

              {/* Products list lines */}
              <div className="space-y-1.5">
                <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Ordered items</h4>
                <div className="divide-y max-h-24 overflow-y-auto bg-gray-50 border rounded-lg p-2.5 space-y-1">
                  {po.products?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 text-[10px]">
                      <span className="font-semibold text-gray-900 truncate max-w-44">
                        {item.productId?.name || 'Unknown SKU'} ({item.productId?.sku})
                      </span>
                      <span className="text-gray-500 font-bold font-mono">
                        {item.quantity} x ${item.purchasePrice}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] font-semibold text-gray-600">
                <div>Total Cost: <span className="text-blue-600 font-extrabold">₹{po.totalAmount}</span></div>
                {po.expectedDeliveryDate && (
                  <div>Exp Delivery: <span className="text-gray-900 font-bold">{new Date(po.expectedDeliveryDate).toLocaleDateString()}</span></div>
                )}
              </div>

              {/* Status transition actions */}
              {po.orderStatus === 'PENDING' && ['ADMIN', 'INVENTORY_MANAGER', 'MANAGER'].includes(currentUser?.role) && (
                <div className="flex gap-2 border-t pt-3">
                  <button
                    onClick={() => handleStatusChange(po._id, 'RECEIVED')}
                    className="flex-1 px-3 py-1.5 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Received
                  </button>
                  <button
                    onClick={() => handleStatusChange(po._id, 'CANCELLED')}
                    className="px-3 py-1.5 text-[10px] font-bold bg-red-50 text-red-650 border border-red-200 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Cancel PO
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Issue Purchase Order Ticket</h3>
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
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vendor Supplier</label>
                  <select
                    {...register('supplierId', { required: true })}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                  >
                    <option value="">Select Vendor...</option>
                    {suppliers.map(s => (
                      <option key={s._id} value={s._id}>{s.companyName} ({s.supplierCode})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expected Delivery Date</label>
                  <input
                    {...register('expectedDeliveryDate')}
                    type="date"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                  />
                </div>
              </div>

              {/* Dynamic items input */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center border-b pb-1">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Line Items</h4>
                  <button
                    type="button"
                    onClick={() => append({ productId: '', quantity: 1, purchasePrice: 0, tax: 0, discount: 0 })}
                    className="px-2.5 py-1 text-[9px] font-bold border border-[#2563eb] text-[#2563eb] rounded hover:bg-blue-50 cursor-pointer"
                  >
                    + Add Product Line
                  </button>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 border rounded-lg">
                      <div className="col-span-4 space-y-1">
                        <label className="block text-[8px] font-bold text-gray-400 uppercase">Product SKU</label>
                        <select
                          {...register(`products.${index}.productId`, { required: true })}
                          className="w-full bg-white border border-gray-300 rounded p-1 text-[10px] focus:outline-none text-gray-700"
                        >
                          <option value="">Select SKU...</option>
                          {products.map(p => (
                            <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label className="block text-[8px] font-bold text-gray-400 uppercase">Quantity</label>
                        <input
                          {...register(`products.${index}.quantity`, { required: true })}
                          type="number"
                          className="w-full bg-white border border-gray-300 rounded p-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label className="block text-[8px] font-bold text-gray-400 uppercase">Buy Price (₹)</label>
                        <input
                          {...register(`products.${index}.purchasePrice`, { required: true })}
                          type="number"
                          step="0.01"
                          className="w-full bg-white border border-gray-300 rounded p-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="col-span-1.5 space-y-1">
                        <label className="block text-[8px] font-bold text-gray-400 uppercase">Tax (₹)</label>
                        <input
                          {...register(`products.${index}.tax`)}
                          type="number"
                          step="0.01"
                          className="w-full bg-white border border-gray-300 rounded p-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="col-span-1.5 space-y-1">
                        <label className="block text-[8px] font-bold text-gray-400 uppercase">Disc (₹)</label>
                        <input
                          {...register(`products.${index}.discount`)}
                          type="number"
                          step="0.01"
                          className="w-full bg-white border border-gray-300 rounded p-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="col-span-1 flex justify-center pt-3">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-650 hover:text-red-750 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-gray-50 border rounded-lg flex justify-between items-center text-sm font-bold text-gray-700 mt-2">
                <span>Calculated Total PO amount:</span>
                <span className="text-blue-600 font-extrabold">₹{localTotal}</span>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg font-semibold cursor-pointer">Save & Issue PO</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;
