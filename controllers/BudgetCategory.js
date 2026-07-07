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
        case "threeday":
           endDate.setDate(endDate.getDate() + 3);
            break;
        case "weekly":
           endDate.setDate(endDate.getDate() + 7);
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
    
    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    const addBudgets = userModels.addBudgets(userid, category, amount, periode, formattedStartDate, formattedEndDate); 

    if(addBudgets){
        return res.status(201).json({
            user_id: userid, 
            categories: category,  
            amount: amount, 
            priode: periode, 
            startDate: startdate, 
            endDate: formattedEndDate, 
            message: "budgeting telah ditambahkan"
        })
    } else {
        return res.status(404).json({
            error: Error,
            message: "gagal menambahkan budgeting"
        })
    }
}

// dellated budgets 
exports.getAllBudgets = async ( req, res) => {
  const tokenUser  = req.user.id;
  const sql = `SELECT
      b.id_budgets,
      u.user_id,
      u.email_user,
      c.categories_id,
      c.name_categories,
      c.type_categories,
      b.budget_amount,
      b.period,
      b.start_date,
      b.end_date,
      b.created_at
   FROM budgets b
   INNER JOIN user_cermat u
      ON b.budget_user = u.user_id
   INNER JOIN categories c
      ON b.budget_category = c.categories_id
   WHERE b.budget_user = ${tokenUser}
   ORDER BY b.created_at DESC`; 
   
   connectDB.query(sql, (err, result) => {
      if (result) {
        return res.status(201).json({
            data: result, 
            message: "memuat semua data budgeting"
        });
      } else {
        return res.status(401).json({
            Error: Error, 
            message: "gagal membuat data budgeting"
        });
      }
   })
}

// edd dellated apps
exports.DellateBudgets = (req, res ) => {
    const { idBudgets } = req.body; 
    const execute = userModels.dellatebudgets(idBudgets); 

    if (execute) {
        return res.status(201).json({
           message: `budget dengan id ${idBudgets} telah berhasil dihapus`,
        }) 
    } else { 
        return res.status(404).json({
            Error : Error,
            message: "transaksi gagal dihapus",
        })
    }
}

exports.UpdateBudgets = (req, res) => {
   const { idcategory, amount, period, startdate, idbudgets } = req.body; 
   const convertDate = startdate ? `${new Date(startdate).getFullYear()}-${String(new Date(startdate).getMonth() + 1)
                        .padStart(2, "0")}-${String(new Date(startdate).getDate()).padStart(2, "0")}`: "";

   const startDate = new Date(startdate);

    let endDate = new Date(startDate);
    
    switch (period) {
        case "threeday":
           endDate.setDate(endDate.getDate() + 3);
            break;
        case "weekly":
           endDate.setDate(endDate.getDate() + 7);
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

    const convertEndDate = endDate ? `${new Date(endDate).getFullYear()}-${String(new Date(endDate).getMonth() + 1)
                        .padStart(2, "0")}-${String(new Date(endDate).getDate()).padStart(2, "0")}`: "";
    
   const execute = userModels.updatebudgets(idcategory, amount, period, convertDate, convertEndDate, idbudgets); 

   if(execute) {
     return res.status(201).json({
        id_budgets: idbudgets,
        id_categories: idcategory, 
        amount : amount, 
        periode: period,
        startdate : convertDate, 
        enddate: convertEndDate,
        message: "budgets telah berhasil diupdate!"
     })
   } else { 
       return res.status(404).json({
        message: "transaksi gagal diupdate!",
        error: err.message
     })
   }
}

