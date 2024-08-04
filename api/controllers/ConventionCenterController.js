const ConventionCenter = require("../../model/ConventionCenter");
const { v4: uuidv4 } = require("uuid");
const braintree = require("braintree");
const gateway = require("../../utils/brainTree");

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
     const { name, companyName, companyAddress, title, role, phone, altPhone, email, altEmail } =
          req.body;

     if (!name || !companyName || !companyAddress || !title || !role || !phone || !email) {
          return res.status(400).json({ message: "All fields are required" });
     }

     try {
          const referralId = uuidv4();

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
          });

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
