const AuthService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const user = await AuthService.register(name, email, password);
      
      res.status(201).json({
        status: 'success',
        message: 'Registration successful!',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await AuthService.login(email, password);

      res.status(200).json({
        status: 'success',
        message: 'Login successful!',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const data = await AuthService.refresh(refreshToken);

      res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully!',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully!'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
