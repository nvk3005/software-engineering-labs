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
    const { accessToken } = await authService.refreshToken(token);

    res.status(200).json(successResponse('Refresh token thành công', { accessToken }));
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


export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendOtp(email);
    res.status(200).json(successResponse(result.message));
  } catch (err) {
    next(err);
  }
};