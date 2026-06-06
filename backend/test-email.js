require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  console.log('Testing SMTP with:', process.env.SMTP_USER);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      subject: "Test Email",
      text: "Testing SMTP connection",
    });
    console.log("Success! Message ID:", info.messageId);
  } catch (error) {
    console.error("Failed to send:", error);
  }
}
test();
