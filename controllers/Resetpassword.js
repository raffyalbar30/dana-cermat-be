const connectDB = require("../DB/connections"); 
const { generateOtp, hashOtp, compareOtp } = require("../Utils/OTPGeneratecode");
const deleveryOTP = require("../DB/mailer"); 


// 
const Resetpassword = (req, res) => {
    const { email_user } = req.body; 

    const sql = `SELECT * FROM user_cermat WHERE email_user = ?`;

    connectDB.query(sql, [email_user], async (err, result) => {

      const data = result[0];

         if(!data){
           return res.status(401).json({
              message: " Maaf email tidak terdaftar "
           })
         }

        const userId = data.user_id;
        const OTP = generateOtp(); 
        const OTPhash = await hashOtp(OTP);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        try {
        if (data) {
           connectDB.query(
               `INSERT INTO password_resets (id_user, otp_hash, attempt_count, max_attempts, used_token, expires_at)
               VALUES (?, ?, 0, ?, 0, ?)`,
              [userId, OTPhash, 3, expiresAt]
           );

           await deleveryOTP.SendingOtp(email_user, OTP); 
           return res.status(201).json({
               message: "Jika email terdaftar, OTP telah dikirim ke email Anda"
           })
        }

        } catch (error) {
             return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
        }
         
    })
}



module.exports = {
    Resetpassword
}