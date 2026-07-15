import Customer from '../models/Customer.js';
import Counter from '../models/Counter.js';
import AppError from '../../../../utils/appError.js';

class CustomerService {
  /**
   * Safe sequential unique code generator using Counter collection
   */
  async getNextCustomerCode() {
    const counter = await Counter.findOneAndUpdate(
      { id: 'customerCode' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const codeNumber = String(counter.seq).padStart(4, '0');
    return `CUST-${codeNumber}`;
  }

  async createCustomer(customerData, creatorId) {
    const customerCode = await this.getNextCustomerCode();
    
    const customer = await Customer.create({
      ...customerData,
      customerCode,
      createdBy: creatorId
    });

    return customer;
  }

  async getCustomerById(id) {
    const customer = await Customer.findOne({ _id: id, isDeleted: false })
      .populate('assignedSalesPerson', 'name email role')
      .populate('createdBy', 'name email');

    if (!customer) {
      throw new AppError('Customer record not found', 404);
    }
    return customer;
  }

  async updateCustomer(id, updateData) {
    const customer = await Customer.findOne({ _id: id, isDeleted: false });
    if (!customer) {
      throw new AppError('Customer record not found', 404);
    }

    // Safely block updating creation audits or customer code
    delete updateData.customerCode;
    delete updateData.createdBy;
    delete updateData.isDeleted;
    delete updateData.deletedAt;

    const updated = await Customer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('assignedSalesPerson', 'name email role');

    return updated;
  }

  async softDeleteCustomer(id) {
    const customer = await Customer.findOne({ _id: id, isDeleted: false });
    if (!customer) {
      throw new AppError('Customer record not found', 404);
    }

    customer.isDeleted = true;
    customer.deletedAt = new Date();
    await customer.save();
    return null;
  }

  async queryCustomers(queryParams) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      industry, 
      assignedSalesPerson,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = queryParams;

    const filter = { isDeleted: false };

    // Apply filters
    if (status) filter.status = status;
    if (industry) filter.industry = new RegExp(industry, 'i');
    if (assignedSalesPerson) filter.assignedSalesPerson = assignedSalesPerson;

    // Apply Search
    if (search) {
      filter.$or = [
        { customerName: new RegExp(search, 'i') },
        { companyName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { customerCode: new RegExp(search, 'i') }
      ];
    }

    // Sort order mapping
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute paginated queries
    const skip = (page - 1) * limit;
    
    const totalCustomers = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('assignedSalesPerson', 'name email role');

    const totalPages = Math.ceil(totalCustomers / limit);

    return {
      customers,
      totalCustomers,
      totalPages,
      currentPage: Number(page)
    };
  }
}

export default new CustomerService();
