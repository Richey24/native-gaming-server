const mongoose = require("mongoose");

const ShoeContestParticipantSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Please include your first name"],
  },
  lastname: {
    type: String,
    required: [true, "Please include your last name"],
  },
  email: {
    type: String,
    required: [true, "Please include your email"],
  },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
});

ShoeContestParticipantSchema.index({ email: 1, user: 1 }, { unique: true }); // Ensure unique email per user

module.exports = mongoose.model("ShoeContestParticipant", ShoeContestParticipantSchema);
