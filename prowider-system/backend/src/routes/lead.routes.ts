import { Router } from 'express';
import {
  createLeadHandler,
  getLeadsHandler,
  getLeadByIdHandler,
  updateLeadHandler,
  deleteLeadHandler,
  assignLeadHandler,
} from '../controllers/lead.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MANAGER', 'AGENT'), createLeadHandler);
router.get('/', getLeadsHandler);
router.get('/:id', getLeadByIdHandler);
router.put('/:id', authorize('ADMIN', 'MANAGER'), updateLeadHandler);
router.delete('/:id', authorize('ADMIN'), deleteLeadHandler);
router.post('/:id/assign', authorize('ADMIN', 'MANAGER'), assignLeadHandler);

export default router;
