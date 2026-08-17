const connectDB = require("../DB/connections"); 
const { generateOtp, hashOtp, compareOtp } = require("../Utils/OTPGeneratecode");
const deleveryOTP = require("../DB/mailer"); 
const { GenerateResetToken } = require("../services/generateToken");


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

const verifyOTP = (req, res) => {
     const { email_user, OTP } = req.body; 
     const sql = `SELECT user_id FROM user_cermat WHERE email_user = ?`;
     if(!email_user && !OTP) {
         return res.status(401).json({
            message: "Maaf email & OTP harus ada"
         })
     }
     
     connectDB.query(sql, [email_user], (err, result) => {
           const data = result[0]; 
           const userId = result[0].user_id;
       
           if (data) {
              connectDB.query( `SELECT * FROM password_resets WHERE id_user = ? AND used_token = 0
                ORDER BY created_at DESC LIMIT 1`,
                [userId], async (eror, resultv2) => {
                    const VerifyOTP = resultv2[0];
                    const validateOTP = compareOtp(OTP, VerifyOTP.otp_hash);

                    if(!resultv2){
                      return res.status(400).json({ message: 'OTP tidak ditemukan, silakan minta OTP baru' });
                    }
                     
                    try {
                     if (validateOTP) {
                        const Resetpassword = GenerateResetToken(VerifyOTP); 
                        return res.status(201).json({
                            user: {
                                  Resetpassword
                            }
                        })
                    }
                    } catch (error) {
                        return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
                    }

                    
                     if (!validateOTP) {
                        await connectDB.query(
                            'UPDATE password_resets SET attempt_count = attempt_count + 1 WHERE id_resetpassword = ?',
                            [VerifyOTP.id_resetpassword]
                        );
                        return res.status(400).json({ message: 'OTP yang kamu masukan salah' });
                    }
                    
                    
                    if (VerifyOTP.attempt_count >= VerifyOTP.max_attempts) {
                    return res.status(429).json({ message: 'Terlalu banyak percobaan, silakan minta OTP baru' });
                    }

                    if (new Date() > new Date(VerifyOTP.expires_at)) {
                    return res.status(400).json({ message: 'OTP sudah kedaluwarsa, silakan minta OTP baru' });
                    }
                })
           }

           if (!data) {
              return res.status(400).json({ message: 'Email tidak ditemukan !!' });
           }
     })

}

module.exports = {
    Resetpassword, 
    verifyOTP
}