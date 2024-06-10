const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcrypt");
const Adminuser = require("./model/Admin");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log({ database_error: err });
  });

const addAdmin = async (email, password, role) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Adminuser({
      email,
      password: hashedPassword,
      role,
    });

    await newAdmin.save();
    console.log("New admin user created");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    mongoose.connection.close();
  }
};

addAdmin("justiniyke1995@gmail.com", "Test1234@", "SuperAdmin");
