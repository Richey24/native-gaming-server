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
    required: [true, "Please Include your password"],
  },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
});

UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (err) {
    next(err);
  }
});

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
