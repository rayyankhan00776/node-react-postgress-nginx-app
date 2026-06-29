const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { ConflictError, UnauthorizedError } = require('../utils/errors');
const config = require('../config/config');

class AuthService {
  async register(name, email, password) {
    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new ConflictError('A user with this email address already exists.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to database
    const newUser = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, avatar, created_at',
      [name, email, hashedPassword]
    );

    return newUser.rows[0];
  }

  async login(email, password) {
    // Find user
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const user = userRes.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Calculate refresh token expiry date
    const refreshExpiryDays = parseInt(config.JWT_REFRESH_EXPIRES_IN) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshExpiryDays);

    // Save refresh token to database
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    // Strip password from returned user object
    delete user.password;

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  async refresh(token) {
    try {
      // 1. Verify token signature
      const decoded = verifyRefreshToken(token);
      
      // 2. Check token exists in database and is not expired
      const tokenRes = await db.query(
        'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
        [token]
      );
      
      if (tokenRes.rows.length === 0) {
        throw new UnauthorizedError('Invalid or expired refresh token.');
      }

      const storedToken = tokenRes.rows[0];

      // Get user
      const userRes = await db.query(
        'SELECT id, name, email, avatar, created_at FROM users WHERE id = $1',
        [storedToken.user_id]
      );

      if (userRes.rows.length === 0) {
        throw new UnauthorizedError('User not found.');
      }

      const user = userRes.rows[0];

      // 3. Perform Token Rotation (Revoke old and generate new ones)
      await db.query('DELETE FROM refresh_tokens WHERE id = $1', [storedToken.id]);

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      const refreshExpiryDays = parseInt(config.JWT_REFRESH_EXPIRES_IN) || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + refreshExpiryDays);

      await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, newRefreshToken, expiresAt]
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user
      };
    } catch (error) {
      // If token is invalid or expired
      throw new UnauthorizedError(error.message || 'Token refresh failed.');
    }
  }

  async logout(token) {
    // Delete token from database
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    return true;
  }
}

module.exports = new AuthService();
