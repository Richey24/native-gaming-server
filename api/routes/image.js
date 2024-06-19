const express = require('express');
const multer = require('multer');
const imageController = require('../controllers/imageController');
const router = express.Router();
const upload = multer({ dest: "./upload" })

router.post("/upload", upload.single("image"), imageController)

module.exports = router