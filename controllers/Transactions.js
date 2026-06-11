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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5; 
    const start = (page - 1 ) * limit; 
    const end = start + limit; 


    const sql = `SELECT 
     transactions.id_transaction, user_cermat.email_user, categories.name_categories, categories.type_categories, 
     transactions.amount, transactions.descriptions, transactions.created_at FROM transactions JOIN user_cermat ON 
     transactions.id_user = user_cermat.user_id JOIN categories ON transactions.id_categories = categories.categories_id
     WHERE user_cermat.user_id = ${tokenUser}`;

    connectDB.query(sql, (err, result) => {
         if(result) {
            const dataLength = result.length;
            const endPages = Math.ceil(result.length / limit);
            const dataResults = result.slice(start, end);

            try {

            if( page > endPages) { 
                return res.status(404).json({
                    success: false,
                    message: "Maaf page sudah habis",
                    endPage: endPages
                })
            }  else {
              return res.status(201).json({
                   data: dataResults, 
                   paginations: {
                       pages : page,
                       perPage: limit, 
                       totalData: dataLength, 
                       endPage: endPages
                   }
                   
              })
            }

            } catch (error) {
                 return res.status(404).json({
                   data: "maaf data eror"
                   
              })
            }}
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


exports.RenameTranscations = (req, res) => {
   const { amount, descriptions, id_categories, date, idtransaction, } = req.body; 
   const convertDate = date ? `${new Date(date).getFullYear()}-${String(new Date(date).getMonth() + 1)
                        .padStart(2, "0")}-${String(new Date(date).getDate()).padStart(2, "0")}`: "";

   const execute = userModels.renametransactions(amount, descriptions, id_categories, convertDate, idtransaction); 

   if(execute) {
     return res.status(201).json({
        idtransaction: idtransaction,
        id_categories: id_categories, 
        amount : amount, 
        date : convertDate, 
        descriptions: descriptions,
        message: "transaksi telah berhasil diupdate!"
     })
   } else { 
       return res.status(404).json({
        message: "transaksi gagal diupdate!",
        error: err.message
     })
   }
}

exports.DellateTranscations = (req, res ) => {
    const { idtransactions } = req.body; 
    const execute = userModels.dellatetransacions(idtransactions); 

    if (execute) {
        return res.status(201).json({
           message: `transaksi dengan id ${idtransactions} telah berhasil dihapus`,
        }) 
    } else { 
        return res.status(404).json({
            Error : Error,
            message: "transaksi gagal dihapus",
        })
    }
}

