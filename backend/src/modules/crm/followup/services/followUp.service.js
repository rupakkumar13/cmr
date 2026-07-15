import FollowUp from '../models/FollowUp.js';
import ActivityLogService from '../../activity/services/activityLog.service.js';
import NotificationService from '../../../notifications/services/notification.service.js';
import AppError from '../../../../utils/appError.js';

class FollowUpService {
  async createFollowUp(followData, creatorId) {
    const follow = await FollowUp.create({
      ...followData,
      createdBy: creatorId
    });

    const logParams = {
      action: 'FOLLOWUP_CREATED',
      description: `Follow up task created: "${follow.title}" (Due: ${new Date(follow.dueDate).toLocaleDateString()})`,
      performedBy: creatorId
    };

    if (follow.customer) {
      await ActivityLogService.logActivity({
        ...logParams,
        entityType: 'CUSTOMER',
        entityId: follow.customer
      });
    }

    if (follow.lead) {
      await ActivityLogService.logActivity({
        ...logParams,
        entityType: 'LEAD',
        entityId: follow.lead
      });
    }

    // Send notifications to the assigned employee and the sales executive role
    try {
      if (follow.assignedTo) {
        await NotificationService.createNotification({
          userId: follow.assignedTo,
          title: 'New Task Assigned',
          message: `You have been assigned a task: "${follow.title}". Due Date: ${new Date(follow.dueDate).toLocaleDateString()}`,
          type: 'INFO'
        });

        await NotificationService.createNotification({
          roles: ['SALES'],
          title: 'Task Assigned to Employee',
          message: `A task "${follow.title}" has been assigned. Due Date: ${new Date(follow.dueDate).toLocaleDateString()}`,
          type: 'INFO'
        });
      }
    } catch (err) {
      console.error('Failed to create task assignment notifications:', err.message);
    }

    return follow;
  }

  async getFollowUpById(id) {
    const follow = await FollowUp.findById(id)
      .populate('customer', 'customerCode companyName customerName')
      .populate('lead', 'leadCode companyName leadName')
      .populate('assignedTo', 'name email role');

    if (!follow) {
      throw new AppError('Follow up record not found', 404);
    }
    return follow;
  }

  async updateFollowUp(id, updateData, userId, userRole) {
    const follow = await FollowUp.findById(id);
    if (!follow) {
      throw new AppError('Follow up record not found', 404);
    }

    // Security check: EMPLOYEE can only update tasks assigned to themselves
    if (userRole === 'EMPLOYEE' && String(follow.assignedTo) !== String(userId)) {
      throw new AppError('You are only authorized to update tasks assigned to you', 403);
    }

    const previousStatus = follow.status;
    const previousAssignee = follow.assignedTo;

    const updated = await FollowUp.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('customer', 'companyName customerName')
      .populate('lead', 'companyName leadName')
      .populate('assignedTo', 'name email');

    // Notify upon reassignment
    if (updateData.assignedTo && String(updateData.assignedTo) !== String(previousAssignee)) {
      try {
        await NotificationService.createNotification({
          userId: updated.assignedTo._id || updated.assignedTo,
          title: 'Task Reassigned',
          message: `You have been assigned a task: "${updated.title}". Due Date: ${new Date(updated.dueDate).toLocaleDateString()}`,
          type: 'INFO'
        });

        await NotificationService.createNotification({
          roles: ['SALES'],
          title: 'Task Reassigned',
          message: `A task "${updated.title}" has been reassigned. Due Date: ${new Date(updated.dueDate).toLocaleDateString()}`,
          type: 'INFO'
        });
      } catch (err) {
        console.error('Failed to create task reassignment notifications:', err.message);
      }
    }

    if (updateData.status && updateData.status !== previousStatus) {
      const description = `Follow up task "${follow.title}" status changed to ${updateData.status}`;
      const action = updateData.status === 'COMPLETED' ? 'FOLLOWUP_COMPLETED' : 'FOLLOWUP_UPDATED';

      if (follow.customer) {
        await ActivityLogService.logActivity({
          entityType: 'CUSTOMER',
          entityId: follow.customer,
          action,
          description,
          performedBy: userId
        });
      }

      if (follow.lead) {
        await ActivityLogService.logActivity({
          entityType: 'LEAD',
          entityId: follow.lead,
          action,
          description,
          performedBy: userId
        });
      }
    }

    return updated;
  }

  async deleteFollowUp(id) {
    const follow = await FollowUp.findById(id);
    if (!follow) {
      throw new AppError('Follow up record not found', 404);
    }
    await FollowUp.deleteOne({ _id: id });
    return null;
  }

  async queryFollowUps(queryParams) {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      customer,
      lead,
      assignedTo,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = queryParams;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (customer) filter.customer = customer;
    if (lead) filter.lead = lead;
    if (assignedTo) filter.assignedTo = assignedTo;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const total = await FollowUp.countDocuments(filter);
    const followUps = await FollowUp.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customer', 'customerCode companyName customerName')
      .populate('lead', 'leadCode companyName leadName')
      .populate('assignedTo', 'name email role');

    const totalPages = Math.ceil(total / limit);

    return {
      followUps,
      total,
      totalPages,
      currentPage: Number(page)
    };
  }
}

export default new FollowUpService();
