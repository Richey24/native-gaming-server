const express = require("express");
const router = express.Router();

const couponController = require("../controllers/CouponController");
const asyncHandler = require("../../config/asyncHandler");
const authMiddleware = require("../../middleware/authMiddleware");

router.post(
  "/create",
  authMiddleware,
  asyncHandler(couponController.createCoupon)
);

router.post("/use", asyncHandler(couponController.useCoupon));
router.get("/", authMiddleware, asyncHandler(couponController.getAllCoupons));
router.delete(
  "/delete",
  authMiddleware,
  asyncHandler(couponController.deleteSingleCoupon)
);
router.put(
  "/update",
  authMiddleware,
  asyncHandler(couponController.editSingleCoupon)
);

module.exports = router;
