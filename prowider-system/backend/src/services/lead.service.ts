import prisma from '../config/database';
import { Role, LeadStatus, LeadSource } from '@prisma/client';
import { createNotification } from './notification.service';
import { emitToUser, emitToAll } from '../config/socket';
import { notifyLeadAssigned, notifyLeadStatusImportant } from './leadEmail.service';


export const createLead = async (data: {
  name: string;
  email: string;
  phone: string;
  status?: LeadStatus;
  source: LeadSource;
  assignedTo?: string;
  createdBy: string;
}) => {
  const lead = await prisma.lead.create({
    data,
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      action: 'ASSIGNED',
      note: data.assignedTo ? 'Lead created and assigned' : 'Lead created',
      performedBy: data.createdBy,
    },
  });

  // Notify assigned agent if lead is assigned
  if (data.assignedTo) {
    await createNotification({
      userId: data.assignedTo,
      type: 'LEAD_ASSIGNED',
      title: 'New Lead Assigned',
      message: `You have been assigned a new lead: ${lead.name}`,
      metadata: { leadId: lead.id },
    });

    // Emit socket event to assigned user
    emitToUser(data.assignedTo, 'lead:assigned', {
      lead,
      message: `New lead ${lead.name} assigned to you`,
    });

    // Send email to newly assigned agent
    try {
      await notifyLeadAssigned({
        leadId: lead.id,
        leadName: lead.name,
        agentUserId: data.assignedTo,
      });
    } catch (err) {
      console.error('Failed to send lead assignment email:', err);
    }

  }

  // Emit to all users for dashboard refresh
  emitToAll('lead:created', { lead });

  return lead;
};

export const getLeads = async (filters: {
  status?: LeadStatus;
  assignedTo?: string;
  source?: LeadSource;
  userId?: string;
  userRole?: Role;
}) => {
  const where: any = {};

  if (filters.status) where.status = filters.status;
  if (filters.source) where.source = filters.source;

  if (filters.userRole === 'AGENT') {
    where.OR = [
      { assignedTo: filters.userId },
      { createdBy: filters.userId },
    ];
  } else if (filters.assignedTo) {
    where.assignedTo = filters.assignedTo;
  }

  return await prisma.lead.findMany({
    where,
    include: {
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getLeadById = async (id: string, userId?: string, userRole?: Role) => {
  const where: any = { id };

  if (userRole === 'AGENT') {
    where.assignedTo = userId;
  }

  return await prisma.lead.findFirst({
    where,
    include: {
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      activities: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
      },
    },
  });
};

export const updateLead = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    status?: LeadStatus;
    source?: LeadSource;
    assignedTo?: string;
  },
  userId: string
) => {
  const previousLead = await prisma.lead.findUnique({ where: { id } });

  const lead = await prisma.lead.update({
    where: { id },
    data,
  });

  if (data.assignedTo && data.assignedTo !== previousLead?.assignedTo) {
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        action: 'ASSIGNED',
        note: 'Lead reassigned',
        performedBy: userId,
      },
    });

    // Notify new assigned agent
    await createNotification({
      userId: data.assignedTo,
      type: 'LEAD_ASSIGNED',
      title: 'Lead Reassigned',
      message: `Lead ${lead.name} has been reassigned to you`,
      metadata: { leadId: lead.id },
    });

    // Emit socket event to new assigned user
    emitToUser(data.assignedTo, 'lead:assigned', {
      lead,
      message: `Lead ${lead.name} reassigned to you`,
    });

    // Notify previous assigned agent if there was one
    if (previousLead?.assignedTo) {
      await createNotification({
        userId: previousLead.assignedTo,
        type: 'LEAD_UNASSIGNED',
        title: 'Lead Unassigned',
        message: `Lead ${lead.name} has been unassigned from you`,
        metadata: { leadId: lead.id },
      });

      // Emit socket event to previous assigned user
      emitToUser(previousLead.assignedTo, 'lead:unassigned', {
        lead,
        message: `Lead ${lead.name} unassigned from you`,
      });
    }

    // Emit to all users for dashboard refresh
    emitToAll('lead:updated', { lead });
  }

  if (data.status && data.status !== previousLead?.status) {
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        action: 'STATUS_UPDATED',
        note: `Status changed from ${previousLead?.status} to ${data.status}`,
        performedBy: userId,
      },
    });

    // Notify assigned agent about status change
    if (lead.assignedTo) {
      await createNotification({
        userId: lead.assignedTo,
        type: 'LEAD_STATUS_CHANGED',
        title: 'Lead Status Updated',
        message: `Lead ${lead.name} status changed to ${data.status}`,
        metadata: { leadId: lead.id, newStatus: data.status },
      });

      // Emit socket event to assigned user
      emitToUser(lead.assignedTo, 'lead:status-changed', {
        lead,
        newStatus: data.status,
        message: `Lead ${lead.name} status changed to ${data.status}`,
      });

      // Send email for important status changes
      try {
        await notifyLeadStatusImportant({
          leadId: lead.id,
          leadName: lead.name,
          newStatus: data.status,
          agentUserId: lead.assignedTo,
        });
      } catch (err) {
        console.error('Failed to send lead status email:', err);
      }

    }

    // Emit to all users for dashboard refresh
    emitToAll('lead:updated', { lead });
  }

  return lead;
};

