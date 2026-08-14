const connectDB = require("../DB/connections"); 

// 
const Resetpassword = (req, res) => {
    const { email_user } = req.body; 

    const sql = `SELECT * FROM user_cermat WHERE email_user = ?`;
    connectDB.query(sql, [email_user], (err, result) => {
         const data = result[0];
         if(!data){
           return res.status(401).json({
              message: " Maaf email tidak terdaftar "
           })
         }
    

         
    })
}

module.exports = {
    Resetpassword
}