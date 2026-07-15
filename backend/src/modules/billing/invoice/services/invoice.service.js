import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Quotation from '../../quotation/models/Quotation.js';
import Counter from '../../shared/models/Counter.js';
import AppError from '../../../../utils/appError.js';

class InvoiceService {
  async getNextInvoiceCode() {
    const counter = await Counter.findOneAndUpdate(
      { id: 'invoiceNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const codeNumber = String(counter.seq).padStart(4, '0');
    return `INV-${codeNumber}`;
  }

  async deductInventory(products) {
    try {
      const Product = mongoose.models.Product;
      if (Product) {
        for (const item of products) {
          if (item.productId) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { currentStock: -item.quantity }
            });
          }
        }
      }
    } catch (err) {
      console.error('Inventory deduction failed or not compiled:', err.message);
    }
  }

  async restoreInventory(products) {
    try {
      const Product = mongoose.models.Product;
      if (Product) {
        for (const item of products) {
          if (item.productId) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { currentStock: item.quantity }
            });
          }
        }
      }
    } catch (err) {
      console.error('Inventory restoration failed or not compiled:', err.message);
    }
  }

  calculateTotals(products, shippingCharge = 0, amountPaid = 0, additionalDiscount = 0) {
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

    const grandTotal = Math.max(0, globalTotalAmount + shippingCharge - additionalDiscount);
    const remainingAmount = grandTotal - amountPaid;

    let paymentStatus = 'UNPAID';
    if (amountPaid > 0) {
      paymentStatus = remainingAmount <= 0 ? 'PAID' : 'PARTIALLY_PAID';
    }

    return {
      products: processedProducts,
      subtotal: globalSubtotal,
      tax: globalTax,
      discount: globalDiscount,
      grandTotal,
      remainingAmount,
      paymentStatus
    };
  }

  async createInvoice(invoiceData, creatorId) {
    const totals = this.calculateTotals(
      invoiceData.products,
      invoiceData.shippingCharge || 0,
      invoiceData.amountPaid || 0,
      invoiceData.additionalDiscount || 0
    );

    const invoiceNumber = await this.getNextInvoiceCode();

    const invoice = await Invoice.create({
      ...invoiceData,
      ...totals,
      invoiceNumber,
      createdBy: creatorId
    });

    // Link Quotation and transition status to ACCEPTED
    if (invoice.quotationId) {
      const Quotation = mongoose.models.Quotation;
      if (Quotation) {
        await Quotation.findByIdAndUpdate(invoice.quotationId, {
          quotationStatus: 'ACCEPTED',
          invoiceId: invoice._id
        });
      }
    }

    // Auto transition Deal to CLOSED_WON
    if (invoice.dealId) {
      const Deal = mongoose.models.Deal;
      if (Deal) {
        await Deal.findByIdAndUpdate(invoice.dealId, { stage: 'CLOSED_WON' });
      }
    }

    // Deduct stock levels in local inventory
    await this.deductInventory(invoice.products);

    return invoice;
  }

  async getInvoiceById(id) {
    const invoice = await Invoice.findOne({ _id: id, isDeleted: false })
      .populate('customerId', 'customerCode companyName customerName email phone')
      .populate('salesPersonId', 'name email role')
      .populate('quotationId', 'quotationNumber')
      .populate('dealId', 'title dealCode amount stage')
      .populate('createdBy', 'name email');

    if (!invoice) {
      throw new AppError('Invoice record not found', 404);
    }
    return invoice;
  }

  async getInvoicesByCustomerId(customerId) {
    return await Invoice.find({ customerId, isDeleted: false })
      .populate('salesPersonId', 'name email')
      .sort({ createdAt: -1 });
  }

  async updateInvoice(id, updateData) {
    const invoice = await Invoice.findOne({ _id: id, isDeleted: false });
    if (!invoice) {
      throw new AppError('Invoice record not found', 404);
    }

    // Recalculate if products are updated
    if (updateData.products || updateData.shippingCharge !== undefined || updateData.additionalDiscount !== undefined) {
      const totals = this.calculateTotals(
        updateData.products || invoice.products,
        updateData.shippingCharge !== undefined ? updateData.shippingCharge : invoice.shippingCharge,
        invoice.amountPaid,
        updateData.additionalDiscount !== undefined ? updateData.additionalDiscount : invoice.additionalDiscount
      );
      Object.assign(updateData, totals);
    }

    // Strip unmodifiable values
    delete updateData.invoiceNumber;
    delete updateData.createdBy;
    delete updateData.isDeleted;
    delete updateData.deletedAt;

    const updated = await Invoice.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('customerId', 'customerName companyName')
      .populate('salesPersonId', 'name email');

    return updated;
  }

  async updateStatus(id, status, updaterId) {
    const invoice = await Invoice.findOne({ _id: id, isDeleted: false });
    if (!invoice) {
      throw new AppError('Invoice record not found', 404);
    }

    const previousStatus = invoice.invoiceStatus;
    invoice.invoiceStatus = status;
    await invoice.save();

    // If invoice is cancelled, restore stock levels!
    if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
      await this.restoreInventory(invoice.products);
    }

    return invoice;
  }

  async convertQuotationToInvoice(quotationId, creatorId) {
    const quotation = await Quotation.findOne({ _id: quotationId, isDeleted: false });
    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    const existingInvoice = await Invoice.findOne({ quotationId: quotation._id, isDeleted: false });
    if (existingInvoice) {
      throw new AppError('Quotation has already been converted to an Invoice', 400);
    }

    // Create invoice parameters
    const invoiceNumber = await this.getNextInvoiceCode();
    const shipping = quotation.shippingCharge || 0;
    const totals = this.calculateTotals(
      quotation.products,
      shipping, // shippingCharge
      0  // amountPaid
    );

    // Create Invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      quotationId: quotation._id,
      dealId: quotation.dealId,
      customerId: quotation.customerId,
      salesPersonId: quotation.salesPersonId,
      products: totals.products,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      shippingCharge: shipping,
      paymentTerms: '',
      additionalDiscount: 0,
      grandTotal: totals.grandTotal,
      amountPaid: 0,
      remainingAmount: totals.grandTotal,
      paymentStatus: 'UNPAID',
      invoiceStatus: 'DRAFT',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days due
      createdBy: creatorId
    });

    // Deduct stock levels in local inventory
    await this.deductInventory(invoice.products);

    // Update Quotation Status and link invoiceId
    quotation.quotationStatus = 'ACCEPTED';
    quotation.invoiceId = invoice._id;
    await quotation.save();

    // Business Rule: Automatically update associated Deal Stage to CLOSED_WON
    if (quotation.dealId) {
      const Deal = mongoose.models.Deal;
      if (Deal) {
        await Deal.findByIdAndUpdate(quotation.dealId, { stage: 'CLOSED_WON' });
      }
    }

    return invoice;
  }

  async softDeleteInvoice(id) {
    const invoice = await Invoice.findOne({ _id: id, isDeleted: false });
    if (!invoice) {
      throw new AppError('Invoice record not found', 404);
    }

    invoice.isDeleted = true;
    invoice.deletedAt = new Date();
    await invoice.save();

    return null;
  }

  async queryInvoices(queryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentStatus,
      customerId,
      dealId,
      salesPersonId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = { isDeleted: false };
    if (status) filter.invoiceStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (customerId) filter.customerId = customerId;
    if (dealId) filter.dealId = dealId;
    if (salesPersonId) filter.salesPersonId = salesPersonId;

    if (search) {
      filter.invoiceNumber = new RegExp(search, 'i');
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'customerCode companyName customerName email phone billingAddress')
      .populate('dealId', 'title dealCode amount stage')
      .populate('salesPersonId', 'name email role')
      .populate('quotationId', 'quotationNumber');

    const totalPages = Math.ceil(total / limit);

    return {
      invoices,
      total,
      totalPages,
      currentPage: Number(page)
    };
  }
}

export default new InvoiceService();
