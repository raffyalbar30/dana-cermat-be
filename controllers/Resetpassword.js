const connectDB = require("../DB/connections"); 
const { generateOtp, hashOtp, compareOtp } = require("../Utils/OTPGeneratecode");
const deleveryOTP = require("../DB/mailer"); 
const { GenerateResetToken, verifyResetpasword } = require("../services/generateToken");
const bcrypt = require("bcrypt");


// sending OTP
const SendOTP = (req, res) => {
    const { email_user } = req.body; 

    const sql = `SELECT * FROM user_cermat WHERE email_user = ?`;

    connectDB.query(sql, [email_user], async (err, result) => {

      const data = result[0];

         if(!data){
           return res.status(401).json({
              message: " Maaf email tidak terdaftar, silahkan daftar !! "
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
               message: "Jika email terdaftar, Kode OTP telah dikirim ke email Anda!!"
           })
        }

        } catch (error) {
             return res.status(500).json({ message: 'Terjadi kesalahan silahkan coba lagi nanti' });
        }
         
    })
}

// verify OTP 
const verifyOTP = (req, res) => {
    const { email_user, OTP } = req.body;

    if (!email_user || !OTP) {
        return res.status(401).json({
            message: "Maaf email & OTP harus ada"
        });
    }

    const sql = `SELECT user_id FROM user_cermat WHERE email_user = ?`;

    connectDB.query(sql, [email_user], (err, result) => {

        const data = result[0];

        if (!data) {
            return res.status(400).json({ message: 'Maaf email tidak ditemuukan !!' });
        }

        const userId = data.user_id;

    connectDB.query(
    `SELECT * FROM password_resets WHERE id_user = ? AND used_token = 0
     ORDER BY created_at DESC LIMIT 1`,
    [userId],
    async (eror, resultv2) => {

        const VerifyOTP = resultv2[0];
        const validateOTP = await compareOtp(String(OTP), VerifyOTP.otp_hash);


        try {

            if (!validateOTP) {
                // OTP salah -> naikkan attempt_count, lalu stop di sini
                await connectDB.promise().query(
                    'UPDATE password_resets SET attempt_count = attempt_count + 1 WHERE id_resetpassword = ?',
                    [VerifyOTP.id_resetpassword]
                );

                return res.status(403).json({ message: 'Kode OTP tidak valid! silakan minta OTP baru!' });
            }

            if (new Date() > new Date(VerifyOTP.expires_at)) {
              return res.status(400).json({ message: 'Kode OTP kadaluwarsa, silakan minta Kode OTP baru!' });
            }

            
            // cek expired & attempt limit DULU, sebelum validasi OTP
            if (VerifyOTP.attempt_count >= VerifyOTP.max_attempts) {
                return res.status(429).json({ message: 'Terlalu banyak percobaan, silakan tunggu 15 menit lagi!' });
            }

            // OTP benar -> tandai token sudah dipakai
            await connectDB.promise().query(
                'UPDATE password_resets SET used_token = 1 WHERE id_resetpassword = ?',
                [VerifyOTP.id_resetpassword]
            );

            const Resetpassword = GenerateResetToken(VerifyOTP);

           return res.status(201).json({
                message: "OTP berhasil diverifikasi",
                user: {
                    Resetpassword,
                },
                date: {
                    expires_at: VerifyOTP.expires_at,
                    created_at: VerifyOTP.created_at
                }
            });

        } catch (error) {
            return res.status(500).json({ message: 'Terjadi kesalahan silakan coba lagi' });
        }
     }
   );
    });
};

// new password
const ResetPassword = (req, res) => {
    const { token, newpassword } = req.body;
    const TokenConvert = String(token);

    if (!token || !newpassword) {
        return res.status(401).json({
            message: "Password baru harus ada"
        });
    }

    if (newpassword.length < 8) {
        return res.status(400).json({ message: "Password baru minimal 8 karakter" });
    }

    let payload;
    try {
        payload = verifyResetpasword(TokenConvert);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'OTP reset password sudah kedaluwarsa, silakan minta OTP baru' });
        }
        return res.status(400).json({ message: 'Token reset tidak valid' });
    }

    const { user_id, id_resetpassword } = payload;

    connectDB.query(
        `SELECT * FROM password_resets WHERE id_resetpassword = ? AND id_user = ?`,
        [id_resetpassword, user_id],
        async (err, result) => {
    
            try {
                const hashedPassword = await bcrypt.hash(newpassword, 10);

                await connectDB.promise().query(
                    'UPDATE user_cermat SET password_user = ? WHERE user_id = ?',
                    [hashedPassword, user_id]
                );

                await connectDB.promise().query(
                    'UPDATE password_resets SET used_token = 1 WHERE id_resetpassword = ?',
                    [id_resetpassword]
                );

                return res.status(200).json({ message: 'Password berhasil diubah, silakan login dengan password baru' });

            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Terjadi kesalahan silahkan coba lagi' });
            }
        }
    );
};

module.exports = {
    SendOTP, 
    verifyOTP, 
    ResetPassword
}