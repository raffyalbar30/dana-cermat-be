const connectDB = require("../DB/connections"); 
const userModels = require("../model/users");

exports.typeBudgetCategories = (req, res) => {
    const data = userModels.getAllbudgets; 

    if (data.length > 0) {
        return res.status(201).json({
             nama_categories: data, 
        });
    } else {
        return res.status(404).json({
            Error : Error, 
            message: "data kamu error"
        })
    }
}