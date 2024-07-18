const User = require("../../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const generateOtp = require("../../utils/generateOtp");
const { sendOtp, sendForgotPasswordEmail } = require("../../utils/sendMail");
const admin = require("../../firebaseAdmin");
const Client = require("../../model/Client");
const validatePassword = require("../../utils/validatePassword");
const Game = require("../../model/Game");
const UserGameSubscription = require("../../model/GameSubscription");
const ClientGamePlay = require("../../model/ClientGamePlay");

exports.vendorRegister = async (req, res) => {
  const {
    firstname,
    lastname,
    organizationName,
    password,
    confirmPassword,
    email,
    gender,
  } = req.body;

  if (
    !firstname ||
    !lastname ||
    !organizationName ||
    !password ||
    !email ||
    !confirmPassword ||
    !gender
  ) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
    });
  }

  if (password !== confirmPassword) {
    return res
      .status(401)
      .json({ message: "password and confirm password do not match" });
  }
  try {
    let user = await User.findOne({ email });
    let token;
    let userWithoutPassword;
    if (user) {
      if (!user.isVerified) {
        const otp = generateOtp();
        user.otp = otp;
        await participant.save();
        sendOtp(user.email, user.organizationName, otp, "vendor");
        return res.status(200).json({
          status: "not_verified",
          message:
            "User is already registered but not verified. A new OTP has been sent to your email.",
        });
      }
      if (user.email === email) {
        return res
          .status(400)
          .json({ message: "Email is tied to an existing Organization" });
      }
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
    userWithoutPassword = {
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      isVerified: user.isVerified,
      subscribed: user.isSubscribed,
    };
    token = await user.generateAuthToken();
    res.status(201).json({
      user: userWithoutPassword,
      token: token,
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
    const token = await user.generateAuthToken();
    res
      .status(200)
      .json({ message: "Account verified successfully", token: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.vendorLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByCredentials(email, password);
  if (!user) {
    return res
      .status(400)
      .json({ message: "Login failed! Check authenthication credentails" });
  }
  const userWithoutPassword = {
    _id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    isVerified: user.isVerified,
    subscribed: user.isSubscribed,
  };
  const token = await user.generateAuthToken(user.email);
  res.status(201).json({ user: userWithoutPassword, token });
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
    console.log(otp);
    await check.save();
    sendForgotPasswordEmail(email, check.firstname, otp);
    res
      .status(200)
      .json({ message: "An OTP has been sent to your mail", status: true });
  } catch (error) {
    res.status(500).json({ error, status: false });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res
        .status(401)
        .json({ message: "password and confirm password do not match" });
    }
    const decoded = jwt.verify(token, "secret");
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password;
    user.otp = undefined;
    await user.save();

    res
      .status(200)
      .json({ message: "Password updated successfully", status: true });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error, status: false });
  }
};

exports.socialRegister = async (req, res) => {
  const { token, user } = req.body;
  try {
    await admin.auth().verifyIdToken(token);
    const { uid, email, displayName, logo } = user;

    const nameParts = displayName.split(" ");
    const firstname = nameParts[0];
    const lastname = nameParts.slice(1).join(" ");

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      // Updating the user with Google ID if it doesn't not exist
      if (!existingUser.googleId) {
        existingUser.googleId = uid;
        await existingUser.save();
      }
    } else {
      existingUser = new User({
        googleId: uid,
        email,
        firstname,
        lastname,
        logo,
        isVerified: true,
        organizationName: firstname + " " + lastname,
      });
      await existingUser.save();
    }

    const jwtToken = await existingUser.generateAuthToken();
    res.status(201).json({
      user: existingUser,
      token: jwtToken,
      message: "User registered successfully.",
    });
  } catch (error) {
    res.status(400).json({ message: "Google authentication failed", error });
  }
};

exports.updateUserInfo = async (req, res) => {
  const id = req.user._id;
  // const { id } = req.params;
  const updateFields = { ...req.body };
  delete updateFields.email;

  if (updateFields.organizationName) {
    const organizationExists = await User.findOne({
      organizationName: updateFields.organizationName,
    });
    if (
      organizationExists &&
      organizationExists._id.toString() !== id.toString()
    ) {
      return res
        .status(400)
        .json({ message: "Organization name already exists" });
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
    });
  }
  if (newPassword !== confirmPassword) {
    return res
      .status(401)
      .json({ message: "new password and confirm password do not match" });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getClients = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const clients = await Client.find({ user: vendorId })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createDomainName = async (req, res) => {
  const userId = req.user._id;
  const { domainName } = req.body;

  if (!domainName) {
    return res.status(400).json({ message: "Domain name is required" });
  }
  if (domainName.length < 2) {
    return res
      .status(400)
      .json({ message: "Domain name cannot be less than 2 characters" });
  }
  try {
    const existingUser = await User.findOne({ domainName });
    if (existingUser) {
      return res.status(400).json({ message: "Domain name already exists" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { domainName },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Domain name added successfully", user });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.subscribeToGame = async (req, res) => {
  const userId = req.user._id;
  const { gameId, subscriptionType, rewards } = req.body;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid game ID" });
  }
  try {
    const user = await User.findById(userId);
    const game = await Game.findById(gameId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    let subscriptionEndDate;
    const now = new Date();
    if (subscriptionType === "monthly") {
      subscriptionEndDate = new Date(now.setMonth(now.getMonth() + 1));
    } else if (subscriptionType === "yearly") {
      subscriptionEndDate = new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      return res.status(400).json({ message: "Invalid subscription type" });
    }
    const newSubscription = new UserGameSubscription({
      user: userId,
      game: gameId,
      subscriptionType,
      subscriptionEndDate,
    });
    await newSubscription.save();
    game.numberOfParticipants += 1;
    await game.save();

    // Add rewards to user
    if (rewards && Array.isArray(rewards)) {
      rewards.forEach((reward) => {
        user.rewards.push({
          title: reward.title,
          image: reward.url,
        });
      });
    }
    await user.save();
    res.status(201).json({
      message: "Subscribed to game successfully",
      subscription: newSubscription,
      rewards: user.rewards,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getClientsWhoPlayedGame = async (req, res) => {
  const userId = req.user._id; // Assuming user is authenticated
  const { gameId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid game ID" });
  }
  try {
    const userSubscription = await UserGameSubscription.findOne({
      user: userId,
      game: gameId,
    });
    if (!userSubscription) {
      return res
        .status(404)
        .json({ message: "User is not subscribed to this game" });
    }

    const gamePlays = await ClientGamePlay.find({ game: gameId })
      .populate("client")
      .sort({ createdAt: -1 });
    res.status(200).json({ clients: gamePlays.map((play) => play.client) });
  } catch (error) {
    console.error("Error fetching clients who played game:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllSubscribedGames = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("subscribedGames");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ games: user.subscribedGames });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserByDomainName = async (req, res) => {
  const { domainName } = req.query;

  try {
    if (!domainName) {
      return res.status(400).json({ message: "Domain name is required" });
    }
    if (domainName.length < 2) {
      return res
        .status(400)
        .json({ message: "Domain name cannot be less than 2 characters" });
    }
    const user = await User.findOne({ domainName }).populate("clients");
    if (!user) {
      console.log("reached");
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      user: {
        organizationName: user.organizationName,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        logo: user.logo,
        phone: user.phone,
        googleId: user.googleId,
        domainName: user.domainName,
        clients: user.clients,
        subscribedGames: user.subscribedGames,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        about: user.about,
        description: user.description,
        _id: user._id,
        isVerified: user.isVerified,
        isSubscribed: user.isSubscribed,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
