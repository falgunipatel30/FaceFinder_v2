const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();

const {
  login,
  register,
  sendOtp,
  forgotPassword,
  resetPassword,
} = require("../controller/auth");

router.post("/register", upload.none(), register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
