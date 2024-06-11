const express = require("express");
const router = express.Router();

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");
    const decoded = jwt.verify(token, "adminsecret");
    req.userData = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Authentification Failed",
    });
  }
};

const adminController = require("../controllers/AdminController");
const asyncHandler = require("../../config/asyncHandler");

router.post("/login", asyncHandler(adminController.login));
router.post("/verify-otp", asyncHandler(adminController.verifyOtp));

module.exports = router;
