const mongoose = require("mongoose");

const ClientGamePlaySchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: true,
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
});

const ClientGamePlay = mongoose.model("ClientGamePlay", ClientGamePlaySchema);
module.exports = ClientGamePlay;
