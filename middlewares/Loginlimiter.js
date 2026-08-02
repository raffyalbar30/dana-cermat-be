const { default: rateLimit } = require("express-rate-limit");

// 1 menit if user failed login 4x, this limit 1m for login
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 4,
  handler: (req, res) => {
       return res.status(429).json({
           message: 'Terlalu banyak percobaan login, coba lagi nanti 🥺🤙'
       })
  }
});


module.exports = {
    loginLimiter
}