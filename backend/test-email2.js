const nodemailer = require('nodemailer');

async function test() {
  const email = 'kuldeepyadav200507@gmail.com';
  console.log('Testing SMTP with:', email);
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: email,
      pass: 'oviommpxxsxjqcrd',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: email,
      to: email,
      subject: "Test Email",
      text: "Testing SMTP connection",
    });
    console.log("Success! Message ID:", info.messageId);
  } catch (error) {
    console.error("Failed to send:", error.message);
  }
}
test();
