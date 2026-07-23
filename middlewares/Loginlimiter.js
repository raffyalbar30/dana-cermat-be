const { default: rateLimit } = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Terlalu banyak percobaan login, coba lagi nanti' },
});


module.exports = {
    loginLimiter
}