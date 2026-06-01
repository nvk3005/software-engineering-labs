import {
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
  resetPassword,
  sendResetOtp,
  verifyOtp,
} from "../services/authService.js";

const send = (res, result) => res.status(result.status).json(result.body);

export async function register(req, res) {
  send(res, await registerUser(req.body));
}

export async function verifyAccountOtp(req, res) {
  send(res, await verifyOtp(req.body));
}

export async function login(req, res) {
  send(res, await loginUser(req.body));
}

export async function refreshToken(req, res) {
  send(res, await refreshUserToken(req.body.refreshToken));
}

export async function forgotPassword(req, res) {
  send(res, await sendResetOtp(req.body.email));
}

export async function resetUserPassword(req, res) {
  send(res, await resetPassword(req.body));
}

export async function logout(req, res) {
  send(res, await logoutUser(req.user, req.body.refreshToken));
}
