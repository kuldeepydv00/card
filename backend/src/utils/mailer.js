const sendOtpEmail = async (email, otp) => {
  // For local development without Brevo key, just log it
  if (!process.env.BREVO_API_KEY) {
    console.log(`\n============================`);
    console.log(`[DEVELOPMENT] OTP for ${email}: ${otp}`);
    console.log(`============================\n`);
    return true; 
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          email: process.env.SMTP_FROM || "kuldeepyadav200507@gmail.com",
          name: "Card Game Admin"
        },
        to: [{ email: email }],
        subject: "Your Signup Verification OTP",
        htmlContent: `<b>Your OTP is: ${otp}</b><br/>It is valid for 5 minutes.`
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Brevo API Error:", errorData);
      return false;
    }

    const data = await response.json();
    console.log("Message sent via Brevo:", data.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = {
  sendOtpEmail
};
