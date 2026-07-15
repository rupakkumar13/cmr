import SettingsService from '../services/settings.service.js';

class SettingsController {
  async getCompany(req, res, next) {
    try {
      const settings = await SettingsService.getCompanySettings();
      res.status(200).json({
        status: 'success',
        data: { settings }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCompany(req, res, next) {
    try {
      const settings = await SettingsService.updateCompanySettings(req.body);
      res.status(200).json({
        status: 'success',
        message: 'Company settings updated successfully',
        data: { settings }
      });
    } catch (error) {
      next(error);
    }
  }

  async getPreferences(req, res, next) {
    try {
      const preferences = await SettingsService.getSystemPreferences();
      res.status(200).json({
        status: 'success',
        data: { preferences }
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const preferences = await SettingsService.updateSystemPreferences(req.body);
      res.status(200).json({
        status: 'success',
        message: 'System preferences updated successfully',
        data: { preferences }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await SettingsService.updateUserProfile(req.user.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Profile details updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await SettingsService.changeUserPassword(req.user.id, currentPassword, newPassword);
      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SettingsController();
