const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const rewardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const gameInstanceSchema = new mongoose.Schema({
  game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["not-started", "open", "closed"],
    default: "not started",
  },
  rewards: [rewardSchema],
});

const subscriptionSchema = new mongoose.Schema({
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
    required: true,
  },
  subscriptionEndDate: { type: Date, required: true },
});

const UserSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: [true, "Please include your organization name"],
    },
    firstname: {
      type: String,
      required: [true, "Please Include your first name"],
    },
    lastname: {
      type: String,
      required: [true, "Please include your last Name"],
    },
    email: {
      type: String,
      required: [true, "Please Include your email"],
    },
    password: {
      type: String,
      // required: [true, "Please Include your password"],
    },
    gender: {
      type: String,
      default: "OTHERS",
      enum: ["FEMALE", "MALE", "OTHERS"],
      required: [true, "Please include user gender"],
    },
    otp: { type: String },
    isVerified: { type: Boolean, default: false },
    isSubscribed: {
      type: Boolean,
    },
    logo: {
      type: String,
    },
    phone: {
      type: String, // New phone number field
    },
    description: {
      type: String,
    },
    about: {
      type: String,
    },
    googleId: { type: String, unique: true },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    clients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },
    ],
    domainName: {
      type: String,
      unique: true,
      sparse: true,
    },
    coupons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
      },
    ],
    subscription: subscriptionSchema,
    gameInstances: [gameInstanceSchema],
  },
  { timestamps: true }
);
const MAX_TOKENS = 5;

UserSchema.pre("save", async function (next) {
  try {
    const user = this;
    if (user.isModified("password")) {
      user.password = await bcrypt.hash(user.password, 8);
    }
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.generateAuthToken = async function () {
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
      firstname: user.firstname,
      lastname: user.lastname,
      emaiål: user.email,
    },
    "secret",
    options
  );
  user.tokens = user.tokens.concat({ token });
  if (user.tokens.length > MAX_TOKENS) {
    user.tokens = user.tokens.slice(user.tokens.length - MAX_TOKENS);
  }
  await user.save();

  return token;
};

UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    return false;
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return false;
  }
  return user;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
