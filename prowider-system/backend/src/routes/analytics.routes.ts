import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', authorize('ADMIN', 'MANAGER', 'AGENT'), getDashboardAnalytics);

export default router;
