const express = require("express");
const router = express.Router();

const userController = require("../controllers/UserController");
const asyncHandler = require("../../config/asyncHandler");
const authMiddleware = require("../../middleware/authMiddleware");

router.post("/register", asyncHandler(userController.vendorRegister));
router.post("/google-login", asyncHandler(userController.socialRegister));
router.post("/verify-otp", asyncHandler(userController.verifyOtp));
router.post("/login", asyncHandler(userController.vendorLogin));
router.post("/forgot-password", asyncHandler(userController.forgotPassword));
router.post("/reset-password", asyncHandler(userController.resetPassword));
router.put(
  "/update-user",
  authMiddleware,
  asyncHandler(userController.updateUserInfo)
);
router.get("/me", authMiddleware, asyncHandler(userController.getUserDetails));
router.get(
  "/get-clients",
  authMiddleware,
  asyncHandler(userController.getClients)
);
router.put(
  "/change-password",
  authMiddleware,
  asyncHandler(userController.changePassword)
);
router.post("/logout", authMiddleware, asyncHandler(userController.logout));
router.put(
  "/add-domain",
  authMiddleware,
  asyncHandler(userController.createDomainName)
);
router.post(
  "/subscribe-game",
  authMiddleware,
  asyncHandler(userController.subscribeToGame)
);
router.get(
  "/list-players",
  authMiddleware,
  asyncHandler(userController.getClientsWhoPlayedGame)
);
router.get(
  "/all-subscribed-game",
  authMiddleware,
  asyncHandler(userController.getAllSubscribedGames)
);

module.exports = router;
