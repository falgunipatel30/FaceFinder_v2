const User = require("../model/User");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = uuidv4();
const Otp = require("../model/otp");
const { sendResetPasswordEmail } = require("../utils/mailer");

const register = async (req, res) => {
  try {
    const { username, email, password, otp } = req.body;

    if (!username || !email || !password || !otp) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUsername = await User.findOne({ username: username });

    if (existingUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email: email });

    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const otpEntry = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpEntry) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (otpEntry.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date(otpEntry.validity) < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      userId: uuid,
      username,
      email,
      password: hashedPassword,
    });

    res.status(200).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering" });
  }
};

const login = async (req, res) => {
  try {
    const { user, password } = req.body;

    if (!user || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ username: user }, { email: user }],
    });

    if (!existingUser) {
      return res.status(401).json({ message: "User doesn't exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { userId: existingUser.userId },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      message: "Logged in successfully",
      success: true,
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (existingOtp && new Date(existingOtp.validity) > new Date()) {
      // Still valid → resend same OTP (trigger save to run pre-save hook)
      existingOtp.validity = new Date(Date.now() + 10 * 60 * 1000); // +10 minutes
      existingOtp.updatedAt = new Date();
      await existingOtp.save();

      return res.status(200).json({
        message: "OTP resent and validity extended",
      });
    }

    // Else, generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const validity = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const newOtp = new Otp({
      email,
      otp,
      validity,
    });

    await newOtp.save();

    return res.status(200).json({
      message: "New OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while sending OTP",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email ID Required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email not found" });
    }

    // Create a JWT token with short expiry (e.g., 15 min)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Create the password reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Send reset email
    await sendResetPasswordEmail(email, resetLink);

    return res.status(200).json({
      message: "Reset password email sent successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error sending reset pass request",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    // Verify the JWT token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({
      message: "Error while resetting the password",
    });
  }
};

module.exports = { register, login, sendOtp, forgotPassword, resetPassword };
