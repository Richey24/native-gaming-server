const Adminuser = require("../../model/Admin");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../model/User");
const Game = require("../../model/Game");

exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteSingleGame = async (req, res) => {
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid game ID" });
  }

  try {
    const game = await Game.findByIdAndDelete(id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    res.status(200).json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error("Error deleting game:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
