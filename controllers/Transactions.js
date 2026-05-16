const connectDB = require("../DB/connections"); 
const userModels = require("../model/users");


exports.Transactions = (req, res) => {
const {id_categories, amount, descriptions, date} = req.body;
const userid = req.user.id;

const execute = userModels.transactions(userid, id_categories, amount, descriptions, date) 
 if (execute) {
     return res.status(201).json({
        message: "data sudah ditambahkan", 
        amount : amount, 
        descriptions : descriptions, 
        date : date
     })
 } else {
     return res.status(401).json({
            message: "maaf data gagal ditambahkan"
        })
 }

}

exports.getAllTranscations = (req, res) => {
    const tokenUser  = req.user.id; 

    const sql = `SELECT 
     transactions.id_transaction, user_cermat.email_user, categories.name_categories, categories.type_categories, 
     transactions.amount, transactions.descriptions, transactions.created_at FROM transactions JOIN user_cermat ON 
     transactions.id_user = user_cermat.user_id JOIN categories ON transactions.id_categories = categories.categories_id
     WHERE user_cermat.user_id = ${tokenUser}`;

     console.log(tokenUser)

    connectDB.query(sql, (err, result) => {
         if(result) {
             return res.status(201).json({
                data: result
             })

            } else { 
                return res.status(401).json({
                    message: " Maaf data tidak ada"
                })
            }
    })
}

exports.TypeCategories = ( req, res) => {
   const { type_categories } = req.query; 
   const sql = `SELECT * FROM categories WHERE type_categories = '${type_categories}'`;
   connectDB.query(sql, (err, result) => {
       if(result) {
        return res.status(201).json({
            data: result
        })
       }

       if(err) {
         return res.status(500).json({
            message: "maaf data tidak ada", 
            error: err.message
         })
       }
   })
}