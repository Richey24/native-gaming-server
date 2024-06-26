const express = require("express");
const router = express.Router();

const participantController = require("../controllers/ShowParticipantController");
const asyncHandler = require("../../config/asyncHandler");

router.post("/participant/register", asyncHandler(participantController.ParticipantRegister));
router.post("/participant/verify-otp", asyncHandler(participantController.verifyOtp));


module.exports = router;
