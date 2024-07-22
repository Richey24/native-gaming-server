const { Game } = require("../../model/Game");

exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getGameById = async (req, res) => {
  const { gameId } = req.query;
  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.status(200).json({ game });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// exports.editGame = async (req, res) => {
//   const { id } = req.query;
//   const { title, description, image } = req.body;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ message: "Invalid game ID" });
//   }

//   try {
//     const game = await Game.findById(id);

//     if (!game) {
//       return res.status(404).json({ message: "Game not found" });
//     }

//     game.title = title || game.title;
//     game.description = description || game.description;
//     game.image = image || game.image;

//     await game.save();
//     res.status(200).json({ message: "Game updated successfully", game });
//   } catch (error) {
//     console.error("Error editing game:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// exports.deleteGame = async (req, res) => {
//   const { id } = req.query;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ message: "Invalid game ID" });
//   }
//   try {
//     const game = await Game.findByIdAndDelete(id);

//     if (!game) {
//       return res.status(404).json({ message: "Game not found" });
//     }

//     await game.save();
//     res.status(200).json({ message: "Game deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting game:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
