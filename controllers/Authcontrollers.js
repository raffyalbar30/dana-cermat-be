const connectDB = require("../DB/connections"); 
const userModels = require("../model/users"); 
const jwt = require("jsonwebtoken"); 
const bcrypt = require("bcrypt");

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
   const sql =`SELECT * FROM user_cermat WHERE email_user = '${email_user}'`;

   connectDB.query(sql, async (err, result) => {
     if (result.length > 0) {
        for (let index = 0; index < result.length; index++) {
          const passwordDecode = await bcrypt.compare( password_user, result[index].password_user);

            if (passwordDecode) {
               const user = {
                id: result[index].user_id, 
                email: result[index].email_user
              }
               
              const token = jwt.sign(user, "SECRET_KEY", {expiresIn: "3h",})
              res.status(201).json({
                  AuthToken : token,
                  message : "Login berhasil"
                })

            } else {
               res.status(401).json({
                 message: "Maaf password salah"
               })
            }
        }
     } else {
        res.status(403).json({
          message: "Maaf user tidak ada silahkan registerasi dahulu!"
        })
     }
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