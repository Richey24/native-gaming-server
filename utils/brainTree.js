const braintree = require("braintree");

const gateway = new braintree.BraintreeGateway({
     environment: braintree.Environment.Sandbox,
     merchantId: "kb9tcfssdvnbvyqk",
     publicKey: "fb85s5djff88krrq",
     privateKey: "2c99b1f9c276086c5b1c1f2b982dcb84",
});

module.exports = gateway;
