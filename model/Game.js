const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  type: {
    type: String,
    enum: ["single-player", "group-player"],
    required: true,
  },
});

const Game = mongoose.model("Game", gameSchema);

module.exports = { Game };
