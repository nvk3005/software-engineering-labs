import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: config.mailHost || 'smtp.ethereal.email',
  port: config.mailPort || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.mailUser,
    pass: config.mailPass,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"MinLish" <${config.mailUser}>`,
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendOtpEmail = async (email, otp) => {
  const subject = 'Mã OTP kích hoạt tài khoản MinLish';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4CAF50; text-align: center;">Chào mừng bạn đến với MinLish!</h2>
      <p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP bên dưới để kích hoạt tài khoản của mình:</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
        ${otp}
      </div>
      <p>Mã OTP này có hiệu lực trong vòng 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
      <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 MinLish. All rights reserved.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
};
export const sendForgotPasswordEmail = async (email, otp) => {
  const subject = 'Mã OTP đặt lại mật khẩu MinLish';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2196F3; text-align: center;">Đặt lại mật khẩu MinLish</h2>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã OTP bên dưới để tiếp tục:</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
        ${otp}
      </div>
      <p>Mã OTP này có hiệu lực trong vòng 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
      <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 MinLish. All rights reserved.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
};
