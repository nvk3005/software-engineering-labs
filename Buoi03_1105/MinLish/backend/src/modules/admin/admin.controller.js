import { successResponse } from '../../utils/response.js';
import * as userService from '../user/user.service.js';

export const getAdminProfile = async (req, res, next) => {
  try {
    const adminData = await userService.getUserProfile(req.user.id);
    res.status(200).json(successResponse('Lấy thông tin admin thành công', adminData));
  } catch (err) {
    next(err);
  }
};
