const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
     title: { type: String, required: true },
     image: { type: String, required: true },
     quantity: { type: Number, required: true },
     odds: { type: Number, default: 0 },
});

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = Reward;
