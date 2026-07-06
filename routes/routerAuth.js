const express = require('express');
const Login = require("../controllers/Authcontrollers")
const Register = require("../controllers/Authcontrollers");
const transactions = require("../controllers/Transactions");
const budgets = require("../controllers/BudgetCategory");
const VerifyToken  = require("../middlewares/JwtToken");
const router = express.Router();
router.use(express.json());

router.post("/Register", Register.RegisterAuth); 
router.post("/Login", Login.LoginAuth);
router.post("/Transaksi", VerifyToken, transactions.Transactions);
router.get("/Transaksi/v1/getCategories", transactions.TypeCategories); 
router.get("/Transaksi/v1/getAllTransaksi", VerifyToken, transactions.getAllTranscations);
router.post("/Transaksi/v1/renameTransaksi", transactions.RenameTranscations); 
router.post("/Transaksi/v1/dellateTransaksi", transactions.DellateTranscations);  
router.post("/Budgets/v1/addbudgets", VerifyToken, budgets.AddBudgets); 
router.get("/Budgets/v1/getAllBudgets", VerifyToken, budgets.getAllBudgets);
router.post("/Budgets/v1/dellateBudgets", budgets.DellateBudgets);


module.exports = router;