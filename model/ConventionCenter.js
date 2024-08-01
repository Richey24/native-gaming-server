const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conventionCenterSchema = new Schema(
     {
          name: { type: String, required: true },
          companyName: { type: String, required: true },
          companyAddress: { type: String, required: true },
          title: { type: String, required: true },
          role: { type: String, required: true },
          phone: { type: String, required: true },
          altPhone: { type: String },
          email: { type: String, required: true },
          altEmail: { type: String },
          referralId: { type: String, unique: true, required: true },
          referredUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
     },
     { timestamps: true },
);

const ConventionCenter = mongoose.model("ConventionCenter", conventionCenterSchema);

module.exports = ConventionCenter;
