const connectDB = require("../DB/connections"); 


const userRegisterAuth = (email_user, password_user) => {
   const sql = `INSERT INTO user_cermat (email_user, password_user) VALUES ('${email_user}', '${password_user}')`;
   return connectDB.execute(sql)
}



const transactions = (userid, id_categories, amount, descriptions, date ) => {
 const sql = ` INSERT INTO transactions (id_user, 	id_categories, amount, descriptions, created_at) VALUES ('${userid}', '${id_categories}', '${amount}', '${descriptions}', '${date}')`;
 return connectDB.execute(sql);
}

const renametransactions = (amount, descriptions, id_categories, date, idtransaction ) => {
    const sql = `UPDATE transactions
    SET
    amount = ${amount},
    descriptions = '${descriptions}',
    id_categories = ${id_categories},
    created_at = '${date}'
    WHERE id_transaction = ${idtransaction}`;

    return connectDB.execute(sql); 
}


const dellatetransacions = (idtransaction) => {
   const sql = `DELETE FROM transactions WHERE id_transaction = ${idtransaction}`; 
   return connectDB.execute(sql);
}

const addBudgets = (user, category, amount, periode, startdate, enddate) => {   
   const sql = `INSERT INTO budgets (
      budget_user,
      budget_category,
      budget_amount,
      period,
      start_date,
      end_date
   )
   VALUES (
      ${user},              
      ${category},              
      ${amount},      
      '${periode}',      
      '${startdate}',   
      '${enddate}'    
   )`;

   return connectDB.execute(sql);
}

const dellatebudgets = (idbudgets) => { 
   const sql = `DELETE FROM budgets WHERE id_budgets   = ${idbudgets}`;
   return connectDB.execute(sql); 
}

const updatebudgets = (idcategory, amount, period, startdate, enddate, idbudgets ) => {
   const sql = `UPDATE budgets SET
    budget_category = ${idcategory},
    budget_amount = ${amount},
    period = '${period}',
    start_date = '${startdate}', 
    end_date = '${enddate}'
    WHERE id_budgets = ${idbudgets}`;
    
   return connectDB.execute(sql);
}

module.exports = {
   userRegisterAuth,
   transactions, 
   renametransactions, 
   dellatetransacions,
   addBudgets, 
   dellatebudgets, 
   updatebudgets
}