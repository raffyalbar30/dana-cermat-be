const express = require('express');
const Login = require("../controllers/Authcontrollers")
const Register = require("../controllers/Authcontrollers");
const transactions = require("../controllers/Transactions");
const budgets = require("../controllers/BudgetCategory");
const VerifyToken  = require("../middlewares/JwtToken");
const { AuthRefreshToken } = require('../controllers/RefreshToken');
const router = express.Router();
router.use(express.json());

// Router disini untuk fecthing apo
router.post("/Register", Register.RegisterAuth); 
router.post("/Login", Login.LoginAuth);
router.post("/Refresh", AuthRefreshToken);
router.post("/Transaksi", VerifyToken, transactions.Transactions);
router.get("/TotalTransaksi", VerifyToken, transactions.TotalTransactions);
router.get("/Transaksi/v1/getCategories", transactions.TypeCategories); 
router.get("/Transaksi/v1/getAllTransaksi", VerifyToken, transactions.getAllTranscations);
router.post("/Transaksi/v1/renameTransaksi", transactions.RenameTranscations); 
router.post("/Transaksi/v1/dellateTransaksi", transactions.DellateTranscations);
router.get("/TotalBudgets", VerifyToken, budgets.TotalBudegts);
router.get("/Budgets/v1/getAllcategories", budgets.typeBudgetCategories);  
router.post("/Budgets/v1/addbudgets", VerifyToken, budgets.AddBudgets); 
router.get("/Budgets/v1/getAllBudgets", VerifyToken, budgets.getAllBudgets);
router.post("/Budgets/v1/dellateBudgets", budgets.DellateBudgets);
router.post("/Budgets/v1/updateBudgets", budgets.UpdateBudgets); 

module.exports = router;