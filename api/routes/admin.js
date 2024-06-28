const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../../model/Admin");

const authAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");
    const decoded = jwt.verify(token, "adminsecret");
    const admin = await Admin.findOne({
      _id: decoded._id,
      "tokens.token": token,
    }).select("-password");

    if (!admin) {
      throw new Error();
    }

    req.token = token;
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate as admin." });
  }
};

const adminController = require("../controllers/AdminController");
const asyncHandler = require("../../config/asyncHandler");

router.post("/login", asyncHandler(adminController.login));
router.post("/verify-otp", asyncHandler(adminController.verifyOtp));
router.get("/me", authAdmin, asyncHandler(adminController.getAdminDetails));
router.get(
  "/get-vendors",
  authAdmin,
  asyncHandler(adminController.getAllVendors)
);
router.get(
  "/get-single-vendor",
  authAdmin,
  asyncHandler(adminController.getUserWithClients)
);
router.get(
  "/get-admins",
  authAdmin,
  asyncHandler(adminController.getAllAdmins)
);

module.exports = router;
