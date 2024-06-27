const ParticipantModel = require("../../model/ShoeContestParticipant.js.js");
const generateOtp = require("../../utils/generateOtp.js");
const { sendOtp } = require("../../utils/sendMail.js");

exports.ParticipantRegister = async (req, res) => {
  const { firstname, lastname, password, confirmPassword, email, phone, gender } = req.body;

  if (!firstname || !lastname ||  !email || !phone || !gender) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    let participant = await ParticipantModel.findOne({ $or: [{ email }, { phone }] });
    let token;
    let participantWithoutPassword;

    if (participant) {
      if (!participant.isVerified) {
        const otp = generateOtp();
        participant.otp = otp;
        await participant.save();
        sendOtp(participant.email, participant.organizationName, otp, "participant");
        return res.status(200).json({
          status: "not_verified",
          message: "Participant is already registered but not verified. A new OTP has been sent to your email.",
        });
      }
      if (participant.email === email) {
        return res.status(400).json({
          message: "This user is already participating in this contest with this email",
        });
      }
      if (participant.phone === phone) {
        return res.status(400).json({
          message: "This phone number is already associated with another participant",
        });
      }
    }
    const otp = generateOtp();
    console.log("OTP sent", otp);
    participant = new ParticipantModel({
      firstname,
      lastname,
      password,
      email,
      phone,
      gender,
      otp,
    });
    await participant.save();
    await sendOtp(participant.email, participant.organizationName, otp, "participant");

    participantWithoutPassword = {
      _id: participant._id,
      firstname: participant.firstname,
      lastname: participant.lastname,
      email: participant.email,
      phone: participant.phone,
      gender: participant.gender,
      isVerified: participant.isVerified,
    };

    res.status(201).json({
      participant: participantWithoutPassword,
      token: token,
      message: "Participant registered successfully. An OTP code has been sent to your mail.",
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