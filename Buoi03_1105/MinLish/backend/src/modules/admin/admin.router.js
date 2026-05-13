import { Router } from 'express';
import * as controller from './admin.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/profile', controller.getAdminProfile);

export default router;
