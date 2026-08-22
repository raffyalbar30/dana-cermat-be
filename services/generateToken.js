const jwt = require("jsonwebtoken"); 

// buat bikin acces secret token 
const GenerateSecretToken = (data) => {
    return jwt.sign(
       { 
        user_id: data.user_id, 
        email: data.email
       }, 
       process.env.ACCESS_TOKEN_SECRET,
       { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
}

// buat bikin refresh token 
const GenerateRefreshToken = (data) => {
    return jwt.sign(
        { user_id: data.user_id }, 
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}

// buat bikin reset token 
const GenerateResetToken = (data) => {
    return jwt.sign(
        { 
            user_id: data.id_user, 
            id_resetpassword: data.id_resetpassword
        }, 
        process.env.RESET_TOKEN_SECRET,
        { expiresIn: process.env.RESET_TOKEN_EXPIRES }
    )
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

function verifyResetpasword(token){
   return jwt.verify(token, process.env.RESET_TOKEN_SECRET); 
}

module.exports = {
    GenerateSecretToken, 
    GenerateRefreshToken, 
    GenerateResetToken,
    verifyAccessToken, 
    verifyRefreshToken, 
    verifyResetpasword
    
}