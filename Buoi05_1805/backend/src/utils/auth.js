import jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_SECRET || "dev-access-secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

export const signAccessToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, accessSecret, {
    expiresIn: "15m",
  });

export const signRefreshToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, refreshSecret, {
    expiresIn: "7d",
  });

export const verifyAccessToken = (token) => jwt.verify(token, accessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, refreshSecret);

export const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  address: user.address || "",
  isVerified: Boolean(user.isVerified),
});
