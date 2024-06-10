const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 4000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log({ database_error: err });
  });

app.use(bodyParser.json());

app.get("/", (req, res) => {
  console.log("Hello  API working");
  res.status(201).json({ message: "working" });
});

const userRouter = require("./api/routes/user");
const adminRouter = require("./api/routes/admin");

app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
