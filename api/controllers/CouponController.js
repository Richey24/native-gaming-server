const express = require("express");
const User = require("../../model/User");
const Coupon = require("../../model/Coupon");
const Client = require("../../model/Client");
const mongoose = require("mongoose");
const { sendCouponCode } = require("../../utils/sendMail");

exports.createCoupon = async (req, res) => {
  const {
    title,
    description,
    percentageOff,
    startDate,
    expiryDate,
    logo,
    totalUsage,
    code,
  } = req.body;
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const coupon = new Coupon({
      title,
      description,
      percentageOff,
      code,
      startDate,
      expiryDate,
      logo,
      totalUsage,
      user: userId,
    });
    await coupon.save();
    user.coupons.push(coupon._id);
    await user.save();

    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.useCoupon = async (req, res) => {
  const { couponId, userId, email, name, phone } = req.body;

  try {
    const coupon = await Coupon.findOne({ _id: couponId, user: userId });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    const currentDate = new Date();
    if (
      currentDate < coupon.startDate ||
      currentDate > coupon.expiryDate ||
      coupon.usageCount >= coupon.totalUsage
    ) {
      // Find another active coupon if available
      const anotherCoupon = await Coupon.findOne({
        user: userId,
        startDate: { $lte: currentDate },
        expiryDate: { $gte: currentDate },
        usageCount: { $lt: coupon.totalUsage },
      });

      if (anotherCoupon) {
        return sendCouponCode(anotherCoupon, email, name);
      } else {
        return res.status(400).json({ message: "No active coupon available" });
      }
    }

    coupon.usageCount += 1;
    await coupon.save();
    let client = await Client.findOne({ email, user: userId });
    if (!client) {
      client = new Client({
        fullname: name,
        email,
        phone,
        user: userId,
      });
      await client.save();

      // Add client to user's clients list
      const user = await User.findById(userId);
      user.clients.push(client._id);
      await user.save();
    }
    sendCouponCode(coupon, email, name);
    res.status(201).json({ message: "Coupon has been sent to your mail" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ coupons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteSingleCoupon = async (req, res) => {
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Coupon ID" });
  }
  try {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    await Coupon.findByIdAndDelete(id);
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.editSingleCoupon = async (req, res) => {
  const { id } = req.query;
  const {
    title,
    description,
    percentageOff,
    startDate,
    expiryDate,
    logo,
    totalUsage,
    code,
  } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid game ID" });
  }
  try {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      {
        title,
        description,
        percentageOff,
        startDate,
        logo,
        expiryDate,
        totalUsage,
        code,
      },
      { new: true, runValidators: true }
    );
    res
      .status(200)
      .json({ message: "Coupon updated successfully", coupon: updatedCoupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
