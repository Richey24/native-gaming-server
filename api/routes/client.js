const express = require("express");
const router = express.Router();

const clientController = require("../controllers/ClientController");
const asyncHandler = require("../../config/asyncHandler");

router.post("/register", asyncHandler(clientController.registerClient));
router.post("/login", asyncHandler(clientController.loginClient));

module.exports = router;
