const connectDB = require("../DB/connections"); 
const userModels = require("../model/users"); 
const bcrypt = require("bcrypt");
const generateToken = require("../services/generateToken"); 

exports.LogoutAuth = async (req, res) => {
  const token = req.cookies.refreshToken;
  
  if(token){
    const sql = 'UPDATE refresh_tokens WHERE token = ? AND revoked = FALSE AND expires_at > NOW()'
    connectDB.query(sql, [token], (err, result) => {
        return res.status(201).json({
           message:"Log out berhasil"
        })
    })
  }

  res.clearCookie('refreshToken');

}
