const express = require('express');
const Login = require("../controllers/LoginAuth");
const Register = require("../controllers/RegisterAuth");
const Logout = require("../controllers/Logout");
const Refresh = require("../controllers/RefreshToken");
const ResetPassword = require("../controllers/Resetpassword");
const transactions = require("../controllers/Transactions");
const budgets = require("../controllers/BudgetCategory");
const chart = require("../controllers/Chart");
const VerifyToken = require("../middlewares/JwtToken");
const { loginLimiter } = require('../middlewares/Loginlimiter');
const { forgotPasswordLimiter } = require('../middlewares/OTPlimiter');
const router = express.Router();
router.use(express.json());

// Auth routes
router.post("/Register", Register.RegisterAuth);
router.post("/Login", loginLimiter, Login.LoginAuth);
router.post("/Logout", Logout.LogoutAuth);
router.post("/RefreshToken", Refresh.AuthRefreshToken);
router.post("/ResetPassword", forgotPasswordLimiter, ResetPassword.SendOTP);
router.post("/verify/ResetPassword", ResetPassword.verifyOTP);
router.post("/verify/Newpassword", ResetPassword.ResetPassword);

// Transaksi routes (v1 konsisten huruf kecil)
router.post("/Transaksi/v1/AddTransaksi", VerifyToken, transactions.AddTransactions);
router.get("/Transaksi/v1/TotalTransaksi", VerifyToken, transactions.TotalTransactions);
router.get("/Transaksi/v1/getCategories", transactions.TypeCategories);
router.get("/Transaksi/v1/getAllTransaksi", VerifyToken, transactions.getAllTranscations);
router.post("/Transaksi/v1/renameTransaksi", VerifyToken, transactions.RenameTranscations);
router.post("/Transaksi/v1/deleteTransaksi", VerifyToken, transactions.DellateTranscations);

// Budget routes
router.get("/Budgets/v1/TotalBudgets", VerifyToken, budgets.TotalBudegts);
router.get("/Budgets/v1/getAllcategories", budgets.typeBudgetCategories);
router.post("/Budgets/v1/addBudgets", VerifyToken, budgets.AddBudgets);
router.get("/Budgets/v1/getAllBudgets", VerifyToken, budgets.getAllBudgets);
router.post("/Budgets/v1/deleteBudgets", VerifyToken, budgets.DellateBudgets);
router.post("/Budgets/v1/updateBudgets", VerifyToken, budgets.UpdateBudgets);

router.get("/analytics/income-expenses", VerifyToken, chart.Chart); 

module.exports = router;