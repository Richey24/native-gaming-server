const Adminuser = require("../../model/Admin");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please enter an email" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password cannot be empty" });
  }

  try {
    let admin = await Adminuser.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.log(isMatch);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = { id: admin.id, email: admin.email };
    const token = jwt.sign(payload, "turkeyhunt", { expiresIn: "1h" });

    res.json({ token });
    // const existingUser = await Adminuser.findByCredentials(email, password);
    // if (!existingUser)
    //   return res.status(400).json({
    //     message: "Login failed! Check authenthication credentails",
    //   });

    // const payload = { adminId: existingUser.id };
    // const token = jwt.sign(payload, "turkeyhunt", { expiresIn: "1h" });

    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email or OTP cannot be empty" });
  }

  try {
    const user = await Adminuser.findOne({ email, otp });
    if (!user) {
      return res.status(400).json({ message: "Invalid OTP or email" });
    }
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    res.status(200).json({ message: "Account verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
