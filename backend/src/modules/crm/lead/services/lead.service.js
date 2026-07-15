import Lead from '../models/Lead.js';
import Counter from '../../customer/models/Counter.js';
import CustomerService from '../../customer/services/customer.service.js';
import AppError from '../../../../utils/appError.js';

class LeadService {
  async getNextLeadCode() {
    const counter = await Counter.findOneAndUpdate(
      { id: 'leadCode' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const codeNumber = String(counter.seq).padStart(4, '0');
    return `LEAD-${codeNumber}`;
  }

  async createLead(leadData, creatorId) {
    const leadCode = await this.getNextLeadCode();

    const lead = await Lead.create({
      ...leadData,
      leadCode,
      createdBy: creatorId
    });

    return lead;
  }

  async getLeadById(id) {
    const lead = await Lead.findOne({ _id: id, isDeleted: false })
      .populate('assignedSalesPerson', 'name email role')
      .populate('createdBy', 'name email')
      .populate('convertedCustomer', 'customerCode companyName customerName');

    if (!lead) {
      throw new AppError('Lead record not found', 404);
    }
    return lead;
  }

  async updateLead(id, updateData) {
    const lead = await Lead.findOne({ _id: id, isDeleted: false });
    if (!lead) {
      throw new AppError('Lead record not found', 404);
    }

    // Protect administrative fields
    delete updateData.leadCode;
    delete updateData.createdBy;
    delete updateData.convertedToCustomer;
    delete updateData.convertedCustomer;
    delete updateData.isDeleted;
    delete updateData.deletedAt;

    const updated = await Lead.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('assignedSalesPerson', 'name email role');

    return updated;
  }

  async softDeleteLead(id) {
    const lead = await Lead.findOne({ _id: id, isDeleted: false });
    if (!lead) {
      throw new AppError('Lead record not found', 404);
    }

    lead.isDeleted = true;
    lead.deletedAt = new Date();
    await lead.save();
    return null;
  }

  async queryLeads(queryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      source,
      assignedSalesPerson,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = { isDeleted: false };

    // Apply filters
    if (status) filter.status = status;
    if (source) filter.source = new RegExp(source, 'i');
    if (assignedSalesPerson) filter.assignedSalesPerson = assignedSalesPerson;

    // Apply Search matching
    if (search) {
      filter.$or = [
        { leadName: new RegExp(search, 'i') },
        { companyName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { leadCode: new RegExp(search, 'i') }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const totalLeads = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('assignedSalesPerson', 'name email role');

    const totalPages = Math.ceil(totalLeads / limit);

    return {
      leads,
      totalLeads,
      totalPages,
      currentPage: Number(page)
    };
  }

  async convertLeadToCustomer(leadId, creatorId) {
    const lead = await Lead.findOne({ _id: leadId, isDeleted: false });
    if (!lead) {
      throw new AppError('Lead record not found', 404);
    }

    if (lead.convertedToCustomer) {
      throw new AppError('Lead has already been converted to a customer profile', 400);
    }

    // 1. Trigger Customer creation in CRM customer service
    const customer = await CustomerService.createCustomer({
      companyName: lead.companyName || `${lead.leadName}'s Company`,
      customerName: lead.leadName,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      assignedSalesPerson: lead.assignedSalesPerson,
      status: 'ACTIVE',
      notes: `Converted from Lead Code: ${lead.leadCode}. Notes: ${lead.notes || ''}`
    }, creatorId);

    // 2. Mark lead as converted
    lead.convertedToCustomer = true;
    lead.convertedCustomer = customer._id;
    lead.status = 'QUALIFIED';
    await lead.save();

    return customer;
  }
}

export default new LeadService();
