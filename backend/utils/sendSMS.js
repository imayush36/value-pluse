/**
 * Utility to send SMS or log OTP for development/fallback mode
 */
const sendSMS = async (phone, otp) => {
  try {
    // In production, integrate with Twilio / 2Factor / MSG91 here:
    // e.g., await axios.post(`https://2factor.in/API/V1/${apiKey}/${phone}/${otp}`);
    
    console.log(`[SMS OTP Log] -------------------------------------`);
    console.log(`[SMS OTP Log] Sent to +91 ${phone}`);
    console.log(`[SMS OTP Log] OTP Code: ${otp}`);
    console.log(`[SMS OTP Log] -------------------------------------`);

    return true;
  } catch (error) {
    console.error('SMS sending error:', error.message);
    return false;
  }
};

module.exports = sendSMS;
