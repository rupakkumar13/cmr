import Product from '../models/Product.js';
import Counter from '../models/Counter.js';
import AppError from '../../../utils/appError.js';

class ProductService {
  async getNextProductCode() {
    const counter = await Counter.findOneAndUpdate(
      { id: 'productCode' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const codeNumber = String(counter.seq).padStart(4, '0');
    return `PROD-${codeNumber}`;
  }

  async createProduct(productData, creatorId) {
    const existingSku = await Product.findOne({ sku: productData.sku, isDeleted: false });
    if (existingSku) {
      throw new AppError('Product with this SKU already exists', 400);
    }

    if (productData.barcode) {
      const existingBarcode = await Product.findOne({ barcode: productData.barcode, isDeleted: false });
      if (existingBarcode) {
        throw new AppError('Product with this barcode already exists', 400);
      }
    }

    const productCode = await this.getNextProductCode();

    const product = await Product.create({
      ...productData,
      productCode,
      createdBy: creatorId
    });

    return product;
  }

  async getProductById(id) {
    const product = await Product.findOne({ _id: id, isDeleted: false })
      .populate('categoryId', 'name categoryCode')
      .populate('supplierId', 'companyName supplierCode')
      .populate('createdBy', 'name email');

    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async updateProduct(id, updateData) {
    const product = await Product.findOne({ _id: id, isDeleted: false });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (updateData.sku && updateData.sku !== product.sku) {
      const existingSku = await Product.findOne({ sku: updateData.sku, isDeleted: false });
      if (existingSku) {
        throw new AppError('Product with this SKU already exists', 400);
      }
    }

    if (updateData.barcode && updateData.barcode !== product.barcode) {
      const existingBarcode = await Product.findOne({ barcode: updateData.barcode, isDeleted: false });
      if (existingBarcode) {
        throw new AppError('Product with this barcode already exists', 400);
      }
    }

    // Strip unmodifiable values
    delete updateData.productCode;
    delete updateData.createdBy;
    delete updateData.isDeleted;
    delete updateData.deletedAt;

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('categoryId', 'name categoryCode')
      .populate('supplierId', 'companyName supplierCode');

    return updated;
  }

  async softDeleteProduct(id) {
    const product = await Product.findOne({ _id: id, isDeleted: false });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();

    return null;
  }

  async queryProducts(queryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      categoryId,
      supplierId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (categoryId) filter.categoryId = categoryId;
    if (supplierId) filter.supplierId = supplierId;

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { sku: new RegExp(search, 'i') },
        { productCode: new RegExp(search, 'i') }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('categoryId', 'name categoryCode')
      .populate('supplierId', 'companyName supplierCode');

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      totalPages,
      currentPage: Number(page)
    };
  }
}

export default new ProductService();
