const ParticipantModel = require("../../model/ShoeContestParticipant.js.js");
const generateOtp = require("../../utils/generateOtp.js");
const { sendOtp } = require("../../utils/sendMail.js");

exports.ParticipantRegister = async (req, res) => {
  const { firstname, lastname, password, confirmPassword, email } = req.body;

  if (!firstname || !lastname || !password || !email || !confirmPassword) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  if (password !== confirmPassword) {
    return res
      .status(401)
      .json({ message: "password and confirm password do not match" });
  }
  try {
    let participant = await ParticipantModel.findOne({ email });
    let token;
    let participantWithoutPassword;
    if (participant) {
      return res
        .status(400)
        .json({
          message: "This user is already participating in this contest",
        });
    }
    const otp = generateOtp();
    console.log("otp sent", otp);
    participant = new ParticipantModel({
      firstname,
      lastname,
      password,
      email,
      otp,
    });
    await participant.save();
    await sendOtp(participant.email, participant.organizationName, otp, "participant");
    participantWithoutPassword = {
      _id: participant._id,
      firstname: participant.firstname,
      lastname: participant.lastname,
      email: participant.email,
      isVerified: participant.isVerified,
    };
    res.status(201).json({
      participant: participantWithoutPassword,
      token: token,
      message:
        "Participant registered successfully. An OTP code has been sent to your mail.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email or OTP cannot be empty" });
  }

  try {
    const participant = await ParticipantModel.findOne({ email, otp });
    if (!participant) {
      return res.status(400).json({ message: "Invalid OTP or email" });
    }
    participant.isVerified = true;
    participant.otp = undefined;
    await participant.save();
    res
      .status(200)
      .json({ message: "Account verified successfully",  });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};