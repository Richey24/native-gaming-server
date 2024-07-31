const cron = require("node-cron");
const User = require("./model/User");

cron.schedule("* * * * *", async () => {
  console.log("cron running");
  try {
    const users = await User.find().populate({
      path: "gameInstances",
      populate: { path: "game" }, // Populate game to access the type
    });

    const now = new Date();

    for (const user of users) {
      for (const gameInstance of user.gameInstances) {
        const { game } = gameInstance;
        let statusUpdated = false;

        if (game.type === "single-player") {
          const period = gameInstance.periods[0];
          if (period) {
            if (now >= period.startTime && now < period.endTime) {
              if (gameInstance.status !== "open") {
                gameInstance.status = "open";
                statusUpdated = true;
              }
            } else if (now >= period.endTime) {
              if (gameInstance.status !== "closed") {
                gameInstance.status = "closed";
                statusUpdated = true;
              }
            }
          }
        } else if (game.type === "group-player") {
          // For group-player games, iterate through each period
          for (let i = 0; i < gameInstance.periods.length; i++) {
            const period = gameInstance.periods[i];

            // Check if the current time is within the period
            if (
              now >= period.startTime &&
              now < new Date(period.startTime.getTime() + 30 * 60000) &&
              gameInstance.status !== "open"
            ) {
              gameInstance.status = "open";
              statusUpdated = true;
              break;
            } else if (
              now >= new Date(period.startTime.getTime() + 30 * 60000) &&
              gameInstance.status !== "not-started"
            ) {
              gameInstance.status = "not-started";
              statusUpdated = true;
            }
          }

          // Check if all periods have ended to set the status to closed
          const allPeriodsEnded = gameInstance.periods.every(
            (period) => now >= period.endTime
          );

          if (allPeriodsEnded && gameInstance.status !== "closed") {
            gameInstance.status = "closed";
            statusUpdated = true;
          }
        }

        if (statusUpdated) {
          await gameInstance.save();
        }
      }
    }
  } catch (error) {
    console.error("Error updating game instances:", error);
  }
});
