import Deal from '../models/Deal.js';
import Counter from '../../customer/models/Counter.js';
import ActivityLogService from '../../activity/services/activityLog.service.js';
import AppError from '../../../../utils/appError.js';

class DealService {
  async getNextDealCode() {
    const counter = await Counter.findOneAndUpdate(
      { id: 'dealCode' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const codeNumber = String(counter.seq).padStart(4, '0');
    return `DEAL-${codeNumber}`;
  }

  async createDeal(dealData, creatorId) {
    const dealCode = await this.getNextDealCode();

    const deal = await Deal.create({
      ...dealData,
      dealCode,
      createdBy: creatorId
    });

    // Write Activity Log
    await ActivityLogService.logActivity({
      entityType: 'DEAL',
      entityId: deal._id,
      action: 'CREATED',
      description: `Deal ${deal.dealCode} ("${deal.title}") registered with amount $${deal.amount} at stage ${deal.stage}`,
      performedBy: creatorId
    });

    // Also link activity log to the Customer profile!
    await ActivityLogService.logActivity({
      entityType: 'CUSTOMER',
      entityId: deal.customer,
      action: 'DEAL_ADDED',
      description: `New deal associated: ${deal.dealCode} ("${deal.title}") for $${deal.amount}`,
      performedBy: creatorId
    });

    return deal;
  }

  async getDealById(id) {
    const deal = await Deal.findOne({ _id: id, isDeleted: false })
      .populate('customer', 'customerCode companyName customerName email')
      .populate('assignedSalesPerson', 'name email role')
      .populate('createdBy', 'name email');

    if (!deal) {
      throw new AppError('Deal record not found', 404);
    }
    return deal;
  }

  async updateDeal(id, updateData, updaterId) {
    const deal = await Deal.findOne({ _id: id, isDeleted: false });
    if (!deal) {
      throw new AppError('Deal record not found', 404);
    }

    const previousStage = deal.stage;

    // Protect system properties
    delete updateData.dealCode;
    delete updateData.createdBy;
    delete updateData.isDeleted;
    delete updateData.deletedAt;

    updateData.lastActivity = new Date();

    const updated = await Deal.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('customer', 'customerCode companyName customerName')
      .populate('assignedSalesPerson', 'name email role');

    // If stage is modified, write activity log audit trails
    if (updateData.stage && updateData.stage !== previousStage) {
      await ActivityLogService.logActivity({
        entityType: 'DEAL',
        entityId: deal._id,
        action: 'STAGE_CHANGED',
        description: `Deal stage updated from ${previousStage} to ${updateData.stage}`,
        performedBy: updaterId
      });

      await ActivityLogService.logActivity({
        entityType: 'CUSTOMER',
        entityId: deal.customer,
        action: 'DEAL_UPDATED',
        description: `Deal ${deal.dealCode} ("${deal.title}") stage changed from ${previousStage} to ${updateData.stage}`,
        performedBy: updaterId
      });
    }

    return updated;
  }

  async softDeleteDeal(id, updaterId) {
    const deal = await Deal.findOne({ _id: id, isDeleted: false });
    if (!deal) {
      throw new AppError('Deal record not found', 404);
    }

    deal.isDeleted = true;
    deal.deletedAt = new Date();
    await deal.save();

    await ActivityLogService.logActivity({
      entityType: 'DEAL',
      entityId: deal._id,
      action: 'DELETED',
      description: `Deal ${deal.dealCode} soft-deleted.`,
      performedBy: updaterId
    });

    return null;
  }

  async queryDeals(queryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      stage,
      status,
      customer,
      assignedSalesPerson,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = { isDeleted: false };

    // Apply stage filters
    if (stage) filter.stage = stage;
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (assignedSalesPerson) filter.assignedSalesPerson = assignedSalesPerson;

    // Apply search on title
    if (search) {
      filter.title = new RegExp(search, 'i');
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const totalDeals = await Deal.countDocuments(filter);
    const deals = await Deal.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customer', 'customerCode companyName customerName')
      .populate('assignedSalesPerson', 'name email role');

    const totalPages = Math.ceil(totalDeals / limit);

    return {
      deals,
      totalDeals,
      totalPages,
      currentPage: Number(page)
    };
  }
}

export default new DealService();
