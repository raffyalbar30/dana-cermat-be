const connectDB = require("../DB/connections"); 
const userModels = require("../model/users"); 
const bcrypt = require("bcrypt");
const generateToken = require("../services/generateToken"); 

exports.RegisterAuth = async (req, res) => {
  const {email_user, password_user, confirm_password} = req.body; 
  const sql = `SELECT 1 FROM user_cermat WHERE email_user = ? LIMIT 1;`;
  const hashedPassword = await bcrypt.hash(password_user, 10); 
  
  connectDB.query(sql, [email_user], (err, result) => {
      if(password_user !== confirm_password){
          return res.status(401).json({
              message:"Password harus sama dengan confirm password! 😶🤙"
          })
      }

      if (result.length > 0){
        return res.status(401).json({
          message: "Maaf gagal email sudah terdaftar silahkan login 😶🙏!",
        });
      } else {
          userModels.userRegisterAuth(email_user, hashedPassword);
          return res.status(201).json({
            message: "Registrasi berhasil silahkan login 😁👍!!", 
          })
      }

    if (err) {
      return res.status(500).json({
        message: "Gagal tidak ada akun",
        error: err.message
      });
    }

  
  });
};