const User = require("../../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const generateOtp = require("../../utils/generateOtp");
const { sendOtp, sendForgotPasswordEmail } = require("../../utils/sendMail");
const admin = require("../../firebaseAdmin");
const Client = require("../../model/Client");
const validatePassword = require("../../utils/validatePassword");
const { Game } = require("../../model/Game");
const ClientGamePlay = require("../../model/ClientGamePlay");
const SubscriptionPlan = require("../../model/SubscriptionPlan");

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

// exports.getAllSubscribedGames = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const user = await User.findById(userId).populate("subscribedGames");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ games: user.subscribedGames });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

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

exports.subscribeToPlan = async (req, res) => {
  const userId = req.user._id;
  const { planId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(planId)) {
    return res.status(400).json({ message: "Invalid Plan ID" });
  }
  try {
    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    const subscriptionEndDate = new Date();
    if (plan.type === "monthly") {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    } else if (plan.type === "yearly") {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    } else if (plan.type === "one-off") {
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 5);
    } else {
      return res.status(400).json({ message: "Unknown duration type" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        subscription: {
          plan: planId,
          subscriptionEndDate,
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Subscribed to plan successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createGameInstance = async (req, res) => {
  const userId = req.user._id;
  const { gameId, startTime, endTime, rewards } = req.body;

  if (!gameId || !startTime || !endTime) {
    return res
      .status(400)
      .json({ message: "Game ID, start time, and end time are required" });
  }

  try {
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newGameInstance = {
      game: gameId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      rewards,
      status: "not-started",
    };

    user.gameInstances.push(newGameInstance);
    await user.save();

    res.status(201).json({
      message: "Game instance created successfully",
      gameInstance: newGameInstance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserGameInstances = async (req, res) => {
  const userId = req.user._id;
  const { status } = req.query;

  try {
    // const query = { _id: userId };
    // if (status) {
    //   query["gameInstances.status"] = status;
    // }

    // const user = await User.findOne(query)
    //   .select("gameInstances")
    //   .populate("gameInstances.game");
    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }
    // const gameInstances = user.gameInstances.filter(
    //   (instance) => !status || instance.status === status
    // );
    const user = await User.findById(userId).populate("gameInstances");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let gameInstances = user.gameInstances;

    if (status) {
      gameInstances = gameInstances.filter(
        (instance) => instance.status === status
      );
    }
    res.status(200).json({ gameInstances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllSubscriptionPlans = async (req, res) => {
  try {
    const subscriptionPlans = await SubscriptionPlan.find();
    res.status(200).json(subscriptionPlans);
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