export const deleteLead = async (id: string) => {
  await prisma.leadActivity.deleteMany({ where: { leadId: id } });
  return await prisma.lead.delete({
    where: { id },
  });
};

export const assignLeadRoundRobin = async (createdBy: string) => {
  const agents = await prisma.user.findMany({
    where: { role: 'AGENT' },
    select: { id: true },
  });

  if (agents.length === 0) {
    throw new Error('No agents available for assignment');
  }

  const currentAssignments = await prisma.lead.groupBy({
    by: ['assignedTo'],
    where: {
      assignedTo: { in: agents.map((a) => a.id) },
      status: { in: ['NEW', 'ASSIGNED'] },
    },
    _count: { assignedTo: true },
  });

  const assignmentCount = new Map<string, number>();
  agents.forEach((agent) => assignmentCount.set(agent.id, 0));

  currentAssignments.forEach((assignment) => {
    if (assignment.assignedTo) {
      assignmentCount.set(assignment.assignedTo, assignment._count.assignedTo);
    }
  });

  let leastBusyAgent = agents[0];
  let minCount = assignmentCount.get(agents[0].id) || 0;

  for (const agent of agents) {
    const count = assignmentCount.get(agent.id) || 0;
    if (count < minCount) {
      minCount = count;
      leastBusyAgent = agent;
    }
  }

  return leastBusyAgent.id;
};

export const getLeadAnalytics = async () => {
  const [
    totalLeads,
    statusBreakdown,
    sourceBreakdown,
    agentPerformance,
    recentActivities,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.lead.groupBy({
      by: ['source'],
      _count: { source: true },
    }),
    prisma.lead.groupBy({
      by: ['assignedTo'],
      where: {
        assignedTo: { not: null },
        status: { in: ['CONVERTED'] },
      },
      _count: { assignedTo: true },
    }),
    prisma.leadActivity.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        lead: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const agents = await prisma.user.findMany({
    where: { role: 'AGENT' },
    select: { id: true, name: true },
  });

  const agentStats = agents.map((agent) => {
    const performance = agentPerformance.find((p) => p.assignedTo === agent.id);
    return {
      agentId: agent.id,
      agentName: agent.name,
      convertedLeads: performance?._count.assignedTo || 0,
    };
  });

  const recentActivitiesFormatted = recentActivities.map((activity) => ({
    description: `${activity.user.name} ${activity.action.toLowerCase()} ${activity.lead.name}`,
    timestamp: new Date(activity.timestamp).toLocaleString(),
  }));

  return {
    totalLeads,
    statusBreakdown: statusBreakdown.map((s) => ({
      status: s.status,
      count: s._count.status,
    })),
    sourceBreakdown: sourceBreakdown.map((s) => ({
      source: s.source,
      count: s._count.source,
    })),
    agentStats,
    recentActivities: recentActivitiesFormatted,
  };
};
