const nodemailer = require("nodemailer"); 

const smtpConnections = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
}); 

const SendingOtp = async (Email, Otp) => {
  await smtpConnections.sendMail({
    from: `"Dana-Cermat" <${process.env.SMTP_USER}>`,
    to: Email,
    subject: 'Kode OTP Reset Password',
    html: `
      <p>Kode OTP Anda adalah:</p>
      <h2>${Otp}</h2>
      <p>Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.</p>
    `,
  });
}

module.exports = { SendingOtp };