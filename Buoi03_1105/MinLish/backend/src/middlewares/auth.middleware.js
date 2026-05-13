import AppError from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';

export const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Vui lòng đăng nhập để truy cập', 401));
  }

  try {
    const decoded = verifyToken(token);
    
    if (decoded.type !== 'ACCESS') {
      return next(new AppError('Token không hợp lệ', 401));
    }

    req.user = decoded; // { id, role, ... }
    next();
  } catch (error) {
    return next(new AppError('Token không hợp lệ hoặc đã hết hạn', 401));
  }
};
