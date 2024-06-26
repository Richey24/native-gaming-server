const mongoose = require("mongoose");

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
    password: {
      type: String,
      required: [true, "Please include your password"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

ClientSchema.index({ email: 1, user: 1 }, { unique: true }); // Ensure unique email per user

module.exports = mongoose.model("Client", ClientSchema);
