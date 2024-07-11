const Adminuser = require("../../model/Admin");
const jwt = require("jsonwebtoken");
const User = require("../../model/User");
const Client = require("../../model/Client");
const Game = require("../../model/Game");

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
  const { page = 1, limit = 10 } = req.query;
  try {
    const users = await User.find({})
      .select("-password -tokens")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    // .populate("clients");
    const userDetails = users.map((user) => {
      return {
        id: user._id,
        organizationName: user.organizationName,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        gender: user.gender,
        isVerified: user.isVerified,
        isSubscribed: user.isSubscribed,
        logo: user.logo,
        phone: user.phone,
        description:
          user.title ??
          "If everything I did failed - which it doesn't, I think that it actually succeeds.",
        about: user.about,
        googleId: user.googleId,
        createdAt: user.createdAt ?? new Date("2024-06-14"),
        clientCount: user.clients.length, // Calculate the total number of clients
      };
    });
    const count = await User.countDocuments();
    res.status(200).json({
      userDetails,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count,
    });
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

exports.getUserWithClients = async (req, res) => {
  const { id } = req.query;

  try {
    // Find the user by ID and populate the clients field
    const user = await User.findById(id).populate("clients");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user with clients:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createGame = async (req, res) => {
  const { title, description, image, price, subscriptionPlan } = req.body;
  if (!title || !description || !image || !price || !subscriptionPlan) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const newGame = new Game({
      title,
      description,
      image,
      price,
      subscriptionPlan,
    });
    await newGame.save();
    res.status(201).json({ message: "Game created successfully", newGame });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
