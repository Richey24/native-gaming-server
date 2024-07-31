const braintree = require("braintree");

const gateway = new braintree.BraintreeGateway({
     environment: braintree.Environment.Sandbox,
     merchantId: "kb9tcfssdvnbvyqk",
     publicKey: "fb85s5djff88krrq",
     privateKey: "2c99b1f9c276086c5b1c1f2b982dcb84",
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
