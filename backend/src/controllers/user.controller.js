const UserService = require('../services/user.service');
const { BadRequestError } = require('../utils/errors');

class UserController {
  async getProfile(req, res, next) {
    try {
      // req.user has been set by the auth middleware
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

  async updateProfile(req, res, next) {
    try {
      const { name, email } = req.body;
      const user = await UserService.updateProfile(req.user.id, name, email);

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully!',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      await UserService.changePassword(req.user.id, oldPassword, newPassword);

      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully!'
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        throw new BadRequestError('Please provide an avatar image file.');
      }

      // Store file name relative to frontend accessibility
      const user = await UserService.uploadAvatar(req.user.id, req.file.filename);

      res.status(200).json({
        status: 'success',
        message: 'Avatar uploaded successfully!',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      await UserService.deleteAccount(req.user.id);

      res.status(200).json({
        status: 'success',
        message: 'Account deleted successfully!'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
