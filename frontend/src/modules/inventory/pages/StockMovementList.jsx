import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockMovements, createStockMovement, fetchProducts } from '../../../store/inventorySlice.js';
import { Loader2, Plus, Calendar, User, FileText, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useForm } from 'react-hook-form';

const StockMovementList = () => {
  const dispatch = useDispatch();
  const { stockHistory, products, loading } = useSelector((state) => state.inventory);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    dispatch(fetchStockMovements());
    dispatch(fetchProducts());
  }, [dispatch]);

  const onAddSubmit = async (data) => {
    setModalError(null);
    const payload = {
      productId: data.productId,
      movementType: data.movementType,
      quantity: Number(data.quantity),
      reason: data.reason,
      reference: data.reference
    };

    const result = await dispatch(createStockMovement(payload));
    if (createStockMovement.fulfilled.match(result)) {
      setShowModal(false);
      reset();
      dispatch(fetchStockMovements());
      dispatch(fetchProducts()); // Refresh stock quantities
    } else {
      setModalError(result.payload || 'Failed to apply stock adjustment.');
    }
  };

  return (
    <div className="space-y-6 text-xs text-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Stock Movements & Audits</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Audit timeline of inventory changes, stock adjustments, and shipments</p>
        </div>

        {['ADMIN', 'INVENTORY_MANAGER', 'MANAGER'].includes(currentUser?.role) && (
          <button
            onClick={() => {
              setModalError(null);
              reset();
              setShowModal(true);
            }}
            className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Log Stock Adjustment
          </button>
        )}
      </div>

      {/* Movements Table */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : stockHistory.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-12 rounded-lg text-gray-500 text-xs font-medium">
          No stock events logged.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Product SKU</th>
                  <th className="p-4">Flow Type</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Performed By</th>
                  <th className="p-4">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs text-gray-700 font-medium">
                {stockHistory.map((move) => {
                  const isIncrement = ['IN', 'RETURN', 'ADJUSTMENT'].includes(move.movementType);
                  return (
                    <tr key={move._id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-500">{new Date(move.createdAt).toLocaleString()}</td>
                      <td className="p-4">
                        <div>
                          <div className="font-bold text-gray-900">{move.productId?.name}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">SKU: {move.productId?.sku}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border inline-flex items-center gap-1 ${
                          isIncrement 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-red-50 border-red-200 text-red-750'
                        }`}>
                          {isIncrement ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          {move.movementType}
                        </span>
                      </td>
                      <td className={`p-4 font-bold ${isIncrement ? 'text-green-700' : 'text-red-750'}`}>
                        {isIncrement ? '+' : '-'}{move.quantity}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">{move.reference || 'N/A'}</td>
                      <td className="p-4 text-gray-600">{move.performedBy?.name}</td>
                      <td className="p-4 text-gray-500 italic truncate max-w-xs">{move.reason || 'None'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Log Manual Stock Adjustment</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit(onAddSubmit)} className="p-5 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-750 font-bold">
                  {modalError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Product SKU</label>
                <select
                  {...register('productId', { required: true })}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                >
                  <option value="">Select SKU...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.sku}) [Current: {p.currentStock}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Adjustment Type</label>
                  <select
                    {...register('movementType', { required: true })}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                  >
                    <option value="IN">IN (Stock Addition)</option>
                    <option value="OUT">OUT (Stock Deduction)</option>
                    <option value="RETURN">RETURN</option>
                    <option value="ADJUSTMENT">ADJUSTMENT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Quantity</label>
                  <input
                    {...register('quantity', { required: true })}
                    type="number"
                    min="1"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-750"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Reference (e.g. Invoice #, PO #)</label>
                <input
                  {...register('reference')}
                  type="text"
                  placeholder="e.g. INV-0082"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Adjustment Reason</label>
                <textarea
                  {...register('reason')}
                  placeholder="Explain why stock is adjusted..."
                  rows="2"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                ></textarea>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg font-semibold cursor-pointer">Apply Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMovementList;
