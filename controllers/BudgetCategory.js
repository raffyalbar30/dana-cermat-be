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
    const {category, amount, periode, startdate, enddate} = req.body;
    const convertDate = startdate ? `${new Date(startdate).getFullYear()}-${String(new Date(startdate).getMonth() + 1)
                        .padStart(2, "0")}-${String(new Date(startdate).getDate()).padStart(2, "0")}`: "";

    switch (convertDate) {
        case periode === "three day":
           convertDate.setDate(convertDate.getDate() + 2);
            break;
        case periode === "weekly":
           convertDate.setDate(convertDate.getDate() + 6); 
            break;
        case periode === "monthly":
           convertDate = new Date(convertDate.getFullYear(), convertDate.getMonth() + 1, 0);
            break;
        case periode === "yearly":
           convertDate = new Date( convertDate.getFullYear(),11,31);
            break;
        default:
            break;
    }
    const addBudgets = userModels.addBudgets(); 
}