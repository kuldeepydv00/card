const nodemailer = require('nodemailer');
const winston = require('winston'); // Assuming winston is used for logging based on package.json

// Set up a simple logger if needed, or use the global one if exists. 
// We'll just use console for simple setup if env vars aren't provided.

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOtpEmail = async (email, otp) => {
  // For local development without SMTP, we just log it and return success
  if (!process.env.SMTP_USER) {
    console.log(`\n============================`);
    console.log(`[DEVELOPMENT] OTP for ${email}: ${otp}`);
    console.log(`============================\n`);
    return true; 
  }

  try {
    const info = await transporter.sendMail({
      from: `"Card Game Admin" <${process.env.SMTP_FROM || 'admin@example.com'}>`,
      to: email,
      subject: "Your Signup Verification OTP",
      text: `Your OTP for signup is: ${otp}. It is valid for 5 minutes.`,
      html: `<b>Your OTP for signup is: ${otp}</b><br/>It is valid for 5 minutes.`,
    });
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = {
  sendOtpEmail
};
