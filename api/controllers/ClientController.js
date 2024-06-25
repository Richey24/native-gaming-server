const Client = require("../../model/Client");
const User = require("../../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerClient = async (req, res) => {
  const { userId, fullname, country, email, password, confirmPassword } =
    req.body;

  if (!userId) {
    return res.status(400).json({ message: "Vendor id is required" });
  } else if (!email) {
    return res.status(400).json({ message: "Email is required" });
  } else if (!fullname) {
    return res.status(400).json({ message: "Fullname is required" });
  }

  if (password !== confirmPassword) {
    return res
      .status(401)
      .json({ message: "password and confirm password do not match" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const existingClient = await Client.findOne({ email, user: userId });
    if (existingClient) {
      return res
        .status(400)
        .json({ message: "Client already registered under this vendor" });
    }
    const hashedPassword = await bcrypt.hash(password, 8);

    const client = new Client({
      fullname,
      country,
      email,
      password: hashedPassword,
      user: userId,
    });
    await client.save();
    res.status(201).json({ message: "Client registered successfully", client });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginClient = async (req, res) => {
  const { userId, email, password } = req.body;
  try {
    const client = await Client.findOne({ email, user: userId });
    if (!client) {
      return res.status(400).json({ message: "Invalid login credentials" });
    }

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password inputed" });
    }
    const userWithoutPassword = {
      _id: client._id,
      fullname: client.fullname,
      country: client.country,
      email: client.email,
    };
    const token = jwt.sign(
      { id: client._id, user: userId, email: email },
      "client secret",
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Error logging in client:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
