const connectDB = require("../DB/connections"); 
const userModels = require("../model/users"); 
const bcrypt = require("bcrypt");
const generateToken = require("../services/generateToken"); 

exports.LoginAuth = async(req, res) => {
  const {email_user, password_user} = req.body;

   const sql = `SELECT * FROM user_cermat WHERE email_user = ?`;

   connectDB.query(sql, [email_user], async (err, result) => {
      const data = result[0]; 

      if(!data){
         return res.status(401).json({
            message:"Maaf user tidak terdaftar silahkan daftar terlebih dahulu!"
         })
      }
      
     const passwordValid = await bcrypt.compare(password_user, data.password_user); 

      if(!passwordValid){
        return res.status(401).json({
          message:"Maaf email atau password salah coba lagi ya! 🥺👉👈"
        })
      } 

      const accesToken = generateToken.GenerateSecretToken(data); 
      const refreshToken = generateToken.GenerateRefreshToken(data);  

      connectDB.query( 'INSERT INTO refresh_tokens (id_user, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 8 HOUR))',
            [data.user_id, refreshToken]);

        res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3 * 60 * 60 * 1000,
       });

    res.json({user: { user_id: data.user_id, email: data.email_user }, accesToken });
   })

   
}
