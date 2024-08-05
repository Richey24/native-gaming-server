const Client = require("../../model/Client");
const User = require("../../model/User");
const bcrypt = require("bcrypt");
const validatePassword = require("../../utils/validatePassword");
const { sendWinningMessage, sendOtp } = require("../../utils/sendMail");
const mongoose = require("mongoose");
const admin = require("../../firebaseAdmin");

exports.registerClient = async (req, res) => {
     const { userId, fullname, country, email, gender, password, confirmPassword } = req.body;

     if (!userId) {
          return res.status(400).json({ message: "Vendor id is required" });
     }
     if (!email) {
          return res.status(400).json({ message: "Email is required" });
     }
     if (!fullname) {
          return res.status(400).json({ message: "Fullname is required" });
     }
     if (!gender) {
          return res.status(400).json({ message: "Gender is required" });
     }
     if (!validatePassword(password)) {
          return res.status(400).json({
               message: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
          });
     }
     if (!password || !confirmPassword) {
          return res.status(400).json({ message: "Password and confirm password are required" });
     }
     if (password !== confirmPassword) {
          return res.status(401).json({ message: "Password and confirm password do not match" });
     }
     try {
          const user = await User.findById(userId);
          if (!user) {
               return res.status(404).json({ message: "Vendor not found" });
          }
          const existingClient = await Client.findOne({ email, user: userId });
          if (existingClient) {
               return res
                    .status(400)
                    .json({ message: "Client already registered under this vendor" });
          }
          const hashedPassword = await bcrypt.hash(password, 8);

          const client = new Client({
               fullname,
               country,
               email,
               password: hashedPassword,
               user: userId,
               gender,
          });
          await client.save();
          user.clients.push(client._id);
          await user.save();
          let jwtToken = await client.generateAuthToken();
          await sendOtp(client.email, client.fullname, "", "client");
          const userWithoutPassword = {
               _id: client._id,
               fullname: client.fullname,
               country: client.country,
               email: client.email,
               gender: client.gender,
          };
          res.status(201).json({
               message: "Client registered successfully",
               token: jwtToken,
               client: userWithoutPassword,
          });
     } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Server error" });
     }
};

exports.loginClient = async (req, res) => {
     const { userId, email, password } = req.body;
     try {
          const client = await Client.findOne({ email, user: userId });
          if (!client) {
               return res.status(400).json({ message: "Invalid login credentials" });
          }

          const isMatch = await bcrypt.compare(password, client.password);
          if (!isMatch) {
               return res.status(400).json({ message: "Wrong password inputed" });
          }
          const userWithoutPassword = {
               _id: client._id,
               fullname: client.fullname,
               country: client.country,
               email: client.email,
               gender: client.gender,
          };
          const token = await client.generateAuthToken();

          res.status(200).json({ client: userWithoutPassword, token });
     } catch (error) {
          console.error("Error logging in client:", error);
          res.status(500).json({ message: "Internal Server Error" });
     }
};

exports.socialRegisterClient = async (req, res) => {
     const { token, user, userId } = req.body;
     try {
          await admin.auth().verifyIdToken(token);
          const { uid, email, displayName, logo } = user;
          console.log("user", user);

          const vendor = await User.findById(userId);
          if (!vendor) {
               return res.status(404).json({ message: "Vendor not found" });
          }
          let existingClient = await Client.findOne({ email, user: userId });
          if (existingClient) {
               if (!existingClient.googleId) {
                    existingClient.googleId = uid;
                    await existingClient.save();
               }
          } else {
               existingClient = new Client({
                    googleId: uid,
                    email,
                    fullname: displayName,
                    logo,
                    user: userId,
               });
               await existingClient.save();
               vendor.clients.push(existingClient._id);
               await vendor.save();
          }

          let jwtToken = await existingClient.generateAuthToken();

          return res.status(201).json({
               user: existingClient,
               token: jwtToken,
               message: "Client registered successfully.",
          });
     } catch (error) {
          res.status(400).json({ message: "Google authentication failed", error });
     }
};

exports.playGame = async (req, res) => {
     // const clientId = req.client._id;
     const { userId, gameInstanceId, rewardId, clientId } = req.body;

     if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ message: "Invalid User ID" });
     }
     if (!mongoose.Types.ObjectId.isValid(gameInstanceId)) {
          return res.status(400).json({ message: "Invalid game ID" });
     }
     if (!mongoose.Types.ObjectId.isValid(clientId)) {
          return res.status(400).json({ message: "Invalid client ID" });
     }

     try {
          // Find the user and populate the gameInstances and nested periods.rewards
          const user = await User.findById(userId).populate({
               path: "gameInstances",
               populate: {
                    path: "periods.rewards",
               },
          });
          if (!user) {
               return res.status(404).json({ message: "User not found" });
          }

          const gameInstance = user.gameInstances.id(gameInstanceId);

          if (!gameInstance) {
               return res.status(404).json({ message: "Game instance not found" });
          }

          if (gameInstance.status === "not-started") {
               return res.status(400).json({ message: "Game instance has not started" });
          }
          if (gameInstance.status === "closed") {
               return res.status(400).json({ message: "Game instance is closed" });
          }

          let reward;
          if (rewardId) {
               reward = findReward(gameInstance, rewardId);
               // gameInstance.periods.forEach((period) => {
               //      period.rewards.forEach((r) => {
               //           if (r._id.toString() === rewardId) {
               //                reward = r;
               //           }
               //      });
               // });

               if (!reward) {
                    return res
                         .status(404)
                         .json({ message: "Reward not found in this game instance" });
               }

               // Check if the reward quantity is available
               if (reward.quantity <= 0) {
                    return res.status(400).json({ message: "Reward is no longer available" });
               }

               // Update reward quantity
               reward.quantity -= 1;
          }
          const client = user.clients.id(clientId);

          if (!client) {
               return res.status(404).json({ message: "Client not found" });
          }

          if (gameInstance.game.type === "single-player") {
               if (gameInstance.clientsPlayed.includes(client._id)) {
                    return res
                         .status(400)
                         .json({ message: "Client has already played this game instance" });
               } else {
                    gameInstance.clientsPlayed.push(client._id);
               }
          } else {
               if (!gameInstance.clientsPlayed.includes(client._id)) {
                    gameInstance.clientsPlayed.push(client._id);
               }
          }

          if (reward) {
               gameInstance.clientsWon.push({
                    client: client._id,
                    reward: reward._id,
               });
               sendWinningMessage(user, client.email, client.fullname);
          }
          await user.save();

          res.status(200).json({ message: "Client played the game", gameInstance });
     } catch (error) {
          console.error("Error playing game:", error);
          res.status(500).json({ message: "Internal Server Error" });
     }
};

const findReward = (gameInstance, rewardId) => {
     let reward;
     gameInstance.periods.forEach((period) => {
          period.rewards.forEach((r) => {
               if (r._id.toString() === rewardId) {
                    reward = r;
               }
          });
     });
     return reward;
};
