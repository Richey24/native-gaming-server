const ConventionCenter = require("../../model/ConventionCenter");
const { v4: uuidv4 } = require("uuid");

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
