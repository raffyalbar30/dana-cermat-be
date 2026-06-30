const connectDB = require("../DB/connections"); 
const userModels = require("../model/users");

exports.typeBudgetCategories = (req, res) => {
    
   const sql = `SELECT categories_id, name_categories FROM categories WHERE type_categories = 'Expanses'`;
    connectDB.query(sql, (err, result) => {
        if (result) {
            return res.status(201).json({
                data: result
            })
        } 

        if (err) {
            return res.status(404).json({
                message: "data kamu eror"
            })
        }

    })
}

exports.AddBudgets = (req, res) => {
    const userid = req.user.id;
    const {category, amount, periode, startdate} = req.body; 

    const startDate = new Date(startdate);

    let endDate = new Date(startDate);
    
    switch (periode) {
        case "three day":
           endDate.setDate(endDate.getDate() + 2);
            break;
        case "weekly":
           endDate.setDate(endDate.getDate() + 6);
            break;
        case "monthly":
           endDate = new Date(startDate.getFullYear(),startDate.getMonth() + 1,0);
            break;
        case "yearly":
           endDate = new Date(startDate.getFullYear(),11,31);
            break;
        default:
          return res.status(404).json({
                message: "Periode tidak valid."
            });

            break;
    }
  
    const addBudgets = userModels.addBudgets(userid, category, amount, periode, startdate, endDate); 

    if(addBudgets){
        return res.status(201).json({
            user_id: userid, 
            categories: category,  
            amount: amount, 
            priode: periode, 
            startDate: startdate, 
            endDate: endDate, 
            message: "budgeting telah ditambahkan"
        })
    } else {
        return res.status(404).json({
            error: Error,
            message: "gagal menambahkan budgeting"
        })
    }
}