const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ADMIN_ROLE } = require("../schemas/Admin.schema");

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      default: ADMIN_ROLE.BasicAdmin,
      enum: [
        ADMIN_ROLE.BasicAdmin,
        ADMIN_ROLE.OperationsAdmin,
        ADMIN_ROLE.SuperAdmin,
        ADMIN_ROLE.CustomerCare,
        ADMIN_ROLE.EditorAdmin,
      ],
      required: [true, "Please include user role"],
    },
    adminId: {
      type: String,
      required: [true, "Please Include your admin Id"],
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const MAX_TOKENS = 5;
adminSchema.pre("save", async function () {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 12);
  }
  // if (!this.isModified("password")) {
  //   return next();
  // }
  // const salt = await bcrypt.genSalt(10);
  // this.password = await bcrypt.hash(this.password, salt);
  // next();
});
adminSchema.methods.generateAuthToken = async function () {
  const user = this;
  var token = jwt.sign(
    {
      _id: user._id,
      adminId: user.adminId,
      email: user.email,
    },
    "adminsecret",
    { expiresIn: "24h" }
  );
  user.tokens = user.tokens.concat({ token });
  if (user.tokens.length > MAX_TOKENS) {
    user.tokens = user.tokens.slice(user.tokens.length - MAX_TOKENS);
  }
  await user.save();

  return token;
};

adminSchema.statics.findByCredentials = async (email, password) => {
  const user = await Adminuser.findOne({ email });

  if (!user) {
    return false;
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return false;
  }
  return user;
};

const Adminuser = mongoose.model("Admin", adminSchema);

module.exports = Adminuser;
