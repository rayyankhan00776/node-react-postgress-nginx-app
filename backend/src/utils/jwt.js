const jwt = require('jsonwebtoken');
const config = require('../config/config');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
