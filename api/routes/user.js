const express = require("express");
const router = express.Router();
const auth = require("../../config/auth");

const userController = require("../controllers/UserController");
const asyncHandler = require("../../config/asyncHandler");

router.post("/register", asyncHandler(userController.vendorRegister));
router.post("/google-login", asyncHandler(userController.socialRegister));
router.post("/verify-otp", asyncHandler(userController.verifyOtp));
router.post("/login", asyncHandler(userController.vendorLogin));
router.post("/forgot-password", asyncHandler(userController.forgotPassword));
router.post("/reset-password", asyncHandler(userController.resetPassword));

module.exports = router;
