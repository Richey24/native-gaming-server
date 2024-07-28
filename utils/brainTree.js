const braintree = require("braintree");

const gateway = braintree.connect({
     environment: braintree.Environment.Sandbox,
     merchantId: "your_merchant_id",
     publicKey: "your_public_key",
     privateKey: "your_private_key",
});

module.exports = gateway;
