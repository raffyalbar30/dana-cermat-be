const connectDB = require("../DB/connections"); 

const userRegisterAuth = (email_user, password_user) => {
   const sql = `INSERT INTO user_cermat (email_user, password_user) VALUES ('${email_user}', '${password_user}')`;
   return connectDB.execute(sql)
}

const userLoginAuth = (email_user) => {
   const sql =`SELECT * FROM user_cermat WHERE email_user = '${email_user}'`;
   return connectDB.execute(sql);

}

const transactions = (userid, id_categories, amount, descriptions, date ) => {
 const sql = ` INSERT INTO transactions (id_user, 	id_categories, amount, descriptions, created_at) VALUES ('${userid}', '${id_categories}', '${amount}', '${descriptions}', '${date}')`;
  return connectDB.execute(sql);

}



module.exports = {
   userRegisterAuth,
   userLoginAuth, 
   transactions 
  
}