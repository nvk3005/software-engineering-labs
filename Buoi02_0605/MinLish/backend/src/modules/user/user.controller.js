import AppError from '../../utils/AppError.js';
import { successResponse } from '../../utils/response.js';
import * as service from './user.service.js';
import * as fileService from '../file/file.service.js'

export const getProfile = async (req, res, next) => {
  try {
    const data = await service.getUserProfile(req.query.userId);
    let imagePresignedUrl = null;
    // if (data && data.avatarName) {
      imagePresignedUrl = fileService.getImagePresignedUrl(data);
    // }
    data.imagePresignedUrl = imagePresignedUrl;
    res.status(200).json(successResponse('Lấy thông tin thành công', data));
  } catch (err) {
    next(err);
  }
};

export const getEditProfile = async (req, res, next) => {
  let userId = req.query.userId;
  if (userId&&service.isEditSelfProfile(userId, req.user.id)) {//req.user.id từ token jwt
    let data = await service.getUserProfile(userId);
    let imagePresignedUrl = null;
    // if (data && data.avatarName) {
      imagePresignedUrl = fileService.getImagePresignedUrl(data);
    // }
    data.imagePresignedUrl = imagePresignedUrl;
    res.status(200).json(successResponse('Lấy thông tin thành công', data));
  } else {
    next(new AppError('Chỉ có quyền sửa profile của chính mình', 401));
  }
};

export const putProfile = async (req, res, next) => {
  let userId = req.body.userId;
  if (userId&&service.isEditSelfProfile(userId, req.user.id)) {
    let data = await service.getUserProfile(userId);
    if (req.file) {
      req.body.avatarName = await fileService.deleteOldAndInsertNewImageInS3(data, req.file);
    }
    const updatedProfile = await service.updateProfile(req.body);
    const imagePresignedUrl = fileService.getImagePresignedUrl(updatedProfile);
    updatedProfile.imagePresignedUrl = imagePresignedUrl;
    res.status(200).json(successResponse('Lấy thông tin thành công', updatedProfile));
  } else {
    next(new AppError('Chỉ có quyền sửa profile của chính mình', 401));
  }
};