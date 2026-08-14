const rateLimit = require('express-rate-limit');

// Maksimal 3 request OTP per 15 menit per IP
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    message: 'Terlalu banyak permintaan OTP. Coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { forgotPasswordLimiter };