const SubscriptionPlan = require("../../model/SubscriptionPlan");
const User = require("../../model/User");

exports.handleBraintreeWebhook = async (req, res) => {
     const webhookSignature = req.headers["bt-signature"];
     const webhookPayload = req.body;

     console.log("heyyy, calling the webwook");
     // Verify the webhook payload
     if (!verifyBraintreeWebhook(webhookSignature, webhookPayload)) {
          return res.status(400).send("Invalid webhook signature.");
     }

     try {
          const { kind, transaction } = webhookPayload;
          const userId = transaction.customFields.userId;
          const planId = transaction.customFields.planId;

          if (kind === "subscription_charged_successfully") {
               const subscription = await SubscriptionPlan.findById(planId);

               if (!subscription) {
                    return res.status(404).send("Subscription plan not found.");
               }

               const subscriptionEndDate = calculateSubscriptionEndDate(subscription);

               await User.findByIdAndUpdate(
                    userId,
                    {
                         subscription: {
                              plan: planId,
                              subscriptionEndDate,
                         },
                    },
                    { new: true, runValidators: true },
               );

               return res.status(200).send("User subscription updated successfully.");
          }

          res.status(200).send("Event received.");
     } catch (error) {
          console.error("Error handling webhook event:", error);
          res.status(500).send("Internal Server Error.");
     }
};

function verifyBraintreeWebhook(signature, payload) {
     return true;
}

function calculateSubscriptionEndDate(subscription) {
     const endDate = new Date();
     if (subscription.type === "monthly") {
          endDate.setMonth(endDate.getMonth() + 1);
     } else if (subscription.type === "yearly") {
          endDate.setFullYear(endDate.getFullYear() + 1);
     } else if (subscription.type === "one-off") {
          endDate.setDate(endDate.getDate() + (subscription.durationDays || 0));
     }
     return endDate;
}
