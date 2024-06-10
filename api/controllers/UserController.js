const User = require("../../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateOtp = require("../../utils/generateOtp");
const { sendOtp, sendForgotPasswordEmail } = require("../../utils/sendMail");

exports.vendorRegister = async (req, res) => {
  const {
    firstname,
    lastname,
    organizationName,
    password,
    confirmPassword,
    email,
  } = req.body;

  if (
    !firstname ||
    !lastname ||
    !organizationName ||
    !password ||
    !email ||
    !confirmPassword
  ) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  if (password !== confirmPassword) {
    return res
      .status(401)
      .json({ message: "password and confirm password do not match" });
  }
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "Email is tied to an existing Organization" });
    }
    const otp = generateOtp();
    console.log("otp sent", otp);
    user = new User({
      firstname,
      lastname,
      organizationName,
      password,
      email,
      otp,
    });
    await user.save();
    await sendOtp(user.email, user.organizationName, otp, "vendor");
    res.status(201).json({
      message:
        "User registered successfully. An OTP code has been sent to your mail.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email or OTP cannot be empty" });
  }

  try {
    const user = await User.findOne({ email, otp });
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

exports.vendorLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByCredentials(email, password);
  console.log("first check", user);
  if (!user) {
    return res
      .status(400)
      .json({ message: "Login failed! Check authenthication credentails" });
  }
  res.status(201).json({ user: user });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const check = await User.findOne({ email });
    if (!check) {
      return res
        .status(409)
        .json({ message: "No user found with email", status: false });
    }
    const otp = generateOtp();
    check.otp = otp;
    await check.save();
    sendForgotPasswordEmail(email, check.firstname, otp);
    res
      .status(200)
      .json({ message: "An OTP has been sent to your mail", status: true });
  } catch (error) {
    res.status(500).json({ error, status: false });
  }
};
