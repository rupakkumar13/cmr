import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../../store/inventorySlice.js';
import { Loader2, Plus, Search, Filter, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';

const CategoryList = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.inventory);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalError, setModalError] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchCategories({ search, status: statusFilter }));
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setModalError(null);
    reset({
      name: '',
      description: '',
      parentCategory: '',
      status: 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setModalError(null);
    reset({
      name: cat.name,
      description: cat.description || '',
      parentCategory: cat.parentCategory?._id || '',
      status: cat.status
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setModalError(null);
    
    // Convert empty parent category to null
    const payload = {
      ...data,
      parentCategory: data.parentCategory === '' ? null : data.parentCategory
    };

    let result;
    if (editingCategory) {
      result = await dispatch(updateCategory({ id: editingCategory._id, data: payload }));
    } else {
      result = await dispatch(createCategory(payload));
    }

    if (createCategory.fulfilled.match(result) || updateCategory.fulfilled.match(result)) {
      setShowModal(false);
      reset();
      dispatch(fetchCategories());
    } else {
      setModalError(result.payload || 'An error occurred during submission.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      const result = await dispatch(deleteCategory(id));
      if (deleteCategory.fulfilled.match(result)) {
        dispatch(fetchCategories());
      } else {
        alert(result.payload || 'Failed to delete category.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="page-title">Category Management</h2>
          <p className="page-subtitle">Configure stock item classification and sub-categories hierarchical mappings</p>
        </div>

        {['ADMIN', 'INVENTORY_MANAGER', 'MANAGER'].includes(currentUser?.role) && (
          <button
            onClick={handleOpenAdd}
            className="btn-primary flex items-center gap-2 text-xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      {/* Filters Form */}
      <form onSubmit={handleFilterSubmit} className="filter-bar flex flex-col md:flex-row gap-2 items-end">
        <div className="flex-1 w-full">
          <label className="saas-label">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories by name, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="saas-input w-full pl-9 pr-3 text-xs"
            />
          </div>
        </div>

        <div className="w-full md:w-44">
          <label className="saas-label">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="saas-input w-full text-xs text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 text-xs cursor-pointer transition-all"
        >
          <Filter className="w-3.5 h-3.5" /> Filter
        </button>
      </form>

      {/* Table grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state text-xs font-medium">
          No stock categories configured.
        </div>
      ) : (
        <div className="data-table-wrap">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="data-table-head">
                  <th className="px-4 py-3">Category Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Parent Category</th>
                  <th className="px-4 py-3">Status</th>
                  {['ADMIN', 'INVENTORY_MANAGER', 'MANAGER'].includes(currentUser?.role) && <th className="px-4 py-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{cat.categoryCode}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{cat.name}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{cat.description || '—'}</td>
                    <td className="px-4 py-3 text-indigo-600 font-semibold">{cat.parentCategory?.name || 'Root Category'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border transition-colors ${
                        cat.status === 'ACTIVE' 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {cat.status}
                      </span>
                    </td>
                    {['ADMIN', 'INVENTORY_MANAGER', 'MANAGER'].includes(currentUser?.role) && (
                      <td className="px-4 py-3 flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {currentUser?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(cat._id, cat.name)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-red-600 cursor-pointer transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-panel max-w-sm animate-fade-in">
            <div className="modal-header">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingCategory ? 'Update Category' : 'Add Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost text-lg cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="saas-label">Category Name</label>
                <input
                  {...register('name', { required: true })}
                  type="text"
                  placeholder="e.g. Storage Devices"
                  className="saas-input w-full text-xs"
                />
              </div>

              <div>
                <label className="saas-label">Parent Category (Optional)</label>
                <select
                  {...register('parentCategory')}
                  className="saas-input w-full text-xs text-slate-700"
                >
                  <option value="">Root Category (None)</option>
                  {categories
                    .filter(c => !editingCategory || c._id !== editingCategory._id) // prevent cycle options
                    .map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="saas-label">Status</label>
                <select
                  {...register('status')}
                  className="saas-input w-full text-xs text-slate-700"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div>
                <label className="saas-label">Description</label>
                <textarea
                  {...register('description')}
                  placeholder="Item groupings parameter..."
                  rows="3.5"
                  className="saas-input w-full text-xs resize-none"
                ></textarea>
              </div>

              <div className="modal-footer -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary cursor-pointer transition-all"
                >
                  {editingCategory ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
