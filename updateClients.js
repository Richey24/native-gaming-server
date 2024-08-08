const mongoose = require("mongoose");
require("dotenv").config();
const Client = require("./model/Client");
const User = require("./model/User");

mongoose
     .connect(process.env.MONGO_URL)
     .then(() => {
          console.log("Database is connected");
     })
     .catch((err) => {
          console.log({ database_error: err });
     });

// const resetTemporaryFlags = async () => {
//      try {
//           const result = await Client.updateMany(
//                { temporaryFlag: true },
//                { $set: { temporaryFlag: false } },
//           );

//           if (result) {
//                console.log(
//                     `Matched ${result.matchedCount} documents and modified ${result.modifiedCount} documents.`,
//                );
//           } else {
//                console.log("No documents matched or modified.");
//           }

//           mongoose.connection.close();
//      } catch (error) {
//           console.error("Error resetting temporary flags:", error);
//           mongoose.connection.close();
//      }
// };

const resetTemporaryFlags = async () => {
     try {
          // Find all users
          const users = await User.find().populate("clients");

          for (const user of users) {
               let hasChanged = false;

               // Iterate through each client and reset the temporaryFlag
               for (const client of user.clients) {
                    if (client.temporaryFlag === true) {
                         client.temporaryFlag = false;
                         hasChanged = true;
                    }
               }

               // Save the user if any client flag was changed
               if (hasChanged) {
                    await user.save();
               }
          }

          console.log("All temporary flags have been reset.");
          mongoose.connection.close();
     } catch (error) {
          console.error("Error resetting temporary flags:", error);
          mongoose.connection.close();
     }
};

resetTemporaryFlags();
