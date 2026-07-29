const connectDB = require("../DB/connections"); 
const userModels = require("../model/users"); 
const bcrypt = require("bcrypt");
const generateToken = require("../services/generateToken"); 

exports.RegisterAuth = async (req, res) => {
  const {email_user, password_user} = req.body; 
  const sql = `SELECT 1 FROM user_cermat WHERE email_user = ? LIMIT 1;`;
  const hashedPassword = await bcrypt.hash(password_user, 10); 
  
  connectDB.query(sql, [email_user], (err, result) => {
      if (result.length > 0){
        return res.status(403).json({
          message: "Maaf gagal membuat akun karena akun telah terdaftar silahkan login!",
        });
      } else {
          userModels.userRegisterAuth(email_user, hashedPassword);
          return res.status(201).json({
            message: "Akun sudah terRegisterasi silahkan Login !!", 
          })
      }

    if (err) {
      return res.status(500).json({
        message: "Gagal tidak ada akun di database",
        error: err.message
      });
    }

  
  });
};