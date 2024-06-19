const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
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
  googleId: { type: String, unique: true },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

UserSchema.pre("save", async function (next) {
  try {
    const user = this;
    if (user.isModified("password")) {
      user.password = await bcrypt.hash(user.password, 8);
    }

    var token = jwt.sign(
      {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
      "secret"
    );
    user.tokens = user.tokens.concat({ token });
    return token;
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
  await user.save();

  return token;
};

UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    return false;
  }
  console.log("reached", user);
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return false;
  }
  return user;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
