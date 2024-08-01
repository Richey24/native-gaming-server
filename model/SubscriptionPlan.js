const mongoose = require("mongoose");

const SubscriptionPlanSchema = new mongoose.Schema(
     {
          name: { type: String, required: true },
          type: {
               type: String,
               enum: ["monthly", "yearly", "one-off"],
               required: true,
          },
          price: { type: Number, required: true },
          durationDays: { type: Number },
          description: { type: String },
          features: [{ type: String }],
          startDate: { type: Date, default: Date.now },
          endDate: { type: Date },
     },
     {
          timestamps: true,
     },
);

const SubscriptionPlan = mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
module.exports = SubscriptionPlan;
