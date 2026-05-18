import { LeadStatus } from '@prisma/client';
import prisma from '../config/database';
import { sendEmail } from './email.service';

function isImportantStatus(status: LeadStatus) {
  // Treat some transitions as “important”. Adjust as needed.
  return status === 'CONVERTED' || status === 'LOST';
}

export async function notifyLeadAssigned({
  leadId,
  leadName,
  agentUserId,
}: {
  leadId: string;
  leadName: string;
  agentUserId: string;
}) {
  const agent = await prisma.user.findUnique({ where: { id: agentUserId } });
  if (!agent?.email) return;

  await sendEmail({
    to: agent.email,
    subject: 'New lead assigned',
    text: `Hello ${agent.name},\n\nYou have been assigned a new lead: ${leadName}.\n\nLead ID: ${leadId}\n`,
  });
}

export async function notifyLeadStatusImportant({
  leadId,
  leadName,
  newStatus,
  agentUserId,
}: {
  leadId: string;
  leadName: string;
  newStatus: LeadStatus;
  agentUserId: string;
}) {
  if (!isImportantStatus(newStatus)) return;

  const agent = await prisma.user.findUnique({ where: { id: agentUserId } });
  if (!agent?.email) return;

  await sendEmail({
    to: agent.email,
    subject: `Lead status updated: ${newStatus}`,
    text: `Hello ${agent.name},\n\nThe lead “${leadName}” has changed status to: ${newStatus}.\n\nLead ID: ${leadId}\n`,
  });
}

