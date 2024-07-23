const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Client = require("../../model/Client");

const clientController = require("../controllers/ClientController");
const asyncHandler = require("../../config/asyncHandler");

const clientAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }
    const decoded = jwt.verify(token, "Clientsecret");
    req.client = decoded._id;

    const user = await Client.findOne({
      _id: decoded._id,
      "tokens.token": token,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.client = user;
    req.token = token;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

router.post("/register", asyncHandler(clientController.registerClient));
router.post("/login", asyncHandler(clientController.loginClient));
router.post(
  "/google-register",
  asyncHandler(clientController.socialRegisterClient)
);
router.post(
  "/game-instance-play",
  clientAuthMiddleware,
  asyncHandler(clientController.playGame)
);

module.exports = router;
