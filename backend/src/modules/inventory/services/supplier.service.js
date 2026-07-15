import Supplier from '../models/Supplier.js';
import Counter from '../models/Counter.js';
import AppError from '../../../utils/appError.js';

class SupplierService {
  async getNextSupplierCode() {
    const counter = await Counter.findOneAndUpdate(
      { id: 'supplierCode' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const codeNumber = String(counter.seq).padStart(4, '0');
    return `SUPP-${codeNumber}`;
  }

  async createSupplier(supplierData) {
    const supplierCode = await this.getNextSupplierCode();

    const supplier = await Supplier.create({
      ...supplierData,
      supplierCode
    });

    return supplier;
  }

  async getSupplierById(id) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }
    return supplier;
  }

  async updateSupplier(id, updateData) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    // Strip unmodifiable values
    delete updateData.supplierCode;

    const updated = await Supplier.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    return updated;
  }

  async deleteSupplier(id) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }
    await Supplier.deleteOne({ _id: id });
    return null;
  }

  async querySuppliers(queryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = {};
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { companyName: new RegExp(search, 'i') },
        { contactPerson: new RegExp(search, 'i') },
        { supplierCode: new RegExp(search, 'i') }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const total = await Supplier.countDocuments(filter);
    const suppliers = await Supplier.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    return {
      suppliers,
      total,
      totalPages,
      currentPage: Number(page)
    };
  }
}

export default new SupplierService();
