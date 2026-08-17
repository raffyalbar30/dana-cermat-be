const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Generate OTP 6 digit menggunakan crypto (bukan Math.random)
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOtp(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

async function compareOtp(otpInput, otpHash) {
  return await bcrypt.compare(otpInput, otpHash);
}

module.exports = { generateOtp, hashOtp, compareOtp };