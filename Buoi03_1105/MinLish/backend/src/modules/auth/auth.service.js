import bcrypt from 'bcrypt';
import AppError from '../../utils/AppError.js';
import { User, UserProfile, Otp } from '../../models/mysql/index.js';
import { generateToken, verifyToken } from '../../utils/jwt.js';
import { config } from '../../config/env.js';
import { sendOtpEmail, sendForgotPasswordEmail } from '../../utils/mail.util.js';

export const loginUser = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({
    where: { email },
    include: [{ model: UserProfile, as: 'profile' }]
  });

  if (!user) {
    throw new AppError('Email hoặc mật khẩu không chính xác', 401);
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError('Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt', 403);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Email hoặc mật khẩu không chính xác', 401);
  }

  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
    username: user.username
  };

  const accessToken = generateToken({ ...payload, type: 'ACCESS' }, config.jwtAccessExpiresIn);
  const refreshToken = generateToken({ ...payload, type: 'REFRESH' }, config.jwtRefreshExpiresIn);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile
    }
  };
};

export const registerUser = async (data) => {
  const { username, email, password } = data;

  // Kiểm tra email hoặc username đã tồn tại chưa
  const existingUser = await User.findOne({
    where: {
      [User.sequelize.Sequelize.Op.or]: [{ email }, { username }]
    }
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new AppError('Email đã được sử dụng', 400);
    }
    throw new AppError('Tên đăng nhập đã được sử dụng', 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Tạo user
  const user = await User.create({
    username,
    email,
    passwordHash,
    role: 'USER'
  });

  // Tạo profile trống
  await UserProfile.create({ userId: user.id });

  // Tạo OTP (6 chữ số ngẫu nhiên)
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút sau

  await Otp.create({
    otpCode,
    type: 'REGISTER',
    userId: user.id,
    expiresAt
  });

  // Gửi email OTP
  try {
    await sendOtpEmail(email, otpCode);
  } catch (error) {
    console.error('Lỗi gửi mail OTP:', error);
    await user.destroy();
    throw new AppError('Lỗi gửi email OTP, vui lòng thử lại sau', 500);
  }

  return {
    message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã kích hoạt.',
    email: user.email
  };
};

export const verifyOtp = async (data) => {
  const { email, otpCode } = data;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError('Người dùng không tồn tại', 404);
  }

  if (user.status === 'ACTIVE') {
    throw new AppError('Tài khoản đã được kích hoạt trước đó', 400);
  }

  const otp = await Otp.findOne({
    where: {
      userId: user.id,
      otpCode,
      type: 'REGISTER',
      isUsed: false,
      expiresAt: {
        [User.sequelize.Sequelize.Op.gt]: new Date()
      }
    }
  });

  if (!otp) {
    throw new AppError('Mã OTP không hợp lệ hoặc đã hết hạn', 400);
  }

  // Cập nhật trạng thái user và đánh dấu OTP đã dùng
  await user.update({ status: 'ACTIVE' });
  await otp.update({ isUsed: true });

  return {
    message: 'Kích hoạt tài khoản thành công. Bây giờ bạn có thể đăng nhập.'
  };
};


export const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user)
    throw new AppError('Email không tồn tại trong hệ thống', 404);

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.create({
    otpCode,
    type: 'FORGOT_PASSWORD',
    userId: user.id,
    expiresAt
  });

  // Gửi email OTP
  try {
    await sendForgotPasswordEmail(email, otpCode);
  } catch (error) {
    console.error('Lỗi gửi mail OTP quên mật khẩu:', error);
    throw new AppError('Lỗi gửi email OTP, vui lòng thử lại sau', 500);
  }

  return {
    message: 'Mã OTP đã được gửi về email của bạn. Vui lòng kiểm tra.'
  };
};

export const resetPassword = async (data) => {
  const { email, otpCode, newPassword } = data;

  const user = await User.findOne({ where: { email } });
  if (!user)
    throw new AppError('Người dùng không tồn tại', 404);

  const otp = await Otp.findOne({
    where: {
      userId: user.id,
      otpCode,
      type: 'FORGOT_PASSWORD',
      isUsed: false,
      expiresAt: {
        [User.sequelize.Sequelize.Op.gt]: new Date()
      }
    }
  });

  if (!otp)
    throw new AppError('Mã OTP không hợp lệ hoặc đã hết hạn', 400);

  // Hash password mới
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  // Cập nhật mật khẩu và đánh dấu OTP đã dùng
  await user.update({ passwordHash });
  await otp.update({ isUsed: true });

  return {
    message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.'
  };
};

export const refreshToken = async (token) => {
  if (!token) {
    throw new AppError('Không tìm thấy Refresh Token, vui lòng đăng nhập lại', 401);
  }

  let decoded;
  try {
    decoded = verifyToken(token);
    if (decoded.type !== 'REFRESH') {
      throw new AppError('Token không hợp lệ', 401);
    }
  } catch (err) {
    throw new AppError('Token không hợp lệ', 401);
  }

  const payload = {
    id: decoded.id,
    role: decoded.role,
    email: decoded.email,
    username: decoded.username,
    type: 'ACCESS'
  };

  const newAccessToken = generateToken(payload, config.jwtAccessExpiresIn);

  return { accessToken: newAccessToken };
};

export const resendOtp = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError('Người dùng không tồn tại', 404);
  }

  if (user.status === 'ACTIVE') {
    throw new AppError('Tài khoản đã được kích hoạt', 400);
  }

  // Hủy các OTP cũ cùng loại
  await Otp.update({ isUsed: true }, {
    where: { userId: user.id, type: 'REGISTER', isUsed: false }
  });

  // Tạo OTP mới
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.create({
    otpCode,
    type: 'REGISTER',
    userId: user.id,
    expiresAt
  });

  // Gửi email
  await sendOtpEmail(email, otpCode);

  return { message: 'Đã gửi lại mã OTP mới' };
};

