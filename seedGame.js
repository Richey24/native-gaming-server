const mongoose = require("mongoose");
require("dotenv").config();
const { Game } = require("./model/Game");

const predefinedGames = [
  {
    title: "Bullseye Game",
    description:
      "Engage your customers with Bullseye, a thrilling target-shooting game. Challenge them to aim for the bullseye and score when they hit the target. Ready, aim, and let your customers fire their way to victory!",
    image:
      "https://absa7kzimnaf.blob.core.windows.net/newcontainer/25a28e62fd06d263a5a65e1ac3b9c972",
  },
  {
    title: "Slot Game",
    description:
      "Engage your with our Slot Game! Let the spin the reels for a chance to win a prize. A way of boosting customer interaction.",
    image:
      "https://absa7kzimnaf.blob.core.windows.net/newcontainer/8f24a4ece4c1fd07d6bf535b09f8ad5c",
  },
  {
    title: "Spin Wheel",
    description:
      "Enhance your customer experience with our Spin-Wheel game! Invite your customers to spin and win exciting prize. Perfect for all ages, this game encourage your customers to try their luck and discover what rewards await!",
    image:
      "https://absa7kzimnaf.blob.core.windows.net/newcontainer/c9daafb30ae0b781947a6a67dd7000c1",
  },
  {
    title: "Flip Coin",
    description:
      "Engage your customers with our Flip Coin game! Add a touch of excitement to your business by offering them a chance to win rewards with a simple coin flip. Perfect for increasing customer interaction and enhancing their shopping experience. Let them flip the coin and discover their luck today!",
    image:
      "https://absa7kzimnaf.blob.core.windows.net/newcontainer/42b1e481896808030725f2a7e1f1d5a1",
  },
  {
    title: "Raffle Draw Game",
    description:
      "Engage your customers with our thrilling Raffle Draw Game, where they can win fantastic prizes! Perfect for boosting customer interaction and enhancing their shopping experience, its also a great way to expand your contact base. Join in for the chance to win and connect with us today!",
    image:
      "https://absa7kzimnaf.blob.core.windows.net/newcontainer/9b183e516043f99ee6f08394061b7f34",
  },
];

const seedGames = async () => {
  try {
    mongoose
      .connect(process.env.MONGO_URL)
      .then(() => {
        console.log("Database is connected");
      })
      .catch((err) => {
        console.log({ database_error: err });
      });

    for (const gameData of predefinedGames) {
      const existingGame = await Game.findOne({ title: gameData.title });
      if (!existingGame) {
        const newGame = new Game(gameData);
        await newGame.save();
        console.log(`Added ${gameData.title}`);
      } else {
        console.log(`${gameData.title} already exists`);
      }
    }

    console.log("Seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding games:", error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
};

seedGames();
