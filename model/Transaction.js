const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
     conventionCenterId: { type: mongoose.Schema.Types.ObjectId, ref: "SubDistributor" },
     amount: { type: Number, required: true },
     referralCode: { type: String },
     platformShare: { type: Number },
     subDistributorShare: { type: Number },
     status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
     createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;
