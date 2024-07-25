const cron = require("node-cron");
const User = require("./model/User");

cron.schedule("* * * * *", async () => {
  console.log("cron running");
  try {
    const now = new Date();

    // Find users with game instances where status is 'not-started' and startTime has passed
    const usersToOpenGames = await User.find({
      "gameInstances.status": "not-started",
      "gameInstances.startTime": { $elemMatch: { $lte: now } },
    });

    // Find users with game instances where status is 'open' and endTime has passed
    const usersToCloseGames = await User.find({
      "gameInstances.status": "open",
      "gameInstances.endTime": { $lte: now },
    });

    let openedCount = 0;
    let closedCount = 0;

    // Update game instances to 'open'
    for (const user of usersToOpenGames) {
      user.gameInstances.forEach((instance) => {
        if (
          instance.status === "not-started" &&
          instance.startTime.some((time) => time <= now)
        ) {
          instance.status = "open";
          openedCount++;
        }
      });
      await User.findByIdAndUpdate(user._id, {
        gameInstances: user.gameInstances,
      });
      // await user.save();
    }

    // Update game instances to 'closed'
    for (const user of usersToCloseGames) {
      user.gameInstances.forEach((instance) => {
        if (instance.status === "open" && instance.endTime <= now) {
          instance.status = "closed";
          closedCount++;
        }
      });
      await User.findByIdAndUpdate(user._id, {
        gameInstances: user.gameInstances,
      });
      // await user.save();
    }

    console.log(
      `Updated game instances: ${openedCount} opened, ${closedCount} closed.`
    );
  } catch (error) {
    console.error("Error updating game instances:", error);
  }
});
