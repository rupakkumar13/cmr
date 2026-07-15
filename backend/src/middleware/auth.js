import jwt from 'jsonwebtoken';
import User from '../modules/auth/models/User.js';
import AppError from '../utils/appError.js';

/**
 * Middleware to authenticate requests via JWT access token
 */
export const authenticate = async (req, res, next) => {
  let token;

  // 1) Get token from Authorization header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  try {
    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access-secret-key-12345');

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Grant access to protected route by attaching user to request
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access to specific user roles
 * @param {...string} roles - List of allowed roles (ADMIN, HR, SALES, MANAGER, EMPLOYEE)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};
