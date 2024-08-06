const cron = require("node-cron");
const User = require("./model/User");
const { GameInstance } = require("./model/GameInstance");

const addTemporaryFlagToClient = async (userId) => {
     console.log("iddddd=>", userId);
     try {
          const user = await User.findById(userId).populate("clients");
          if (!user || !user.clients.length) {
               console.log(`No clients found for user ${userId}`);
               return;
          }
          console.log("user id", userId);

          // Select a random client
          const randomClientIndex = Math.floor(Math.random() * user.clients.length);
          const selectedClient = user.clients[randomClientIndex];

          // Check if the flag is already set
          if (!selectedClient.temporaryFlag) {
               selectedClient.temporaryFlag = true; // Add a temporary flag
               await selectedClient.save();

               console.log(`Temporary flag added to client ${selectedClient._id}`);

               // Remove the temporary flag after 20 minutes (20 * 60 * 1000 milliseconds)
               setTimeout(async () => {
                    const updatedClient = await User.findOne(
                         { "clients._id": selectedClient._id },
                         { "clients.$": 1 },
                    );
                    if (updatedClient.clients[0].temporaryFlag) {
                         updatedClient.clients[0].temporaryFlag = false;
                         await updatedClient.save();
                         console.log(
                              `Temporary flag removed from client ${updatedClient.clients[0]._id}`,
                         );
                    }
               }, 20 * 60 * 1000); // 20 minutes in milliseconds
          }
     } catch (error) {
          console.error(`Error adding temporary flag to client: ${error.message}`);
     }
};

// Cron job to check for upcoming game instances

cron.schedule("* * * * *", async () => {
     try {
          const now = new Date();
          const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

          const users = await User.find().populate({
               path: "gameInstances",
               populate: { path: "game" }, // Populate game to access the type
          });

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

                              if (
                                   period.startTime >= now &&
                                   period.startTime <= tenMinutesFromNow &&
                                   gameInstance.status === "not-started"
                              ) {
                                   addTemporaryFlagToClient(user._id);
                              }
                         }

                         const allPeriodsEnded = gameInstance.periods.every(
                              (period) => now >= period.endTime,
                         );

                         if (allPeriodsEnded && gameInstance.status !== "closed") {
                              gameInstance.status = "closed";
                              statusUpdated = true;
                         }
                    }

                    if (statusUpdated) {
                         await user.save();
                    }
               }
          }
     } catch (error) {
          console.error(`Error in cron job: ${error.message}`);
     }
});

// cron.schedule("* * * * *", async () => {
//      try {
//           const now = new Date();
//           const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

//           const users = await User.find().populate({
//                path: "gameInstances",
//                populate: { path: "game" }, // Populate game to access the type
//           });
//           users.forEach((user) => {
//                user.gameInstances.forEach((gameInstance) => {
//                     const { game } = gameInstance;
//                     gameInstance.periods.forEach((period) => {
//                          if (
//                               period.startTime >= now &&
//                               period.startTime <= tenMinutesFromNow &&
//                               gameInstance.status === "not-started" &&
//                               game.type === "group-player"
//                          ) {
//                               addTemporaryFlagToClient(user._id);
//                          }
//                     });
//                });
//           });
//      } catch (error) {
//           console.error(`Error in cron job: ${error.message}`);
//      }
// });

// cron.schedule("* * * * *", async () => {
//      console.log("cron running");
//      try {
//           const users = await User.find().populate({
//                path: "gameInstances",
//                populate: { path: "game" }, // Populate game to access the type
//           });

//           const now = new Date();

//           for (const user of users) {
//                for (const gameInstance of user.gameInstances) {
//                     const { game } = gameInstance;
//                     let statusUpdated = false;

//                     if (game.type === "single-player") {
//                          const period = gameInstance.periods[0];
//                          if (period) {
//                               if (now >= period.startTime && now < period.endTime) {
//                                    if (gameInstance.status !== "open") {
//                                         gameInstance.status = "open";
//                                         statusUpdated = true;
//                                    }
//                               } else if (now >= period.endTime) {
//                                    if (gameInstance.status !== "closed") {
//                                         gameInstance.status = "closed";
//                                         statusUpdated = true;
//                                    }
//                               }
//                          }
//                     } else if (game.type === "group-player") {
//                          // For group-player games, iterate through each period
//                          for (let i = 0; i < gameInstance.periods.length; i++) {
//                               const period = gameInstance.periods[i];

//                               // Check if the current time is within the period
//                               if (
//                                    now >= period.startTime &&
//                                    now < new Date(period.startTime.getTime() + 30 * 60000) &&
//                                    gameInstance.status !== "open"
//                               ) {
//                                    gameInstance.status = "open";
//                                    statusUpdated = true;
//                                    break;
//                               } else if (
//                                    now >= new Date(period.startTime.getTime() + 30 * 60000) &&
//                                    gameInstance.status !== "not-started"
//                               ) {
//                                    gameInstance.status = "not-started";
//                                    statusUpdated = true;
//                               }
//                          }

//                          // Check if all periods have ended to set the status to closed
//                          const allPeriodsEnded = gameInstance.periods.every(
//                               (period) => now >= period.endTime,
//                          );

//                          if (allPeriodsEnded && gameInstance.status !== "closed") {
//                               gameInstance.status = "closed";
//                               statusUpdated = true;
//                          }
//                     }

//                     if (statusUpdated) {
//                          await user.save();
//                     }
//                }
//           }
//      } catch (error) {
//           console.error("Error updating game instances:", error);
//      }
// });
