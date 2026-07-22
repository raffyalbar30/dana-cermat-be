const connectDB = require("../DB/connections");
const { verifyRefreshToken, GenerateSecretToken } = require("../services/generateToken");


const AuthRefreshToken = async (req, res) => {
   const token = req.cookies.refreshToken;

   if(!token) {
      res.status(403).json({
         message:"Token tidak ada!!"
      })
   }

   try {
      const decoded = verifyRefreshToken(token);
      console.log(decoded);

      const sql = 'SELECT * FROM refresh_tokens WHERE token = ? AND revoked = FALSE AND expires_at > NOW()'
      connectDB.query(sql, [token], (err, result) => {
       if (!result) {
            return res.status(403).json({ message: 'Refresh token tidak valid' });
        }

        const data = result[0].id_refresh; 
       //   rotate token yang tidak valid menjadi token baru
        const sql = 'UPDATE refresh_tokens SET revoked = TRUE WHERE id_refresh = ?'; 
        connectDB.query(sql,[data],(err, result) => {
           return res.status(201).json({
              message: "sorry token udah diganti"
           })
        })
      }); 

   
      const data2 = decoded.user_id;
      const sql2 = 'SELECT * FROM user_cermat WHERE user_id = ?'; 
      connectDB.query(sql2, [data2], (req, result) => {
         console.log(result);
      })

   } catch (error) {
      console.log(error);
   }

}

module.exports = {
    AuthRefreshToken
}