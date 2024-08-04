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

const conventionAuthMiddleware = (req, res, next) => {
     const token = req.header("Authorization").replace("Bearer ", "");

     if (!token) {
          return res.status(401).json({ message: "No token, authorization denied" });
     }

     try {
          const decoded = jwt.verify(token, "conventionsecret");
          req.user = decoded;
          next();
     } catch (err) {
          res.status(401).json({ message: "Token is not valid" });
     }
};

const asyncHandler = require("../../config/asyncHandler");
const conventionCenterController = require("../controllers/ConventionCenterController");

router.get("/", authAdmin, asyncHandler(conventionCenterController.getAllConventionCenters));
router.get(
     "/get-vendors/:referralId",
     conventionAuthMiddleware,
     asyncHandler(conventionCenterController.getReferredUsers),
);
router.post("/create", authAdmin, asyncHandler(conventionCenterController.createConventionCenter));
router.post("/link-bank-details", asyncHandler(conventionCenterController.linkBankAccount));
router.post("/request-otp", asyncHandler(conventionCenterController.requestOtp));

// Verify OTP
router.post("/verify-otp", asyncHandler(conventionCenterController.verifyOtp));

module.exports = router;
