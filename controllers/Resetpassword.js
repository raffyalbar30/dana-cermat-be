const connectDB = require("../DB/connections"); 
const { generateOtp, hashOtp, compareOtp } = require("../Utils/OTPGeneratecode");
const deleveryOTP = require("../DB/mailer"); 
const { GenerateResetToken, verifyResetpasword } = require("../services/generateToken");


// sending OTP
const SendOTP = (req, res) => {
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
        if (err) {
            return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
        }

        const data = result[0];

        if (!data) {
            return res.status(400).json({ message: 'Email tidak ditemukan !!' });
        }

        const userId = data.user_id;

        connectDB.query(
            `SELECT * FROM password_resets WHERE id_user = ? AND used_token = 0
             ORDER BY created_at DESC LIMIT 1`,
            [userId],
            async (eror, resultv2) => {
                if (eror) {
                    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
                }

                const VerifyOTP = resultv2[0];

                if (!VerifyOTP) {
                    return res.status(400).json({ message: 'OTP tidak ditemukan, silakan minta OTP baru' });
                }

                // cek expired & attempt limit DULU, sebelum validasi OTP
                if (VerifyOTP.attempt_count >= VerifyOTP.max_attempts) {
                    return res.status(429).json({ message: 'Terlalu banyak percobaan, silakan tunggu dan coba lagi' });
                }

                if (new Date() > new Date(VerifyOTP.expires_at)) {
                    return res.status(400).json({ message: 'OTP sudah kedaluwarsa, silakan minta OTP baru' });
                }

                try {
                    const validateOTP = await compareOtp(String(OTP), VerifyOTP.otp_hash);

                    if (!validateOTP) {
                        await connectDB.promise().query(
                            'UPDATE password_resets SET attempt_count = attempt_count + 1 WHERE id_resetpassword = ?',
                            [VerifyOTP.id_resetpassword]
                        );
                        return res.status(400).json({ message: 'OTP yang kamu sudah dipakai, silahkan kirim ulang' });
                    }

                    await connectDB.promise().query(
                        'UPDATE password_resets SET used_token = 1 WHERE id_resetpassword = ?',
                        [VerifyOTP.id_resetpassword]
                    );

                    const Resetpassword = GenerateResetToken(VerifyOTP);

                    return res.status(201).json({
                        message: "OTP berhasil diverifikasi",
                        user: { Resetpassword }
                    });

                } catch (error) {
                    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
                }
            }
        );
    });
};

// new password
const ResetPassword = (req, res) => {
    const { token, newpassword } = req.body;

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
        payload = verifyResetpasword(token);
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
            if (err) {
                return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
            }

            const resetRow = result[0];

            if (!resetRow) {
                return res.status(400).json({ message: 'Sesi reset password tidak ditemukan' });
            }

            if (resetRow.token_used_for_reset) {
                return res.status(400).json({ message: 'Token reset ini sudah pernah dipakai' });
            }

            try {
                const hashedPassword = await bcrypt.hash(newpassword, 10);

                await connectDB.promise().query(
                    'UPDATE user_cermat SET password = ? WHERE user_id = ?',
                    [hashedPassword, user_id]
                );

                await connectDB.promise().query(
                    'UPDATE password_resets SET token_used_for_reset = 1 WHERE id_resetpassword = ?',
                    [id_resetpassword]
                );

                return res.status(200).json({ message: 'Password berhasil diubah, silakan login dengan password baru' });

            } catch (error) {
                return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
            }
        }
    );
};

module.exports = {
    SendOTP, 
    verifyOTP, 
    ResetPassword
}