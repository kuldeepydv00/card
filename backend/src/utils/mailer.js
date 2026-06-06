const { Resend } = require('resend');

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (email, otp) => {
  // For local development without Resend key, just log it
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n============================`);
    console.log(`[DEVELOPMENT] OTP for ${email}: ${otp}`);
    console.log(`============================\n`);
    return true; 
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Card Game <onboarding@resend.dev>", // Required for testing domains
      to: email,
      subject: "Your Signup Verification OTP",
      html: `<b>Your OTP is: ${otp}</b><br/>It is valid for 5 minutes.`,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return false;
    }

    console.log("Message sent:", data.id);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = {
  sendOtpEmail
};
