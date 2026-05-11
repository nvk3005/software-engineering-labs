import AppError from '../../utils/AppError.js';
import { verifyToken, generateToken } from '../../utils/jwt.js';
import { config } from '../../config/env.js';
import { successResponse } from '../../utils/response.js';
import * as authService from './auth.service.js';

export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.loginUser(req.body);

    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json(successResponse('Đăng nhập thành công', { accessToken, user }));
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const data = await authService.registerUser(req.body);
    res.status(201).json(successResponse('Đăng ký thành công', data));
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const data = await authService.verifyOtp(req.body);
    res.status(200).json(successResponse('Kích hoạt tài khoản thành công', data));
  } catch (err) {
    next(err);
  }
};


export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return next(new AppError('Không tìm thấy Refresh Token, vui lòng đăng nhập lại', 401));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
      if (decoded.type !== 'REFRESH') {
        return next(new AppError('Token không hợp lệ', 401));
      }
    } catch (err) {
      return next(new AppError('Token không hợp lệ', 401));
    }

    const payload = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      username: decoded.username,
      type: 'ACCESS'
    };

    const newAccessToken = generateToken(payload, config.jwtAccessExpiresIn);

    res.status(200).json(successResponse('Refresh token thành công', { accessToken: newAccessToken }));
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    const result = await authService.forgotPassword(email);
    res.status(200).json(successResponse(result.message));
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.status(200).json(successResponse(result.message));
  } catch (err) {
    next(err);
  }
};