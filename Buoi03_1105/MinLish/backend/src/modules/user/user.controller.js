import AppError from "../../utils/AppError.js";
import { successResponse } from "../../utils/response.js";
import * as service from "./user.service.js";
import * as fileService from "../file/file.service.js";
import { error } from "console";

export const getSelfProfile = async (req, res, next) => {
  try {
    let data = await service.getUserProfile(req.user.id); //id từ token
    const result = data.toJSON ? data.toJSON() : data;
    result.imagePresignedUrl = await fileService.getImagePresignedUrl(data);
    res
      .status(200)
      .json(successResponse("Lấy thông tin để cập nhật thành công", result));
  } catch (error) {
    next(error);
  }
};

export const getOtherProfile = async (req, res, next) => {
  try {
    const data = await service.getUserProfile(req.params.id);
    const result = data.toJSON ? data.toJSON() : data;
    result.imagePresignedUrl = await fileService.getImagePresignedUrl(data);
    res.status(200).json(successResponse("Lấy thông tin thành công", result));
  } catch (err) {
    next(err);
  }
};

export const postProfile = async (req, res, next) => {
  try {
    let userId = req.body.userId;
    if (userId && service.isEditSelfProfile(userId, req.user.id)) {
      let data = await service.getUserProfile(userId);
      if (req.file) {
        req.body.avatarName = await fileService.deleteOldAndInsertNewImageInS3(
          data,
          req.file,
        );
      }
      data = await service.updateProfile(req.body);
      const result = data.toJSON ? data.toJSON() : data;
      result.imagePresignedUrl = await fileService.getImagePresignedUrl(data);
      return res.status(200).json(successResponse("Lấy thông tin thành công", result));
    }
    return next(new AppError("Chỉ có quyền sửa profile của chính mình", 401));
  } catch (err) {
    return next(err);
  }
};
