import Quotation from '../models/Quotation.js';
import Counter from '../../shared/models/Counter.js';
import AppError from '../../../../utils/appError.js';

class QuotationService {
  async getNextQuotationCode() {
    const counter = await Counter.findOneAndUpdate(
      { id: 'quotationNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const codeNumber = String(counter.seq).padStart(6, '0');
    return `QT-${codeNumber}`;
  }

  calculateTotals(products, shippingCharge = 0) {
    let globalSubtotal = 0;
    let globalTax = 0;
    let globalDiscount = 0;
    let globalTotalAmount = 0;

    const processedProducts = products.map((item) => {
      const subtotal = item.quantity * item.unitPrice;
      const total = subtotal - (item.discount || 0) + (item.tax || 0);

      globalSubtotal += subtotal;
      globalTax += item.tax || 0;
      globalDiscount += item.discount || 0;
      globalTotalAmount += total;

      const pId = item.productId === '' || !item.productId ? undefined : item.productId;

      return {
        productId: pId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        subtotal,
        total
      };
    });

    return {
      products: processedProducts,
      subtotal: globalSubtotal,
      tax: globalTax,
      discount: globalDiscount,
      shippingCharge,
      totalAmount: globalTotalAmount + shippingCharge
    };
  }

  async createQuotation(quotationData, creatorId) {
    const salesperson = quotationData.salespersonId || quotationData.salesPersonId || creatorId;
    quotationData.salespersonId = salesperson;
    quotationData.salesPersonId = salesperson;

    const totals = this.calculateTotals(quotationData.products, quotationData.shippingCharge || 0);
    const quotationNumber = await this.getNextQuotationCode();

    const quotation = await Quotation.create({
      ...quotationData,
      ...totals,
      quotationNumber,
      createdBy: creatorId
    });

    return quotation;
  }

  async getQuotationById(id) {
    const quotation = await Quotation.findOne({ _id: id, isDeleted: false })
      .populate('customerId', 'customerCode companyName customerName email phone billingAddress')
      .populate('companyId', 'customerCode companyName customerName email')
      .populate('dealId', 'title dealCode amount stage expectedCloseDate')
      .populate('salesPersonId', 'name email role')
      .populate('salespersonId', 'name email role')
      .populate('invoiceId', 'invoiceNumber paymentStatus invoiceStatus remainingAmount grandTotal')
      .populate('createdBy', 'name email');

    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }
    return quotation;
  }

  async updateQuotation(id, updateData) {
    const quotation = await Quotation.findOne({ _id: id, isDeleted: false });
    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    const salesperson = updateData.salespersonId || updateData.salesPersonId;
    if (salesperson) {
      updateData.salespersonId = salesperson;
      updateData.salesPersonId = salesperson;
    }

    // Recalculate if products or shippingCharge are updated
    if (updateData.products || updateData.shippingCharge !== undefined) {
      const products = updateData.products || quotation.products;
      const shipping = updateData.shippingCharge !== undefined ? updateData.shippingCharge : (quotation.shippingCharge || 0);
      const totals = this.calculateTotals(products, shipping);
      Object.assign(updateData, totals);
    }

    // Strip unmodifiable values
    delete updateData.quotationNumber;
    delete updateData.createdBy;
    delete updateData.isDeleted;
    delete updateData.deletedAt;

    const updated = await Quotation.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('customerId', 'customerName companyName')
      .populate('salesPersonId', 'name email');

    return updated;
  }

  async updateStatus(id, status) {
    const quotation = await Quotation.findOne({ _id: id, isDeleted: false });
    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    quotation.quotationStatus = status;
    await quotation.save();

    // Business Rule: If a quotation is Accepted, Deal Stage = Closed Won
    if (status === 'ACCEPTED' && quotation.dealId) {
      const Deal = mongoose.models.Deal;
      if (Deal) {
        await Deal.findByIdAndUpdate(quotation.dealId, { stage: 'CLOSED_WON' });
      }
    }

    return quotation;
  }

  async softDeleteQuotation(id) {
    const quotation = await Quotation.findOne({ _id: id, isDeleted: false });
    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    quotation.isDeleted = true;
    quotation.deletedAt = new Date();
    await quotation.save();

    return null;
  }

  async queryQuotations(queryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      customerId,
      dealId,
      salesPersonId,
      salespersonId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = { isDeleted: false };
    if (status) filter.quotationStatus = status;
    if (customerId) filter.customerId = customerId;
    if (dealId) filter.dealId = dealId;

    const salesId = salespersonId || salesPersonId;
    if (salesId) {
      filter.$or = [
        { salesPersonId: salesId },
        { salespersonId: salesId }
      ];
    }

    if (search) {
      filter.quotationNumber = new RegExp(search, 'i');
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const total = await Quotation.countDocuments(filter);
    const quotations = await Quotation.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'customerCode companyName customerName')
      .populate('dealId', 'title dealCode amount stage expectedCloseDate')
      .populate('salesPersonId', 'name email role')
      .populate('salespersonId', 'name email role')
      .populate('invoiceId', 'invoiceNumber paymentStatus invoiceStatus remainingAmount grandTotal');

    const totalPages = Math.ceil(total / limit);

    return {
      quotations,
      total,
      totalPages,
      currentPage: Number(page)
    };
  }
}

export default new QuotationService();
