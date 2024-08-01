// controllers/paymentController.js

const gateway = require("../../utils/brainTree");

exports.getToken = async (req, res) => {
     try {
          const response = await gateway.clientToken.generate({});
              res.status(200).json({ clientToken: response.clientToken });
     } catch (err) {
          res.status(500).json({ error: err.message });
     }
};

exports.paymentCheckout = async (req, res) => {
     const { paymentMethodNonce, amount } = req.body;

     try {
          const result = await gateway.transaction.sale({
               amount: amount,
               paymentMethodNonce: paymentMethodNonce,
               options: {
                    submitForSettlement: true,
               },
          });

          if (result.success) {
               res.status(200).json({ result });
          } else {
               res.status(500).json({ error: result.message });
          }
     } catch (err) {
          res.status(500).json({ error: err.message });
     }
};
