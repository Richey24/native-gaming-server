const cron = require("node-cron");
const User = require("./model/User");
const Client = require("./model/Client");
const { GameInstance } = require("./model/GameInstance");

const timeouts = new Map();

const addTemporaryFlagToClient = async (userId, gameInstance) => {
     try {
          const user = await User.findById(userId).populate("clients");
          if (!user || !user.clients.length) {
               console.log(`No clients found for user ${userId}`);
               return;
          }

          const existingClientWithFlag = user.clients.find((client) => client.temporaryFlag);
          let selectedClient;
          if (existingClientWithFlag) {
               console.log(`Client ${existingClientWithFlag._id} already has a temporary flag.`);
               selectedClient = existingClientWithFlag;
          } else {
               // Select a random client
               const randomClientIndex = Math.floor(Math.random() * user.clients.length);
               selectedClient = user.clients[randomClientIndex];

               // Set the temporary flag
               selectedClient.temporaryFlag = true;
               selectedClient.flagExpiryTime = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes from now
               await selectedClient.save();
               console.log(`Temporary flag added to client ${selectedClient._id}`);
          }

          // Set a timeout to perform actions 2 minutes after the status changes to open
          const timeoutId = setTimeout(async () => {
               try {
                    const updatedGameInstance = await GameInstance.findById(gameInstance._id);
                    if (updatedGameInstance.status === "open") {
                         const client = await Client.findById(selectedClient._id);

                         if (client) {
                              const reward = updatedGameInstance.periods.find(
                                   (period) => period.rewards,
                              )?.rewards[0];

                              if (reward) {
                                   // Add client to gameInstance.clientsPlayed and other updates
                                   updatedGameInstance.clientsPlayed.push(client._id);
                                   client.gamesPlayed.push({
                                        gameInstance: updatedGameInstance._id,
                                        playedAt: new Date(),
                                   });
                                   updatedGameInstance.clientsWon.push({
                                        client: client._id,
                                        reward: reward._id,
                                   });
                                   client.gamesWon.push({
                                        gameInstance: updatedGameInstance._id,
                                        playedAt: new Date(),
                                        rewardTitle: reward.title,
                                        rewardImage: reward.image,
                                        rewardId: reward._id,
                                   });

                                   await client.save();
                                   await updatedGameInstance.save();

                                   console.log(
                                        `Client ${client._id} updated with game instance ${updatedGameInstance._id} and reward ${reward.title}`,
                                   );

                                   // Send winning message
                                   await sendWinningMessage(user, client, reward);
                              } else {
                                   console.error(`No reward found for the game instance.`);
                              }
                         }
                    } else {
                         console.log(
                              `Game instance ${updatedGameInstance._id} status is not open. Skipping operations.`,
                         );
                    }
               } catch (error) {
                    console.error(`Error updating client and game instance: ${error.message}`);
               } finally {
                    // Clear the timeout from the map after it's executed
                    timeouts.delete(gameInstance._id);
               }
          }, 2 * 60 * 1000); // 2 minutes

          // Store the timeout ID in the map
          timeouts.set(gameInstance._id, timeoutId);
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
                                   addTemporaryFlagToClient(user._id, gameInstance);
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

cron.schedule("* * * * *", async () => {
     try {
          const now = new Date();

          // Find clients with expired flags
          const clients = await Client.find({
               temporaryFlag: true,
               flagExpiryTime: { $lte: now },
          });

          for (const client of clients) {
               client.temporaryFlag = false;
               client.flagExpiryTime = null;
               await client.save();
               console.log(`Temporary flag removed from client ${client._id}`);
          }
     } catch (error) {
          console.error(`Error removing temporary flags: ${error.message}`);
     }
});
