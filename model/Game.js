const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    subscriptionPlan: {
      monthly: {
        type: Number,
        required: true,
      },
      yearly: {
        type: Number,
        required: true,
      },
    },
    numberOfPlayers: {
      type: Number,
      default: 0,
    },
    numberOfParticipants: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Game = mongoose.model("Game", GameSchema);
module.exports = Game;
