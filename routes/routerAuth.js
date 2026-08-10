const express = require('express');
const Login = require("../controllers/LoginAuth");
const Register = require("../controllers/RegisterAuth");
const Logout = require("../controllers/Logout");
const Refresh = require("../controllers/RefreshToken");
const ResetPassword = require("../controllers/Resetpassword");
const transactions = require("../controllers/Transactions");
const budgets = require("../controllers/BudgetCategory");
const VerifyToken  = require("../middlewares/JwtToken");
const { loginLimiter } = require('../middlewares/Loginlimiter');
const router = express.Router();
router.use(express.json());

// Router disini untuk fecthing apo
router.post("/Register", Register.RegisterAuth); 
router.post("/Login", loginLimiter, Login.LoginAuth);
router.post("/Logout", Logout.LogoutAuth);
router.post("/RefreshToken", Refresh.AuthRefreshToken);
router.post("/ResetPassword", ResetPassword.Resetpassword);
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