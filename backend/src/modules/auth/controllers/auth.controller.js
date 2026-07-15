import AuthService from '../services/auth.service.js';

// Helper to set refresh token cookie
const setRefreshTokenCookie = (res, token, expiresAt) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    expires: expiresAt,
  });
};

class AuthController {
  /**
   * Register new user
   */
  async register(req, res, next) {
    try {
      const user = await AuthService.registerUser(req.body);
      
      res.status(201).json({
        status: 'success',
        message: 'Registration successful! Verification email sent.',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      const { user, accessToken, refreshToken, refreshTokenExpiresAt } = 
        await AuthService.loginUser(email, password);

      // Set Refresh Token in Cookie
      setRefreshTokenCookie(res, refreshToken, refreshTokenExpiresAt);

      res.status(200).json({
        status: 'success',
        message: 'Login successful!',
        data: {
          accessToken,
          user
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      await AuthService.revokeRefreshToken(refreshToken);

      // Clear refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none'
      });

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully!'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh Token
   */
  async refreshToken(req, res, next) {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      
      const { accessToken, refreshToken, refreshTokenExpiresAt } = 
        await AuthService.refreshAccessToken(token);

      // Set rotated Refresh Token in Cookie
      setRefreshTokenCookie(res, refreshToken, refreshTokenExpiresAt);

      res.status(200).json({
        status: 'success',
        data: { accessToken }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req, res, next) {
    try {
      const token = req.query.token || req.body.token;
      
      await AuthService.verifyEmail(token);

      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully!'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password request
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      
      await AuthService.forgotPassword(email);

      res.status(200).json({
        status: 'success',
        message: 'Password reset link sent to your email.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password execution
   */
  async resetPassword(req, res, next) {
    try {
      const token = req.query.token || req.body.token || req.params.token;
      const { password } = req.body;

      await AuthService.resetPassword(token, password);

      res.status(200).json({
        status: 'success',
        message: 'Password reset successful! Please login with your new password.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user profile
   */
  async getMe(req, res, next) {
    try {
      res.status(200).json({
        status: 'success',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
