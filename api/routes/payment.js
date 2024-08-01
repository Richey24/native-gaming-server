// routes/PaymentRoutes.js

const express = require("express");
const { getToken, paymentCheckout } = require("../controllers/PaymentController");
const { handleBraintreeWebhook } = require("../controllers/WebhookController");
// const { handleBraintreeWebhook } = require("../controllers/WebhookController");

const router = express.Router();

router.get("/client_token", getToken);
router.post("/checkout", paymentCheckout);

router.post("/webhook/braintree", handleBraintreeWebhook);

module.exports = router;
