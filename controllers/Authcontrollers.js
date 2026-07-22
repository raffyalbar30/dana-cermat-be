const connectDB = require("../DB/connections"); 
const userModels = require("../model/users"); 
const bcrypt = require("bcrypt");
const generateToken = require("../services/generateToken"); 

// -------------------------------------//
     //   Authentications Login  //
// -------------------------------------//

// 1. bikin bodyresponse untuk menampung emai, password yang dikirim front end
// 2. check email dengan query select sql, dan validasi
// 3. jika email ada maka password di compare jadi bcrypt format lalu disimpan 
//    didatabase 
// 4. Email user diconvert menjadi jwt token untuk session user
// 5. jika tidak maka send response 401 json filed 

exports.LoginAuth = async(req, res) => {
  const {email_user, password_user} = req.body;

   const sql = `SELECT * FROM user_cermat WHERE email_user ='${email_user}'`;

   connectDB.query(sql, async (err, result) => {
      const data = result[0]; 

      if(!data){
         return res.status(403).json({
            message:"Maaf user tidak terdaftar silahkan daftar terlebih dahulu!"
         })
      }
      

      const passwordValid = await bcrypt.compare(password_user, data.password_user); 

      if(!passwordValid){
        return res.status(403).json({
          message:"Maaf email atau password salah!"
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
        maxAge: 8 * 60 * 60 * 1000,
       });

    res.json({user: { user_id: data.user_id, email: data.email_user }, accesToken });
   })

   
}


// -------------------------------------//
     //   Authentications Register //
// -------------------------------------//

// 1. bikin bodyresponse untuk menampung email, password yang dikirim front end
// 2. hash password dengan bycrypt untuk keaman user lalu simpan di database 
// 3. bikin validasi jika email user lebih dari satu maka terdaftar tampilkan response 403
//    untuk email yang terdaftar
// 4. jika tidak maka email dan password disimpan ke database dan user berhasil register 


exports.RegisterAuth = async (req, res) => {
  const {email_user, password_user} = req.body; 
  const sql = `SELECT 1 FROM user_cermat WHERE email_user = '${email_user}' LIMIT 1;`;
  const hashedPassword = await bcrypt.hash(password_user, 10); 
  
  connectDB.query(sql, (err, result) => {
      if (result.length > 0){
        return res.status(403).json({
          message: "Maaf Registerasi gagal, email sudah terdaftar silahkan gunakan email baru / Login ke email yang sudah ada!!",
          data: {
            email_user
          }
        });
      } else {
          userModels.userRegisterAuth(email_user, hashedPassword);
          return res.status(201).json({
            message: "Akun sudah terRegisterasi silahkan Login !!", 
            data: {
              email_user
            }
          })
      }

    if (err) {
      return res.status(500).json({
        message: "Gagal ngecek ke database",
        error: err.message
      });
    }

  
  });
};