const User = require('../Schema/AccountSchema');
const emailService = require('./emailService');
const bcrypt = require('bcryptjs');

class AuthService {
  async handleUpdateEmail(username, email) {
    const otp = emailService.generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60000);
    otpExpiry.setUTCHours(otpExpiry.getUTCHours() + 8); // Adjust to Hong Kong timezone (UTC+8)

    await User.updateOne(
      { username },
      {
        email,
        otp: { code: otp, expiry: otpExpiry }
      }
    );

    await emailService.sendOTP(email, otp);
  }

  async handleVerifyEmail(username, otp) {
    const user = await User.findOne({ username });
    if (!user || user.otp.code !== otp || user.otp.expiry < new Date()) {
      throw new Error('Invalid or expired OTP');
    }

    await User.updateOne(
      { username },
      {
        isEmailVerified: true,
        otp: { code: null, expiry: null }
      }
    );
  }

  async handleForgotPassword(username) {
    const user = await User.findOne({ username });
    if (!user || !user.email || !user.isEmailVerified) {
      throw new Error('User not found or email not verified');
    }

    const otp = emailService.generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60000);
    otpExpiry.setUTCHours(otpExpiry.getUTCHours() + 8); // Adjust to Hong Kong timezone (UTC+8)

    await User.updateOne(
      { username },
      { otp: { code: otp, expiry: otpExpiry } }
    );

    await emailService.sendOTP(user.email, otp);
  }

  async handleResetPassword(username, otp, newPassword) {
    const user = await User.findOne({ username });
    if (!user || user.otp.code !== otp || user.otp.expiry < new Date()) {
      throw new Error('Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { username },
      {
        password: hashedPassword,
        otp: { code: null, expiry: null }
      }
    );
  }

  async handleResendOTP(username) {
    const user = await User.findOne({ username });
    if (!user || !user.email) {
      throw new Error('User not found');
    }

    const otp = emailService.generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60000);
    otpExpiry.setUTCHours(otpExpiry.getUTCHours() + 8); // Adjust to Hong Kong timezone (UTC+8)

    await User.updateOne(
      { username },
      { otp: { code: otp, expiry: otpExpiry } }
    );

    await emailService.sendOTP(user.email, otp);
  }
}

module.exports = new AuthService();
