require("dotenv").config();
const express = require("express");
const app = express();

const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");

app.use(express.json());
app.use(logger);

app.get("/health", (req,res)=> res.json({status:"Server running"}));

app.use("/users", userRoutes);

// Transactions API
app.use("/transactions", transactionRoutes);
// app.use("/summary", require("./utils/analytics"));

app.use(errorHandler);

app.listen(5000, ()=> console.log("Server started on 5000"));
