import nodemailer from "nodemailer";

export async function sendOtpEmail(to, otp, purpose) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  const subject =
    purpose === "reset"
      ? "LuxeWatch password reset OTP"
      : "LuxeWatch account activation OTP";
  const text = `Your LuxeWatch OTP is ${otp}. It expires in 30 minutes.`;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log(`[LuxeWatch OTP] to=${to} purpose=${purpose} otp=${otp}`);
    return { mocked: true };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter.sendMail({
    from: SMTP_FROM || "LuxeWatch <no-reply@luxewatch.local>",
    to,
    subject,
    text,
  });
}
