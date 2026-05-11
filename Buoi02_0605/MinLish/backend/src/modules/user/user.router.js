import { Router } from 'express';
import * as controller from './user.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.middleware.js';
import {putProfileSchema} from './user.schema.js'
import multer from "multer"

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/profile', protect, controller.getProfile);
router.get("/edit-profile", protect, controller.getEditProfile);
router.post("/put-profile", protect, validate(putProfileSchema), upload.single("avatar"), controller.putProfile);

export default router;
