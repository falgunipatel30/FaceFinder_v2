const mongoose = require("mongoose");
const { sendOtpEmail } = require("../utils/mailer");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  validity: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: String,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

otpSchema.pre("save", async function (next) {
  try {
    const success = await sendOtpEmail(this.email, this.otp);
    if (!success) {
      const err = new Error("Failed to send OTP email");
      return next(err);
    }
    next(); // Proceed to save the OTP if email is sent successfully
  } catch (error) {
    console.error("Error in pre-save hook:", error);
    next(error);
  }
});

const Otp = mongoose.model("Otp", otpSchema);
module.exports = Otp;
