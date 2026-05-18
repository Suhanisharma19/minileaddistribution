import { Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from '../services/notification.service';

export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { unreadOnly } = req.query;
    const notifications = await getUserNotifications(
      req.userId!,
      unreadOnly === 'true'
    );

    res.json({
      success: true,
      data: notifications.map((n) => ({
        ...n,
        metadata: n.metadata ? JSON.parse(n.metadata) : null,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadNotificationsCount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const count = await getUnreadCount(req.userId!);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await markNotificationAsRead(id, req.userId!);

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await markAllNotificationsAsRead(req.userId!);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
