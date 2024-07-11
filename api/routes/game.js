const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../../model/Admin");

const gameController = require("../controllers/GameController");
const asyncHandler = require("../../config/asyncHandler");

const verifyAdmin = async (req, res, next) => {
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

router.get("/", asyncHandler(gameController.getAllGames));
router.delete(
  "/delete",
  verifyAdmin,
  asyncHandler(gameController.deleteSingleGame)
);

module.exports = router;
