const express = require("express");
const Routers = require("./routes/routerAuth")
const cookiParser = require("cookie-parser")
require("dotenv").config()
const PORT = 3000;
const app = express();
const cors = require("cors");

// accept cors for sending cookies ( Important )
app.use(cors({
  origin: "http://localhost:5174",
  credentials: true,
}));

app.use(cookiParser());
app.use(express.json()); // untuk JSON
app.use(express.urlencoded({ extended: true })); // untuk form-urlencoded

app.use("/API", Routers); 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

