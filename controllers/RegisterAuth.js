const connectDB = require("../DB/connections"); 
const userModels = require("../model/users"); 
const bcrypt = require("bcrypt");
const generateToken = require("../services/generateToken"); 

exports.RegisterAuth = async (req, res) => {
  const {email_user, password_user} = req.body; 
  const sql = `SELECT 1 FROM user_cermat WHERE email_user = '${email_user}' LIMIT 1;`;
  const hashedPassword = await bcrypt.hash(password_user, 10); 
  
  connectDB.query(sql, (err, result) => {
      if (result.length > 0){
        return res.status(403).json({
          message: "Maaf Registerasi gagal, email sudah terdaftar silahkan gunakan email baru / Login ke email yang sudah ada!!",
          data: {
            email_user
          }
        });
      } else {
          userModels.userRegisterAuth(email_user, hashedPassword);
          return res.status(201).json({
            message: "Akun sudah terRegisterasi silahkan Login !!", 
            data: {
              email_user
            }
          })
      }

    if (err) {
      return res.status(500).json({
        message: "Gagal ngecek ke database",
        error: err.message
      });
    }

  
  });
};