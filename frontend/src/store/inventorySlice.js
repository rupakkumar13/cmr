import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

// --- Categories Thunks ---
export const fetchCategories = createAsyncThunk(
  'inventory/fetchCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/categories', { params });
      return response.data.data.categories;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const createCategory = createAsyncThunk(
  'inventory/createCategory',
  async (catData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/categories', catData);
      return response.data.data.category;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'inventory/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/categories/${id}`, data);
      return response.data.data.category;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'inventory/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

// --- Products Thunks ---
export const fetchProducts = createAsyncThunk(
  'inventory/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/products', { params });
      return response.data.data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'inventory/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/products', productData);
      return response.data.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'inventory/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/products/${id}`, data);
      return response.data.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'inventory/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

// --- Suppliers Thunks ---
export const fetchSuppliers = createAsyncThunk(
  'inventory/fetchSuppliers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/suppliers', { params });
      return response.data.data.suppliers;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suppliers');
    }
  }
);

export const createSupplier = createAsyncThunk(
  'inventory/createSupplier',
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/suppliers', supplierData);
      return response.data.data.supplier;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create supplier');
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'inventory/updateSupplier',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/suppliers/${id}`, data);
      return response.data.data.supplier;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update supplier');
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'inventory/deleteSupplier',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/suppliers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete supplier');
    }
  }
);

// --- Purchase Orders Thunks ---
export const fetchPurchaseOrders = createAsyncThunk(
  'inventory/fetchPurchaseOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/purchase-orders', { params });
      return response.data.data.purchaseOrders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase orders');
    }
  }
);

export const createPurchaseOrder = createAsyncThunk(
  'inventory/createPurchaseOrder',
  async (poData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/purchase-orders', poData);
      return response.data.data.purchaseOrder;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create purchase order');
    }
  }
);

export const updatePurchaseOrderStatus = createAsyncThunk(
  'inventory/updatePurchaseOrderStatus',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/purchase-orders/${id}/status`, data);
      return response.data.data.purchaseOrder;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update purchase order status');
    }
  }
);

// --- Stock Movements Thunks ---
export const fetchStockMovements = createAsyncThunk(
  'inventory/fetchStockMovements',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/stock-movements', { params });
      return response.data.data.movements;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stock movements');
    }
  }
);

export const createStockMovement = createAsyncThunk(
  'inventory/createStockMovement',
  async (moveData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/stock-movements', moveData);
      return response.data.data.movement;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to adjust stock levels');
    }
  }
);

const initialState = {
  categories: [],
  products: [],
  suppliers: [],
  purchaseOrders: [],
  stockHistory: [],
  loading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearInventoryError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.unshift(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(c => c._id !== action.payload);
      })

      // Products
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => p._id !== action.payload);
      })

      // Suppliers
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers.unshift(action.payload);
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.suppliers.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = state.suppliers.filter(s => s._id !== action.payload);
      })

      // Purchase Orders
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders = action.payload;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders.unshift(action.payload);
      })
      .addCase(updatePurchaseOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchaseOrders.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
      })

      // Stock Movements
      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.loading = false;
        state.stockHistory = action.payload;
      })
      .addCase(createStockMovement.fulfilled, (state, action) => {
        state.loading = false;
        state.stockHistory.unshift(action.payload);
      })

      // General async indicators
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { clearInventoryError } = inventorySlice.actions;
export default inventorySlice.reducer;
