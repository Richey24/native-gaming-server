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
    durationDays: { type: Number }, // only used if type is 'one-off'
  },
  {
    timestamps: true,
  }
);

const SubscriptionPlan = mongoose.model(
  "SubscriptionPlan",
  SubscriptionPlanSchema
);
module.exports = SubscriptionPlan;
