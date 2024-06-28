const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please include your Full name"],
    },
    country: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Please include your email"],
    },
    password: {
      type: String,
      required: [true, "Please include your password"],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Ensure googleId is unique but can be null
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", ClientSchema);

Client.on("index", function (error) {
  // Check for index errors
  if (error) {
    console.error("Indexing error: ", error);
  }
});
module.exports = Client;
