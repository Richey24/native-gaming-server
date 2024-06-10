const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ADMIN_ROLE } = require("../schemas/Admin.schema");

const adminSchema = new mongoose.Schema({
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
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// adminSchema.statics.findByCredentials = async (email, password) => {
//   const user = await Adminuser.findOne({ email });

//   if (!user) {
//     return false;
//   }
//   const isPasswordMatch = await bcrypt.compare(password, user.password);
//   console.log(password);
//   console.log(user.password);
//   if (!isPasswordMatch) {
//     return false;
//   }
//   return user;
// };

const Adminuser = mongoose.model("Admin", adminSchema);

module.exports = Adminuser;
