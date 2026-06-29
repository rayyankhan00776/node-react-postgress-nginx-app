const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');

class UserService {
  async updateProfile(userId, name, email) {
    // Check if email is in use by another user
    const emailCheck = await db.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    );
    if (emailCheck.rows.length > 0) {
      throw new ConflictError('This email address is already in use.');
    }

    // Update profile
    const updatedUser = await db.query(
      `UPDATE users 
       SET name = $1, email = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING id, name, email, avatar, created_at`,
      [name, email, userId]
    );

    if (updatedUser.rows.length === 0) {
      throw new NotFoundError('User not found.');
    }

    return updatedUser.rows[0];
  }

  async changePassword(userId, oldPassword, newPassword) {
    // Get current password
    const userRes = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      throw new NotFoundError('User not found.');
    }

    const currentHashedPassword = userRes.rows[0].password;

    // Verify current password
    const isPasswordValid = await bcrypt.compare(oldPassword, currentHashedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect.');
    }

    // Hash new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [newHashedPassword, userId]
    );

    return true;
  }

  async uploadAvatar(userId, avatarFilename) {
    // Update avatar field
    const updatedUser = await db.query(
      `UPDATE users 
       SET avatar = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, name, email, avatar, created_at`,
      [avatarFilename, userId]
    );

    if (updatedUser.rows.length === 0) {
      throw new NotFoundError('User not found.');
    }

    return updatedUser.rows[0];
  }

  async deleteAccount(userId) {
    const deleteRes = await db.query('DELETE FROM users WHERE id = $1', [userId]);
    if (deleteRes.rowCount === 0) {
      throw new NotFoundError('User not found.');
    }
    return true;
  }
}

module.exports = new UserService();
