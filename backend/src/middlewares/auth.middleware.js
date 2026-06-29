const { verifyAccessToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../utils/errors');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is missing or malformed.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Access token is empty.');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded; // Store decoded user object containing id, email, name
    next();
  } catch (error) {
    next(new UnauthorizedError(error.message || 'Token verification failed.'));
  }
};
