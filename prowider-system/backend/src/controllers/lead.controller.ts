import { Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLeadRoundRobin,
} from '../services/lead.service';

export const createLeadHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, phone, status, source, assignedTo, autoAssign } = req.body;

    if (!name || !email || !phone || !source) {
      throw new AppError('Name, email, phone, and source are required', 400);
    }

    let finalAssignedTo = assignedTo;

    if (autoAssign && !assignedTo) {
      finalAssignedTo = await assignLeadRoundRobin(req.userId!);
    }

    const lead = await createLead({
      name,
      email,
      phone,
      status,
      source,
      assignedTo: finalAssignedTo,
      createdBy: req.userId!,
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, assignedTo, source } = req.query;

    const leads = await getLeads({
      status: status as any,
      assignedTo: assignedTo as string,
      source: source as any,
      userId: req.userId,
      userRole: req.userRole as any,
    });

    res.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadByIdHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const lead = await getLeadById(id, req.userId, req.userRole as any);

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeadHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, source, assignedTo } = req.body;

    const lead = await updateLead(id, { name, email, phone, status, source, assignedTo }, req.userId!);

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLeadHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await deleteLead(id);

    res.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const assignLeadHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      throw new AppError('Agent ID is required', 400);
    }

    const lead = await updateLead(id, { assignedTo, status: 'ASSIGNED' }, req.userId!);

    res.json({
      success: true,
      message: 'Lead assigned successfully',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};
