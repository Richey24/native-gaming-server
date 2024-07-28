const express = require("express");
const { getToken, paymentCheckout } = require("../controllers/PaymentController");

const router = express.Router();

router.get("/client_token", getToken);
router.post("/checkout", paymentCheckout);

module.exports = router;
