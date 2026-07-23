const connectDB = require("../DB/connections");
const { verifyRefreshToken, GenerateSecretToken, GenerateRefreshToken } = require("../services/generateToken");


const AuthRefreshToken = async (req, res) => {
   const token = req.cookies.refreshToken;

   if(!token) {
      res.status(403).json({
         message:"Token tidak ada!!"
      })
   }

   try {
      const decoded = verifyRefreshToken(token);

      const sql = 'SELECT * FROM refresh_tokens WHERE token = ? AND revoked = FALSE AND expires_at > NOW()'
      connectDB.query(sql, [token], (err, result) => {
       if (!result) {
            return res.status(403).json({ message: 'Refresh token tidak valid' });
        }

        const data = result[0].id_refresh; 
       //   rotate token yang tidak valid menjadi token baru
        const sql = 'UPDATE refresh_tokens SET revoked = TRUE WHERE id_refresh = ?'; 
        connectDB.query(sql,[data])

      }); 

      const sql2 = 'SELECT * FROM user_cermat WHERE user_id = ?'; 
      const data2 = decoded.user_id;
      
      connectDB.query(sql2, [data2], (req, result) => {

         const results = result[0];
         const accesToken = GenerateSecretToken(results); 
         const refreshToken = GenerateRefreshToken(results); 

         connectDB.query( 'INSERT INTO refresh_tokens (id_user, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 8 HOUR))',
                [results.user_id, refreshToken]);

         res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000,
         });

         res.status(201).json({user: { user_id: results.user_id, email: results.email_user }, accesToken });
      })



   } catch (error) {
      console.log(error);
   }
}

module.exports = {
    AuthRefreshToken
}