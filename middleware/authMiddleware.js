const jwt = require("jsonwebtoken");
const User = require("../model/User");

const authMiddleware = async (req, res, next) => {
     try {
          const token = req.headers.authorization.replace("Bearer ", "");
          console.log({ token });
          if (!token) {
               return res.status(401).json({ message: "No token, authorization denied" });
          }
          const decoded = jwt.verify(token, "secret");
          req.user = decoded._id;

          const user = await User.findOne({
               _id: decoded._id,
               "tokens.token": token,
          })
               .populate({
                    path: "subscription.plan",
                    select: "name type price durationDays description features startDate endDate",
               })
               .select("-password");

          if (!user) {
               return res.status(404).json({ message: "User not found" });
          }
          console.log({ user });
          req.user = user;
          req.token = token;
          next();
     } catch (error) {
          console.error("Token verification failed:", error);
          res.status(401).json({ message: "Token is not valid" });
     }
};

module.exports = authMiddleware;
