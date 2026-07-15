import StockMovement from '../models/StockMovement.js';
import Product from '../models/Product.js';
import AppError from '../../../utils/appError.js';

class StockMovementService {
  async logMovement({ productId, movementType, quantity, reason, reference, performedBy }) {
    const product = await Product.findOne({ _id: productId, isDeleted: false });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    let newStock = product.currentStock;

    if (['IN', 'RETURN', 'ADJUSTMENT'].includes(movementType)) {
      newStock += quantity;
    } else if (['OUT', 'TRANSFER'].includes(movementType)) {
      newStock -= quantity;
      if (newStock < 0) {
        throw new AppError(`Insufficient stock for product ${product.name}. Current stock: ${product.currentStock}, requested reduction: ${quantity}`, 400);
      }
    }

    // Save movement log
    const movement = await StockMovement.create({
      productId,
      movementType,
      quantity,
      reason,
      reference,
      performedBy
    });

    // Update Product stock level
    product.currentStock = newStock;
    await product.save();

    return movement;
  }

  async getMovements(queryParams) {
    const {
      page = 1,
      limit = 10,
      productId,
      movementType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = {};
    if (productId) filter.productId = productId;
    if (movementType) filter.movementType = movementType;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const total = await StockMovement.countDocuments(filter);
    const movements = await StockMovement.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('productId', 'name productCode sku')
      .populate('performedBy', 'name email role');

    const totalPages = Math.ceil(total / limit);

    return {
      movements,
      total,
      totalPages,
      currentPage: Number(page)
    };
  }
}

export default new StockMovementService();
