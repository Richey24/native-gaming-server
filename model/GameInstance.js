const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
     title: {
          type: String,
          required: true,
     },
     image: {
          type: String,
          required: true,
     },
     quantity: { type: Number, required: true },
     odds: { type: Number, default: 0 },
});

const periodSchema = new mongoose.Schema({
     startTime: { type: Date, required: true },
     endTime: { type: Date, required: true },
     rewards: [rewardSchema],
});

const gameInstanceSchema = new mongoose.Schema({
     game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
     periods: [periodSchema],
     status: {
          type: String,
          enum: ["not-started", "open", "closed"],
          default: "not-started",
     },
     clientsPlayed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Client" }],
     clientsWon: [
          {
               client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
               reward: { type: mongoose.Schema.Types.ObjectId, ref: "Reward" },
          },
     ],
});

const GameInstance = mongoose.model("GameInstance", gameInstanceSchema);

module.exports = { GameInstance, gameInstanceSchema };
