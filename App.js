const express = require("express");
const Routers = require("./routes/routerAuth")
const PORT = 3000;
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json()); // untuk JSON
app.use(express.urlencoded({ extended: true })); // untuk form-urlencoded

app.use("/API", Routers); 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

