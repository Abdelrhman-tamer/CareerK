const nodemailer = require("nodemailer");

const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
  }
};

module.exports = sendOTPEmail; // ✅ Make sure it's exported correctly


