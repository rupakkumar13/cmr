import Meeting from '../models/Meeting.js';
import ActivityLogService from '../../activity/services/activityLog.service.js';
import AppError from '../../../../utils/appError.js';

class MeetingService {
  async createMeeting(meetingData, hostId) {
    const meeting = await Meeting.create({
      ...meetingData,
      host: hostId
    });

    // Write Activity log for Customer or Lead depending on who is linked
    if (meeting.customer) {
      await ActivityLogService.logActivity({
        entityType: 'CUSTOMER',
        entityId: meeting.customer,
        action: 'MEETING_SCHEDULED',
        description: `Meeting scheduled: "${meeting.title}" on ${new Date(meeting.startTime).toLocaleString()}`,
        performedBy: hostId
      });
    }

    if (meeting.lead) {
      await ActivityLogService.logActivity({
        entityType: 'LEAD',
        entityId: meeting.lead,
        action: 'MEETING_SCHEDULED',
        description: `Meeting scheduled: "${meeting.title}" on ${new Date(meeting.startTime).toLocaleString()}`,
        performedBy: hostId
      });
    }

    return meeting;
  }

  async getMeetingById(id) {
    const meeting = await Meeting.findById(id)
      .populate('customer', 'customerCode companyName customerName')
      .populate('lead', 'leadCode companyName leadName')
      .populate('host', 'name email role');

    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }
    return meeting;
  }

  async updateMeeting(id, updateData, userId) {
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    const previousStatus = meeting.status;

    const updated = await Meeting.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('customer', 'companyName customerName')
      .populate('lead', 'companyName leadName')
      .populate('host', 'name email');

    if (updateData.status && updateData.status !== previousStatus) {
      const description = `Meeting status updated from ${previousStatus} to ${updateData.status} ("${meeting.title}")`;
      
      if (meeting.customer) {
        await ActivityLogService.logActivity({
          entityType: 'CUSTOMER',
          entityId: meeting.customer,
          action: 'MEETING_UPDATED',
          description,
          performedBy: userId
        });
      }

      if (meeting.lead) {
        await ActivityLogService.logActivity({
          entityType: 'LEAD',
          entityId: meeting.lead,
          action: 'MEETING_UPDATED',
          description,
          performedBy: userId
        });
      }
    }

    return updated;
  }

  async deleteMeeting(id) {
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }
    await Meeting.deleteOne({ _id: id });
    return null;
  }

  async queryMeetings(queryParams) {
    const {
      page = 1,
      limit = 10,
      status,
      customer,
      lead,
      host,
      sortBy = 'startTime',
      sortOrder = 'asc'
    } = queryParams;

    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (lead) filter.lead = lead;
    if (host) filter.host = host;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const total = await Meeting.countDocuments(filter);
    const meetings = await Meeting.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customer', 'customerCode companyName customerName')
      .populate('lead', 'leadCode companyName leadName')
      .populate('host', 'name email role');

    const totalPages = Math.ceil(total / limit);

    return {
      meetings,
      total,
      totalPages,
      currentPage: Number(page)
    };
  }
}

export default new MeetingService();
