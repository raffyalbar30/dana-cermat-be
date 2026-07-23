const jwt = require("jsonwebtoken"); 
const { verifyAccessToken } = require("../services/generateToken");



const VerifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ada" })
  }

   try {

    req.user = verifyAccessToken(user);
    next();

   } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid atau expired' });
   }



}

module.exports = VerifyToken;