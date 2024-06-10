const express = require("express");
const router = express.Router();

const adminController = require("../controllers/AdminController");
const asyncHandler = require("../../config/asyncHandler");

router.post("/login", asyncHandler(adminController.login));
router.post("/verify-otp", asyncHandler(adminController.verifyOtp));

module.exports = router;
