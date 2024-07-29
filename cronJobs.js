const cron = require("node-cron");
const User = require("./model/User");

cron.schedule("* * * * *", async () => {
  console.log("cron running");
  try {
    const now = new Date();

    const users = await User.find({
      "gameInstances.periods": {
        $elemMatch: {
          startTime: { $lte: now },
          endTime: { $gte: now },
        },
      },
    });

    let openedCount = 0;
    let closedCount = 0;

    for (const user of users) {
      let updated = false;
      user.gameInstances.forEach((gameInstance) => {
        gameInstance.periods.forEach((period) => {
          if (
            period.startTime <= now &&
            period.endTime > now &&
            gameInstance.status === "not-started"
          ) {
            gameInstance.status = "open";
            openedCount++;
            updated = true;
          } else if (period.endTime <= now && gameInstance.status === "open") {
            gameInstance.status = "closed";
            closedCount++;
            updated = true;
          }
        });
      });
      if (updated) {
        await user.save();
      }
    }
    console.log(
      `Updated game instances: ${openedCount} opened, ${closedCount} closed.`
    );
  } catch (error) {
    console.error("Error updating game instances:", error);
  }
});
