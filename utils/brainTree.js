const braintree = require("braintree");

const gateway = new braintree.BraintreeGateway({
     environment: braintree.Environment.Sandbox,
     merchantId: process.env.BRAIN_TREE_MERCHANT_ACCOUNT_ID,
     publicKey: process.env.BRAIN_TREE_PUBLIC_KEY,
     privateKey: process.env.BRAIN_TREE_PRIVATE_KEY,
});

exports.paymentCheckout = async (req, res) => {
     const { paymentMethodNonce, amount, userId, planId } = req.body;

     try {
          const result = await gateway.transaction.sale({
               amount,
               paymentMethodNonce,
               options: {
                    submitForSettlement: true,
               },
               customFields: {
                    userId,
                    planId,
               },
          });

          if (result.success) {
               res.status(200).json({ result: result.transaction });
          } else {
               res.status(500).json({ error: result.message });
          }
     } catch (error) {
          console.error("Payment error:", error);
          res.status(500).json({ message: "Server error" });
     }
};

module.exports = gateway;
