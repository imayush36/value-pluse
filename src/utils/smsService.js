// Value Plus Real SMS & WhatsApp OTP Delivery Service

export const smsService = {
  /**
   * Send Real SMS via Fast2SMS (Free Indian SMS Gateway)
   * Gets API key from localStorage - user must configure once
   */
  sendSmsOtp: async (phone, otpCode) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const apiKey = localStorage.getItem('valueplus_fast2sms_key');

    if (!apiKey) {
      // No API key configured yet - silently skip (no popup on laptop)
      console.warn('[ValuePlus] Fast2SMS API key not set. OTP not sent via SMS.');
      return { success: false, reason: 'no_api_key' };
    }

    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables_values: otpCode,
          route: 'otp',
          numbers: cleanPhone,
        }),
      });

      const data = await response.json();
      if (data.return === true) {
        console.log(`[ValuePlus] OTP SMS sent to +91 ${cleanPhone}`);
        return { success: true, data };
      } else {
        console.error('[ValuePlus] Fast2SMS error:', data.message);
        return { success: false, data };
      }
    } catch (e) {
      console.error('[ValuePlus] SMS dispatch error:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Send Real Email OTP using Web3Forms (zero-setup, free, real inbox delivery)
   */
  sendRealEmailOtp: async (email, otpCode, userName = 'Valued Customer') => {
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: '5f95f4e0-9e6b-4e12-b13c-77eb67eb7a8d',
          subject: `🔐 Your Value Plus OTP: ${otpCode}`,
          from_name: 'Value Plus Megastore Security',
          email: email,
          name: userName,
          message: `Hello ${userName},\n\nYour one-time verification code for Value Plus is:\n\n${otpCode}\n\nThis OTP is valid for 5 minutes. Do NOT share this with anyone.\n\nWarm regards,\nValue Plus Electronics Megastore`,
        }),
      });

      const data = await response.json();
      return { success: data.success, data };
    } catch (e) {
      console.error('[ValuePlus] Email OTP dispatch error:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Save Fast2SMS API key in browser storage
   */
  saveApiKey: (key) => {
    localStorage.setItem('valueplus_fast2sms_key', key.trim());
  },

  /**
   * Get saved API key
   */
  getApiKey: () => {
    return localStorage.getItem('valueplus_fast2sms_key') || '';
  },

  /**
   * Check if API key is configured
   */
  isApiKeySet: () => {
    return Boolean(localStorage.getItem('valueplus_fast2sms_key'));
  },
};
