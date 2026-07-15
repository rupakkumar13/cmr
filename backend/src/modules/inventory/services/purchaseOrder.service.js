import PurchaseOrder from '../models/PurchaseOrder.js';
import Counter from '../models/Counter.js';
import StockMovementService from './stockMovement.service.js';
import AppError from '../../../utils/appError.js';

class PurchaseOrderService {
  async getNextPOCode() {
    const counter = await Counter.findOneAndUpdate(
      { id: 'purchaseOrderNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const codeNumber = String(counter.seq).padStart(4, '0');
    return `PO-${codeNumber}`;
  }

  async createPurchaseOrder(poData, creatorId) {
    const purchaseOrderNumber = await this.getNextPOCode();

    // Calculate total amount
    let totalAmount = 0;
    const products = poData.products.map((p) => {
      const subtotal = p.quantity * p.purchasePrice;
      const total = subtotal - (p.discount || 0) + (p.tax || 0);
      totalAmount += total;
      return {
        ...p,
        subtotal,
        total
      };
    });

    const expectedDelivery = poData.expectedDeliveryDate ? new Date(poData.expectedDeliveryDate) : undefined;

    const po = await PurchaseOrder.create({
      purchaseOrderNumber,
      supplierId: poData.supplierId,
      products,
      totalAmount,
      expectedDeliveryDate: expectedDelivery,
      createdBy: creatorId
    });

    return po;
  }

  async getPurchaseOrderById(id) {
    const po = await PurchaseOrder.findById(id)
      .populate('supplierId', 'companyName supplierCode email phone')
      .populate('products.productId', 'name productCode sku currentStock')
      .populate('createdBy', 'name email');

    if (!po) {
      throw new AppError('Purchase order not found', 404);
    }
    return po;
  }

  async updateStatus(id, { orderStatus, paymentStatus }, userId) {
    const po = await PurchaseOrder.findById(id);
    if (!po) {
      throw new AppError('Purchase order not found', 404);
    }

    const previousOrderStatus = po.orderStatus;

    if (orderStatus) po.orderStatus = orderStatus;
    if (paymentStatus) po.paymentStatus = paymentStatus;

    await po.save();

    // If PO orderStatus transition from PENDING to RECEIVED, automatically add to inventory stock
    if (orderStatus === 'RECEIVED' && previousOrderStatus !== 'RECEIVED') {
      for (const item of po.products) {
        await StockMovementService.logMovement({
          productId: item.productId,
          movementType: 'IN',
          quantity: item.quantity,
          reason: `Stock receipt from Purchase Order ${po.purchaseOrderNumber}`,
          reference: po.purchaseOrderNumber,
          performedBy: userId
        });
      }
    }

    return po;
  }

  async queryPurchaseOrders(queryParams) {
    const {
      page = 1,
      limit = 10,
      supplierId,
      orderStatus,
      paymentStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = {};
    if (supplierId) filter.supplierId = supplierId;
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const total = await PurchaseOrder.countDocuments(filter);
    const purchaseOrders = await PurchaseOrder.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('supplierId', 'companyName supplierCode')
      .populate('createdBy', 'name email');

    const totalPages = Math.ceil(total / limit);

    return {
      purchaseOrders,
      total,
      totalPages,
      currentPage: Number(page)
    };
  }
}

export default new PurchaseOrderService();
