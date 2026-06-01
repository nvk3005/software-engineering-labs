import bcrypt from "bcryptjs";
import validator from "validator";
import { Otp, User } from "../models/index.js";
import {
  safeUser,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/auth.js";
import { sendOtpEmail } from "../utils/email.js";
import { expiresIn30Minutes, makeOtp } from "../utils/otp.js";
import { validatePassword } from "../utils/validation.js";

export async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await user.addRefreshToken(refreshToken);
  return { accessToken, refreshToken, user: safeUser(user) };
}

export async function registerUser(payload) {
  const { name, email, password, phone, address } = payload;
  if (
    !name ||
    !validator.isEmail(String(email || "")) ||
    !validatePassword(password)
  ) {
    return {
      status: 400,
      body: { message: "Vui lòng nhập họ tên, email hợp lệ và mật khẩu đủ mạnh" },
    };
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (await User.existsByEmail(normalizedEmail)) {
    return { status: 409, body: { message: "Email đã tồn tại" } };
  }

  const user = await User.create({
    id: `u-${Date.now()}`,
    name: validator.escape(name.trim()),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10),
    phone: phone || "",
    address: address || "",
    isVerified: false,
    refreshTokens: [],
  });

  const otp = makeOtp();
  await Otp.create({
    email: user.email,
    otp,
    purpose: "activate",
    expiresAt: expiresIn30Minutes(),
  });
  await sendOtpEmail(user.email, otp, "activate");

  return {
    status: 201,
    body: {
      message: "Đăng ký thành công. Vui lòng xác minh OTP đã gửi tới email.",
      user: safeUser(user),
    },
  };
}

export async function verifyOtp({ email, otp, purpose = "activate" }) {
  const normalizedEmail = String(email || "")
    .toLowerCase()
    .trim();
  const record = await Otp.findOne({
    email: normalizedEmail,
    otp: String(otp || ""),
    purpose,
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    return { status: 400, body: { message: "OTP không hợp lệ hoặc đã hết hạn" } };
  }

  const user = await User.findByEmail(record.email);
  if (purpose === "activate" && user) await user.markVerified();
  await Otp.deleteOne({ _id: record._id });

  return {
    status: 200,
    body: { message: "Xác minh OTP thành công", user: user ? safeUser(user) : null },
  };
}

export async function loginUser({ email, password }) {
  if (!validator.isEmail(String(email || "")) || !password) {
    return { status: 400, body: { message: "Thông tin đăng nhập không hợp lệ" } };
  }

  const user = await User.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { status: 401, body: { message: "Thông tin đăng nhập không hợp lệ" } };
  }

  if (!user.isVerified) {
    return {
      status: 403,
      body: { message: "Vui lòng xác minh email trước khi đăng nhập" },
    };
  }

  return { status: 200, body: await issueTokens(user) };
}

export async function refreshUserToken(refreshToken) {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findByRefreshToken(payload.id, refreshToken);
    if (!user)
      return { status: 401, body: { message: "Refresh token không hợp lệ" } };
    return { status: 200, body: await issueTokens(user) };
  } catch {
    return { status: 401, body: { message: "Refresh token không hợp lệ" } };
  }
}

export async function sendResetOtp(email) {
  const normalizedEmail = String(email || "")
    .toLowerCase()
    .trim();
  const user = await User.findByEmail(normalizedEmail);

  if (user) {
    const otp = makeOtp();
    await Otp.create({
      email: normalizedEmail,
      otp,
      purpose: "reset",
      expiresAt: expiresIn30Minutes(),
    });
    await sendOtpEmail(normalizedEmail, otp, "reset");
  }

  return {
    status: 200,
    body: { message: "Nếu email tồn tại, OTP đặt lại mật khẩu đã được gửi." },
  };
}

export async function resetPassword({ email, otp, password }) {
  if (!validatePassword(password)) {
    return {
      status: 400,
      body: { message: "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa và chữ số" },
    };
  }

  const normalizedEmail = String(email || "")
    .toLowerCase()
    .trim();
  const record = await Otp.findOne({
    email: normalizedEmail,
    otp: String(otp || ""),
    purpose: "reset",
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    return { status: 400, body: { message: "OTP không hợp lệ hoặc đã hết hạn" } };
  }

  const user = await User.findByEmail(normalizedEmail);
  if (!user) return { status: 404, body: { message: "Không tìm thấy người dùng" } };

  await user.updatePassword(await bcrypt.hash(password, 10));
  await user.clearRefreshTokens();
  await Otp.deleteOne({ _id: record._id });

  return { status: 200, body: { message: "Đặt lại mật khẩu thành công" } };
}

export async function logoutUser(user, refreshToken) {
  await user.removeRefreshToken(refreshToken);
  return { status: 200, body: { message: "Đăng xuất thành công" } };
}
