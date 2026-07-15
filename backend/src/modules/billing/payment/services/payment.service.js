import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Invoice from '../../invoice/models/Invoice.js';
import Counter from '../../shared/models/Counter.js';
import AppError from '../../../../utils/appError.js';

class PaymentService {
  async getNextPaymentCode() {
    const counter = await Counter.findOneAndUpdate(
      { id: 'paymentNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const codeNumber = String(counter.seq).padStart(4, '0');
    return `PAY-${codeNumber}`;
  }

  async createPayment(paymentData, creatorId) {
    const invoice = await Invoice.findOne({ _id: paymentData.invoiceId, isDeleted: false });
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (String(invoice.customerId) !== String(paymentData.customerId)) {
      throw new AppError('Customer reference does not match the invoice customer reference', 400);
    }

    const paymentNumber = await this.getNextPaymentCode();

    const paymentDate = paymentData.paymentDate ? new Date(paymentData.paymentDate) : undefined;

    const payment = await Payment.create({
      ...paymentData,
      paymentNumber,
      paymentDate,
      createdBy: creatorId
    });

    // If payment is SUCCESS/COMPLETED, update Invoice stats
    if (payment.paymentStatus === 'COMPLETED' || payment.paymentStatus === 'SUCCESS') {
      invoice.amountPaid = Number(invoice.amountPaid) + Number(payment.amount);
      invoice.remainingAmount = Number(invoice.grandTotal) - Number(invoice.amountPaid);

      if (invoice.remainingAmount <= 0) {
        invoice.paymentStatus = 'PAID';
      } else {
        invoice.paymentStatus = 'PARTIALLY_PAID';
      }

      await invoice.save();

      // Automate: If invoice is PAID and belongs to a deal, complete the deal
      if (invoice.paymentStatus === 'PAID' && invoice.dealId) {
        const Deal = mongoose.models.Deal;
        if (Deal) {
          await Deal.findByIdAndUpdate(invoice.dealId, { status: 'COMPLETED' });
        }
      }
    }

    return payment;
  }

  async getPaymentById(id) {
    const payment = await Payment.findById(id)
      .populate('customerId', 'customerCode companyName customerName email')
      .populate('invoiceId', 'invoiceNumber grandTotal remainingAmount paymentStatus')
      .populate('createdBy', 'name email');

    if (!payment) {
      throw new AppError('Payment transaction not found', 404);
    }
    return payment;
  }

  async queryPayments(queryParams) {
    const {
      page = 1,
      limit = 10,
      customerId,
      invoiceId,
      paymentStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = {};
    if (customerId) filter.customerId = customerId;
    if (invoiceId) filter.invoiceId = invoiceId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'customerCode companyName customerName')
      .populate('invoiceId', 'invoiceNumber grandTotal')
      .populate('createdBy', 'name email');

    const totalPages = Math.ceil(total / limit);

    return {
      payments,
      total,
      totalPages,
      currentPage: Number(page)
    };
  }

  async updatePaymentStatus(id, status, updaterId) {
    const payment = await Payment.findById(id);
    if (!payment) {
      throw new AppError('Payment transaction not found', 404);
    }
    
    const previousStatus = payment.paymentStatus;
    if (previousStatus === status) {
      return payment;
    }

    payment.paymentStatus = status;
    await payment.save();

    // If transitioning to REFUNDED from SUCCESS/COMPLETED, adjust Invoice balance!
    if (status === 'REFUNDED' && (previousStatus === 'COMPLETED' || previousStatus === 'SUCCESS')) {
      const invoice = await Invoice.findById(payment.invoiceId);
      if (invoice) {
        invoice.amountPaid = Math.max(0, Number(invoice.amountPaid) - Number(payment.amount));
        invoice.remainingAmount = Number(invoice.grandTotal) - Number(invoice.amountPaid);
        
        if (invoice.remainingAmount >= invoice.grandTotal) {
          invoice.paymentStatus = 'UNPAID';
        } else {
          invoice.paymentStatus = 'PARTIALLY_PAID';
        }
        await invoice.save();

        // If the deal was marked completed, we can change its status back to ACTIVE!
        if (invoice.dealId) {
          const Deal = mongoose.models.Deal;
          if (Deal) {
            await Deal.findByIdAndUpdate(invoice.dealId, { status: 'ACTIVE' });
          }
        }
      }
    }
    return payment;
  }
}

export default new PaymentService();
