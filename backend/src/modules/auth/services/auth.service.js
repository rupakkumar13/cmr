import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Token from '../models/Token.js';
import AppError from '../../../utils/appError.js';
import sendEmail from '../../../utils/email.js';

// Helper to sign JWT tokens
const signToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

class AuthService {
  /**
   * Register a new user
   */
  async registerUser(userData) {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    // Generate email verification token (optional feature)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'EMPLOYEE',
      verificationToken,
      verificationTokenExpires,
    });

    // Send email verification link in the background
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Verify your CRM Account',
      text: `Hello ${user.name},\n\nPlease verify your account by clicking this link: ${verificationUrl}\n\nThank you!`,
      html: `<p>Hello ${user.name},</p><p>Please verify your account by clicking <a href="${verificationUrl}">here</a>.</p>`,
    });

    // Format returned user
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.verificationToken;
    delete userResponse.verificationTokenExpires;

    return userResponse;
  }

  /**
   * Authenticate a user
   */
  async loginUser(email, password) {
    // Select password explicitly since it's hidden in the schema
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken, expiresAt } = await this.generateTokens(user);

    // Format user response
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
    };
  }

  /**
   * Generate Access and Refresh tokens
   */
  async generateTokens(user) {
    const payload = { 
      id: user._id, 
      role: user.role,
      jti: crypto.randomBytes(16).toString('hex')
    };

    const accessToken = signToken(
      payload,
      process.env.JWT_ACCESS_SECRET || 'access-secret-key-12345',
      process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    );

    const refreshToken = signToken(
      payload,
      process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-12345',
      process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    );

    // Calculate refresh token expiration date (default 7 days)
    // 7d = 7 * 24 * 60 * 60 * 1000
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Save refresh token to database
    await Token.create({
      userId: user._id,
      token: refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken, expiresAt };
  }

  /**
   * Refresh the Access Token (using token rotation)
   */
  async refreshAccessToken(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw new AppError('Refresh token is required', 401);
    }

    // Verify token validity
    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-12345');
    } catch (err) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Check if refresh token exists in DB
    const existingToken = await Token.findOne({ token: oldRefreshToken });

    if (!existingToken) {
      // SECURITY: Token reuse detected! Invalidate all tokens for this user.
      await Token.deleteMany({ userId: decoded.id });
      throw new AppError('Token reuse detected! All sessions revoked. Please log in again.', 403);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Delete the old token
    await Token.deleteOne({ _id: existingToken._id });

    // Generate new token pair (Rotation)
    const { accessToken, refreshToken: newRefreshToken, expiresAt } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt: expiresAt,
    };
  }

  /**
   * Revoke refresh token (Logout)
   */
  async revokeRefreshToken(refreshToken) {
    if (refreshToken) {
      await Token.deleteOne({ token: refreshToken });
    }
  }

  /**
   * Verify email verification token
   */
  async verifyEmail(token) {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Verification token is invalid or has expired', 400);
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return user;
  }

  /**
   * Initiate Forgot Password flow
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('No user registered with this email', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and store in user model
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      text: `Forgot your password? Please use this link to reset it: ${resetUrl}\nIf you did not request this, please ignore this email.`,
      html: `<p>Forgot your password?</p><p>Please click <a href="${resetUrl}">here</a> to reset it.</p><p>If you did not request this, ignore this email.</p>`,
    });

    return resetToken;
  }

  /**
   * Execute Password Reset
   */
  async resetPassword(token, password) {
    // Hash the token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Reset token is invalid or has expired', 400);
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Revoke all existing sessions/tokens since credentials changed
    await Token.deleteMany({ userId: user._id });

    return user;
  }
}

export default new AuthService();
