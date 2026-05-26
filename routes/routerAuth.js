const express = require('express');
const Login = require("../controllers/Authcontrollers")
const Register = require("../controllers/Authcontrollers");
const transactions = require("../controllers/Transactions"); 
const VerifyToken  = require("../middlewares/JwtToken");
const router = express.Router();
router.use(express.json());

router.post("/Register", Register.RegisterAuth); 
router.post("/Login", Login.LoginAuth);
router.post("/Transaksi", VerifyToken, transactions.Transactions);
router.get("/Transaksi/v1/getCategories", transactions.TypeCategories); 
router.get("/Transaksi/v1/getAllTransaksi", VerifyToken, transactions.getAllTranscations);


module.exports = router;