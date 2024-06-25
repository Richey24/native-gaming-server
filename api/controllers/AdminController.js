const Adminuser = require("../../model/Admin");
const jwt = require("jsonwebtoken");
const User = require("../../model/User");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please enter an email" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password cannot be empty" });
  }

  try {
    const existingUser = await Adminuser.findByCredentials(email, password);
    if (!existingUser)
      return res.status(400).json({
        message: "Login failed! Check authenthication credentails",
      });

    await existingUser.save();
    const userWithoutPassword = {
      _id: existingUser._id,
      email: existingUser.email,
      adminId: existingUser?.adminId,
      role: existingUser?.role,
    };
    const token = await existingUser.generateAuthToken();

    res.status(201).json({ user: userWithoutPassword, token, status: "201" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email or OTP cannot be empty" });
  }

  try {
    const user = await Adminuser.findOne({ email, otp });
    if (!user) {
      return res.status(400).json({ message: "Invalid OTP or email" });
    }
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    res.status(200).json({ message: "Account verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAdminDetails = async (req, res) => {
  try {
    res.status(200).json({ admin: req.admin });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllVendors = async (req, res) => {
  try {
    const users = await User.find({}).select("-password -tokens");
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Adminuser.find({}).select("-password -tokens");
    res.status(200).json({ admins });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
