const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please include the coupon title"],
    },
    description: {
      type: String,
      required: [true, "Please include the coupon description"],
    },
    code: {
      type: String,
      required: [true, "Please include the coupon code"],
    },
    percentageOff: {
      type: Number,
      required: [true, "Please include the percentage off"],
    },
    startDate: {
      type: Date,
      required: [true, "Please include the start date"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Please include the expiry date"],
    },
    logo: {
      type: String,
    },
    totalUsage: {
      type: Number,
      required: [true, "Please include the total number of usage"],
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", CouponSchema);
module.exports = Coupon;
