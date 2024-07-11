const mongoose = require("mongoose");

const UserGameSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: true,
  },
  subscriptionType: {
    type: String,
    enum: ["monthly", "yearly"],
    required: true,
  },
  subscriptionEndDate: {
    type: Date,
    required: true,
  },
});

const UserGameSubscription = mongoose.model(
  "UserGameSubscription",
  UserGameSubscriptionSchema
);
module.exports = UserGameSubscription;
