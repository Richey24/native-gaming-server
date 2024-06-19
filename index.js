const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 4000;
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log({ database_error: err });
  });

const corsOptions = {
  origin: "*", // Allow all origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  console.log("Hello  API working");
  res.status(201).json({ message: "working" });
});

const userRouter = require("./api/routes/user");
const adminRouter = require("./api/routes/admin");
const imageRouter = require("./api/routes/image");

app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/image", imageRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
