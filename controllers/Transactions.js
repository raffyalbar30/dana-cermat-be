const connectDB = require("../DB/connections"); 
const userModels = require("../model/users");


// Total Transactions 1 Month
exports.TotalTransactions = (req, res) => {
  const userid = req.user.user_id;
  const sql = `
    SELECT 
      COALESCE(
        SUM(
          CASE 
            WHEN c.type_categories = 'Income' 
            THEN t.amount 
            ELSE 0 
          END
        ), 0
      ) AS total_income,

      COALESCE(
        SUM(
          CASE 
            WHEN c.type_categories = 'Expanses' 
            THEN t.amount 
            ELSE 0 
          END
        ), 0
      ) AS total_expense

    FROM transactions t
    JOIN categories c 
      ON t.id_categories = c.categories_id

    WHERE t.id_user = ?
      AND t.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
  `;

  connectDB.query(sql, [userid], (err, result) => {

    if (err) {
      return res.status(500).json({
        message: "Gagal memuat data total transactions",
        error: err
      });
    }

    const totalIncome = Number(result[0].total_income);
    const totalExpense = Number(result[0].total_expense);

    const netSaving = totalIncome - totalExpense;

    const totalFlow = totalIncome + totalExpense;

    const incomeRate = totalFlow > 0
      ? (totalIncome / totalFlow) * 100
      : 0;

    const expenseRate = totalFlow > 0
      ? (totalExpense / totalFlow) * 100
      : 0;

    const netSavingRate = totalIncome > 0
      ? (netSaving / totalIncome) * 100
      : 0;

    return res.status(200).json({
      userid: userid,

      data: {
        total_income: totalIncome,
        total_expense: totalExpense,
        net_balance: netSaving,

        income_rate: Number(incomeRate.toFixed(2)),
        expense_rate: Number(expenseRate.toFixed(2)),
        net_balance_rate: Number(netSavingRate.toFixed(2))
      },

      message: "Berhasil memuat data total transactions"
    });
  });
};

exports.TotalAvarageTransactions = (req, res) => {
    const userId = req.user.user_id; 

    const sql = `SELECT
    ROUND(AVG(monthly_income), 2) AS avg_monthly_income,
    ROUND(AVG(monthly_expense), 2) AS avg_monthly_expense,

    ROUND(AVG(income_rate), 2) AS avg_income_rate,
    ROUND(AVG(expense_rate), 2) AS avg_expense_rate,

    ROUND(AVG(monthly_saving), 2) AS avg_monthly_saving,
    ROUND(AVG(saving_rate), 2) AS avg_monthly_saving_rate

FROM (
    SELECT
        DATE_FORMAT(t.created_at, '%Y-%m') AS month,

        -- Total Income per bulan
        SUM(
            CASE
                WHEN c.type_categories = 'Income'
                THEN t.amount
                ELSE 0
            END
        ) AS monthly_income,

        -- Total Expenses per bulan
        SUM(
            CASE
                WHEN c.type_categories = 'Expanses'
                THEN t.amount
                ELSE 0
            END
        ) AS monthly_expense,

        -- Monthly Saving
        SUM(
            CASE
                WHEN c.type_categories = 'Income'
                THEN t.amount
                WHEN c.type_categories = 'Expanses'
                THEN -t.amount
                ELSE 0
            END
        ) AS monthly_saving,

        -- Income Rate
        (
            SUM(
                CASE
                    WHEN c.type_categories = 'Income'
                    THEN t.amount
                    ELSE 0
                END
            )
            /
            NULLIF(
                SUM(
                    CASE
                        WHEN c.type_categories IN ('Income', 'Expanses')
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            )
        ) * 100 AS income_rate,

        -- Expense Rate
        (
            SUM(
                CASE
                    WHEN c.type_categories = 'Expanses'
                    THEN t.amount
                    ELSE 0
                END
            )
            /
            NULLIF(
                SUM(
                    CASE
                        WHEN c.type_categories IN ('Income', 'Expanses')
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            )
        ) * 100 AS expense_rate,

        -- Saving Rate
        (
            (
                SUM(
                    CASE
                        WHEN c.type_categories = 'Income'
                        THEN t.amount
                        WHEN c.type_categories = 'Expanses'
                        THEN -t.amount
                        ELSE 0
                    END
                )
                /
                NULLIF(
                    SUM(
                        CASE
                            WHEN c.type_categories = 'Income'
                            THEN t.amount
                            ELSE 0
                        END
                    ),
                    0
                )
            ) * 100
        ) AS saving_rate

    FROM transactions t

    JOIN categories c
        ON t.id_categories = c.categories_id

    WHERE t.id_user = ?
      AND t.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)

    GROUP BY DATE_FORMAT(t.created_at, '%Y-%m')
) AS monthly_data`; 

connectDB.query(sql, [userId], (err, results) => {

    if (err) {
      return res.status(500).json({
        message: "Gagal memuat rata - rata transactions",
        error: err
      });
    }
     
     return res.status(201).json({
        userid: userId,
        data: results,
        message: "rata - rata transaksi telah berhasil dibuat!"
     })
})

};

// add transactions 
exports.AddTransactions = (req, res) => {
const {id_categories, amount, descriptions, date} = req.body;
const userid = req.user.user_id;


const execute = userModels.transactions(userid, id_categories, amount, descriptions, date) 
 if (execute) {
     return res.status(201).json({
        message: "data transaksi berhasil ditambahkan", 
        amount : amount, 
        descriptions : descriptions, 
        date : date
     })
 } else {
     return res.status(401).json({
            message: "maaf data transactions gagal ditambahkan"
        })
 }

};

exports.getAllTranscations = (req, res) => {
    
    const userid = req.user.user_id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5; 
    const start = (page - 1 ) * limit; 
    const end = start + limit; 


    const sql = `SELECT 
     transactions.id_transaction, user_cermat.email_user, categories.name_categories, categories.type_categories, 
     transactions.amount, transactions.descriptions, transactions.created_at FROM transactions JOIN user_cermat ON 
     transactions.id_user = user_cermat.user_id JOIN categories ON transactions.id_categories = categories.categories_id
     WHERE user_cermat.user_id = ${userid}`;

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
};

exports.TypeCategories = ( req, res) => {
   const { type_categories } = req.query; 
   const sql = `SELECT * FROM categories WHERE type_categories = ? `;

   connectDB.query(sql, [type_categories], (err, result) => {
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
};

exports.RenameTranscations = (req, res) => {
   const { amount, descriptions, id_categories, date, idtransaction, } = req.body; 
   const userid = req.user.user_id;

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
};

exports.DellateTranscations = (req, res ) => {
    const { idtransactions } = req.body; 
    const execute = userModels.dellatetransacions(idtransactions); 
    const userid = req.user.user_id;

    if (execute) {
        return res.status(201).json({
           message: `transaksi telah berhasil dihapus`,
        }) 
    } else { 
        return res.status(404).json({
            Error : Error,
            message: "transaksi gagal dihapus",
        })
    }
};