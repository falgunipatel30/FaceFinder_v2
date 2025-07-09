const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // Your email
    pass: process.env.MAIL_PASS, // App password (not your actual email password)
  },
});

async function sendOtpEmail(toEmail, otp) {
  const mailOptions = {
    from: `"FaceFinder" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Your FaceFinder OTP Code",
    html: `
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #222; font-size: 24px; margin-bottom: 10px;">FaceFinder</h1>
          <p style="font-size: 14px; color: #777;">Discover faces. Securely connect.</p>
        </div>
  
        <p style="font-size: 16px; line-height: 1.5;">
          Hello,
        </p>
  
        <p style="font-size: 16px; line-height: 1.5;">
          Your One-Time Password (OTP) for logging into FaceFinder is:
        </p>
  
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; background-color: #f3f3f3; border-radius: 6px; border: 1px dashed #ccc;">
            ${otp}
          </span>
        </div>
  
        <p style="font-size: 15px; line-height: 1.5; color: #555;">
          This OTP is valid for <strong>10 minutes</strong>. For your security, please do not share it with anyone.
        </p>
  
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  
        <p style="font-size: 13px; color: #aaa; text-align: center;">
          Didn’t request this code? Just ignore this email.
        </p>
  
        <p style="font-size: 13px; color: #aaa; text-align: center;">
          © ${new Date().getFullYear()} FaceFinder. All rights reserved.
        </p>
      </div>
      `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending FaceFinder OTP email:", error);
    return false;
  }
}

const sendResetPasswordEmail = async (toEmail, resetLink) => {
  const mailOptions = {
    from: `"FaceFinder" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Reset Your FaceFinder Password",
    html: `
        <div style="max-width: 600px; margin: auto; padding: 20px; font-family: sans-serif; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>You requested a password reset for your FaceFinder account.</p>
          <p>
            Click the button below to reset your password. This link will expire in 15 minutes.
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" style="padding: 12px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </div>
          <p>If you didn’t request this, please ignore this email.</p>
          <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} FaceFinder</p>
        </div>
      `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending reset email:", error);
    return false;
  }
};

module.exports = { sendOtpEmail, sendResetPasswordEmail };
