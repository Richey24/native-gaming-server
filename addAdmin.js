const mongoose = require("mongoose");
require("dotenv").config();
const Adminuser = require("./model/Admin");
const { sendAdminWelcomeMail } = require("./utils/sendMail");

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
    const existingUser = await Adminuser.findOne({ email });
    if (existingUser) return console.error("user already exists");
    // return res
    //   .status(409)
    //   .json({ message: "User already exist with this email", status: "409" });
    const adminId = generateAdminId();
    const newUser = new Adminuser({
      email,
      password,
      role,
      adminId: adminId,
    });
    console.log(newUser);
    await newUser.save();
    sendAdminWelcomeMail(email, adminId);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    mongoose.connection.close();
  }
};

addAdmin("babanbasmah@gmail.com", "password", "SuperAdmin");

function generateAdminId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // String of uppercase letters
  const digits = "0123456789"; // String of digits
  const characters = letters + digits; // Combine letters and digits

  let adminId = "";

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    adminId += characters.charAt(randomIndex);
  }

  return adminId;
}
