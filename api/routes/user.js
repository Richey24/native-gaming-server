const express = require("express");
const router = express.Router();

const userController = require("../controllers/UserController");
const asyncHandler = require("../../config/asyncHandler");

router.post("/register", asyncHandler(userController.vendorRegister));
router.post("/verify-otp", asyncHandler(userController.verifyOtp));
router.post("/login", asyncHandler(userController.vendorLogin));
router.post("/forgot-password", asyncHandler(userController.forgotPassword));

module.exports = router;
