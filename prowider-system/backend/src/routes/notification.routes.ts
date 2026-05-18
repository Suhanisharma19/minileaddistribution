import { Router } from 'express';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadNotificationsCount);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);

export default router;
