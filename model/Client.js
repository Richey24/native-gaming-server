const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ClientSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please include your Full name"],
    },
    country: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Please include your email"],
    },
    gender: {
      type: String,
      default: "Others",
      enum: ["Female", "Male", "Others"],
      required: [true, "Please include user gender"],
    },
    password: {
      type: String,
      // required: [true, "Please include your password"],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Ensure googleId is unique but can be null
    },
    logo: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    gamesPlayed: [
      {
        gameInstance: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User.gameInstances",
          required: true,
        },
        won: { type: Boolean, default: false },
        playedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
const MAX_TOKENS = 5;
ClientSchema.methods.generateAuthToken = async function () {
  const user = this;
  let options = {};

  // Set token to expire in 1 hour in production mode
  if (process.env.NODE_ENV !== "development") {
    options.expiresIn = "1h";
  } else {
    options.expiresIn = "5d";
  }

  const token = jwt.sign(
    {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
    },
    "Clientsecret",
    options
  );
  user.tokens = user.tokens.concat({ token });
  if (user.tokens.length > MAX_TOKENS) {
    user.tokens = user.tokens.slice(user.tokens.length - MAX_TOKENS);
  }
  await user.save();

  return token;
};
const Client = mongoose.model("Client", ClientSchema);

Client.on("index", function (error) {
  // Check for index errors
  if (error) {
    console.error("Indexing error: ", error);
  }
});
module.exports = Client;
