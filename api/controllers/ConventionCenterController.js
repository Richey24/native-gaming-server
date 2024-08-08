const ConventionCenter = require("../../model/ConventionCenter");
const Otp = require("../../model/Otp");
const generateOtp = require("../../utils/generateOtp");
const { sendOtp, sendConventionCenterWelcomeMail } = require("../../utils/sendMail");
const { v4: uuidv4 } = require("uuid");
const braintree = require("braintree");
const gateway = require("../../utils/brainTree");
const jwt = require("jsonwebtoken");

//    address: {
//                          streetAddress: "123 Main St",
//                          locality: "Chicago",
//                          region: "IL",
//                          postalCode: "60622",
//                     },

exports.linkBankAccount = async (req, res) => {
     const { email, bankDetails, dateOfBirth, ssn, address } = req.body;

     try {
          const existingCenter = await ConventionCenter.findOne({ email });

          if (!existingCenter) {
               return res.status(404).json({ message: "Convention center not found" });
          }

          const { name, percentage } = existingCenter;

          const result = await gateway.merchantAccount.create({
               individual: {
                    firstName: name,
                    lastName: "",
                    email,
                    dateOfBirth,
                    ssn,
                    address,
               },
               funding: {
                    destination: braintree.MerchantAccount.FundingDestination.Bank,
                    accountNumber: bankDetails.accountNumber,
                    routingNumber: bankDetails.routingNumber,
               },
               tosAccepted: true,
               masterMerchantAccountId: process.env.BRAIN_TREE_MERCHANT_ACCOUNT_ID,
          });

          if (result.success) {
               existingCenter.connectedAccountId = result.merchantAccount.id;
               await existingCenter.save();

               res.status(200).json(existingCenter);
          } else {
               res.status(400).json({ message: result.message });
          }
     } catch (error) {
          console.error("Error linking bank account:", error);
          res.status(500).json({ message: "Server error" });
     }
};

exports.createConventionCenter = async (req, res) => {
     const {
          name,
          companyName,
          companyAddress,
          title,
          role,
          phone,
          altPhone,
          email,
          altEmail,
          altName,
          altTitle,
          website,
     } = req.body;

     if (!name || !companyName || !companyAddress || !title || !role || !phone || !email) {
          return res.status(400).json({ message: "All fields are required" });
     }

     try {
          const referralId = uuidv4();
          let user = await ConventionCenter.findOne({ email });
          console.log("usuus", user);
          if (user && user.email === email) {
               return res
                    .status(400)
                    .json({ message: "Email is tied to an existing Organization" });
          }
          const newConventionCenter = new ConventionCenter({
               name,
               companyName,
               companyAddress,
               title,
               role,
               phone,
               altPhone,
               email,
               altEmail,
               referralId,
               altName,
               altTitle,
               website,
          });
          sendConventionCenterWelcomeMail(email, name);
          await newConventionCenter.save();

          res.status(201).json({
               message: "Convention center created successfully",
               conventionCenter: newConventionCenter,
          });
     } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
     }
};

exports.getReferredUsers = async (req, res) => {
     const { referralId } = req.params;

     try {
          const conventionCenter = await ConventionCenter.findOne({ referralId }).populate(
               "referredUsers",
          );

          if (!conventionCenter) {
               return res.status(404).json({ message: "Convention center not found" });
          }

          res.status(200).json({ referredUsers: conventionCenter.referredUsers });
     } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
     }
};

exports.getAllConventionCenters = async (req, res) => {
     try {
          const conventionCenters = await ConventionCenter.find();
          res.status(200).json({ conventionCenters });
     } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
     }
};

exports.requestOtp = async (req, res) => {
     const { email } = req.body;

     if (!email) {
          return res.status(400).json({ message: "Email is required" });
     }

     try {
          const conventionCenter = await ConventionCenter.findOne({ email });

          if (!conventionCenter) {
               return res.status(404).json({ message: "Convention center not found" });
          }

          const otp = generateOtp();
          console.log("otpppp", otp);
          await Otp.create({ email, otp });

          sendOtp(conventionCenter.email, conventionCenter.name, otp, "convention");
          res.status(200).json({ message: "OTP sent to email" });
     } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
     }
};

exports.verifyOtp = async (req, res) => {
     const { email, otp } = req.body;

     if (!email || !otp) {
          return res.status(400).json({ message: "Email and OTP are required" });
     }

     try {
          const otpRecord = await Otp.findOne({ email, otp });

          if (!otpRecord) {
               return res.status(400).json({ message: "Invalid OTP" });
          }

          await Otp.deleteOne({ _id: otpRecord._id });
          const conventionCenter = await ConventionCenter.findOne({ email });
          console.log("covetntion center", conventionCenter);
          // You may want to generate a token here for authenticated sessions
          // const token = generateToken(conventionCenter._id);
          const token = jwt.sign(
               { id: conventionCenter._id, email: conventionCenter.email },
               "conventionsecret",
               { expiresIn: "1h" }, // Token expires in 1 hour
          );

          res.status(200).json({
               message: "OTP verified, login successful",
               token,
               conventionCenter,
          });
     } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
     }
};
