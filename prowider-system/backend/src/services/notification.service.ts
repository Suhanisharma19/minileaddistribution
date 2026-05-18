import prisma from '../config/database';

export const createNotification = async (data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
}) => {
  return await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
  });
};

export const getUserNotifications = async (userId: string, unreadOnly = false) => {
  const where: any = { userId };
  if (unreadOnly) {
    where.isRead = false;
  }

  return await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  return await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: { isRead: true },
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  return await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true },
  });
};

export const getUnreadCount = async (userId: string) => {
  return await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};
