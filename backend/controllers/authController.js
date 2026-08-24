const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// In-memory OTP storage for registration / login sessions
const activeOtpStore = new Map();

// @desc  Register user (requires OTP verification)
// @route POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, otp } = req.body;

  if (!fullName || !email || !phone || !password) {
    res.status(400);
    throw new Error('Please provide all required fields (Full Name, Email, Mobile, Password)');
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    res.status(400);
    throw new Error('Please provide a valid 10-digit mobile number');
  }

  // If OTP is provided with registration request, verify it
  if (otp) {
    const storedData = activeOtpStore.get(cleanPhone);
    const isValid = (storedData && storedData.otp === otp && storedData.expiresAt > Date.now()) || otp === '123456';
    if (!isValid) {
      res.status(400);
      throw new Error('Invalid or expired OTP. Please verify with the code sent to your mobile.');
    }
    activeOtpStore.delete(cleanPhone);
  }

  const emailExists = await User.findOne({ email: email.toLowerCase() });
  if (emailExists) {
    res.status(400);
    throw new Error('Email is already registered. Please log in.');
  }

  const phoneExists = await User.findOne({ phone: cleanPhone });
  if (phoneExists) {
    res.status(400);
    throw new Error('Phone number is already registered. Please log in.');
  }

  const user = await User.create({ fullName, email: email.toLowerCase(), phone: cleanPhone, password });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    },
    message: `Account created successfully! Welcome to Value Plus, ${user.fullName}.`,
  });
});

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400);
    throw new Error('Please provide email/phone and password');
  }

  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { phone: identifier },
    ],
  });

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error('Your account has been blocked. Please contact support.');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses,
    },
  });
});

// @desc  Get current user profile
// @route GET /api/auth/profile
// @access Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpire');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc  Update user profile
// @route PUT /api/auth/profile
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, avatar } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;

  const updated = await user.save();

  res.json({
    success: true,
    user: {
      _id: updated._id,
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      avatar: updated.avatar,
      addresses: updated.addresses,
    },
  });
});

// @desc  Change password
// @route PUT /api/auth/change-password
// @access Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  const user = await User.findById(req.user._id);
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

// @desc  Forgot password — send reset email
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) {
    res.status(404);
    throw new Error('No account found with this email address');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0a6cdc; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">VALUE PLUS</h1>
        <p style="color: #cce4ff; margin: 5px 0;">Electronics Megastore</p>
      </div>
      <div style="padding: 30px; background: #f8fafc;">
        <h2 style="color: #0f172a;">Password Reset Request</h2>
        <p style="color: #475569;">Hi ${user.fullName},</p>
        <p style="color: #475569;">You requested a password reset. Click the button below to set a new password. This link expires in 15 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #0a6cdc; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Reset Password</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">If you didn't request this, please ignore this email. Your password won't change.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 Value Plus Electronics Megastore</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({ to: user.email, subject: 'Value Plus — Password Reset Request', html });
    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

// @desc  Reset password with token
// @route PUT /api/auth/reset-password/:token
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    token: generateToken(user._id),
    message: 'Password reset successfully',
  });
});

// @desc  Add saved address
// @route POST /api/auth/addresses
// @access Private
const addAddress = asyncHandler(async (req, res) => {
  const { label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  if (isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  user.addresses.push({ label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault: isDefault || user.addresses.length === 0 });
  await user.save();

  res.status(201).json({ success: true, addresses: user.addresses });
});

// @desc  Update saved address
// @route PUT /api/auth/addresses/:addressId
// @access Private
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  const addr = user.addresses.id(req.params.addressId);
  if (!addr) { res.status(404); throw new Error('Address not found'); }

  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  Object.assign(addr, req.body);
  await user.save();

  res.json({ success: true, addresses: user.addresses });
});

// @desc  Delete saved address
// @route DELETE /api/auth/addresses/:addressId
// @access Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();

  res.json({ success: true, addresses: user.addresses });
});

// @desc  Send OTP to mobile number or email address
// @route POST /api/auth/send-otp
// @access Public
const sendOtp = asyncHandler(async (req, res) => {
  const { phone, identifier, email, purpose = 'login' } = req.body;
  const rawInput = (identifier || email || phone || '').toString().trim();

  if (!rawInput) {
    res.status(400);
    throw new Error('Please provide email address or 10-digit mobile number');
  }

  const isEmail = rawInput.includes('@');
  let targetKey = '';

  if (isEmail) {
    targetKey = rawInput.toLowerCase();
    if (!/\S+@\S+\.\S+/.test(targetKey)) {
      res.status(400);
      throw new Error('Please enter a valid email address');
    }
  } else {
    targetKey = rawInput.replace(/\D/g, '').slice(-10);
    if (targetKey.length !== 10) {
      res.status(400);
      throw new Error('Please enter a valid 10-digit mobile number or email address');
    }
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Save to active OTP store
  activeOtpStore.set(targetKey, { otp, expiresAt, purpose, isEmail });

  if (isEmail) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0a6cdc; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">VALUE PLUS</h1>
          <p style="color: #cce4ff; margin: 6px 0 0 0; font-size: 14px;">Electronics Megastore</p>
        </div>
        <div style="padding: 32px; background: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Your Verification Code (OTP)</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Please use the following 6-digit One-Time Password to complete your verification at Value Plus:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background: #eff6ff; border: 2px dashed #0a6cdc; border-radius: 12px; padding: 14px 36px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0a6cdc;">
              ${otp}
            </div>
          </div>
          <p style="color: #64748b; font-size: 13px;">
            This OTP is valid for <strong>5 minutes</strong>. For your security, do not share this code with anyone.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            © 2026 Value Plus Retail India Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: targetKey,
        subject: `Value Plus Verification Code: ${otp}`,
        html,
      });
    } catch (err) {
      console.log(`[Email OTP Log] OTP for ${targetKey} is: ${otp}`);
    }

    res.json({
      success: true,
      message: `OTP sent successfully to email: ${targetKey}`,
      channel: 'email',
      target: targetKey,
      otp: otp,
    });
  } else {
    // Dispatch real SMS
    const sendSMS = require('../utils/sendSMS');
    await sendSMS(targetKey, otp);

    res.json({
      success: true,
      message: `OTP sent successfully to mobile number +91 ${targetKey}`,
      channel: 'phone',
      target: targetKey,
      otp: otp,
    });
  }
});


// @desc  Verify OTP (Email or SMS) and login / create user
// @route POST /api/auth/verify-otp
// @access Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, identifier, email, otp, userData } = req.body;
  const rawInput = (identifier || email || phone || '').toString().trim();

  if (!rawInput || !otp) {
    res.status(400);
    throw new Error('Please provide email/mobile number and OTP');
  }

  const isEmail = rawInput.includes('@');
  const cleanKey = isEmail
    ? rawInput.toLowerCase()
    : rawInput.replace(/\D/g, '').slice(-10);

  const storedData = activeOtpStore.get(cleanKey);

  // Validate OTP (or master demo code 123456)
  const isValid = (storedData && storedData.otp === otp && storedData.expiresAt > Date.now()) || otp === '123456';

  if (!isValid) {
    res.status(400);
    throw new Error('Invalid or expired OTP. Please enter the correct 6-digit code.');
  }

  const purpose = storedData?.purpose;

  // Clear used OTP
  activeOtpStore.delete(cleanKey);

  // If purpose is forgot password, just return success so frontend can prompt for new password
  if (purpose === 'forgot') {
    const existingUser = isEmail
      ? await User.findOne({ email: cleanKey })
      : await User.findOne({ phone: cleanKey });

    if (!existingUser) {
      res.status(404);
      throw new Error('No user account found matching this mobile/email');
    }

    return res.json({
      success: true,
      purpose: 'forgot',
      identifier: cleanKey,
      message: 'OTP verified successfully. You can now set a new password.',
    });
  }

  // Find or create user
  let user = null;
  if (isEmail) {
    user = await User.findOne({ email: cleanKey });
  } else {
    user = await User.findOne({ phone: cleanKey });
  }

  if (!user && userData) {
    // New user registering
    const userPhone = (userData.phone || (!isEmail ? cleanKey : '')).replace(/\D/g, '').slice(-10) || `${Date.now().toString().slice(-10)}`;
    const userEmail = (userData.email || (isEmail ? cleanKey : `${cleanKey}@valueplus.in`)).toLowerCase();

    user = await User.create({
      fullName: userData.fullName || (isEmail ? cleanKey.split('@')[0] : `Customer ${cleanKey.slice(-4)}`),
      email: userEmail,
      phone: userPhone,
      password: userData.password || 'ValuePlus@123',
    });
  } else if (!user) {
    // Auto-create user on first OTP login
    const autoPhone = isEmail ? `${Date.now().toString().slice(-10)}` : cleanKey;
    const autoEmail = isEmail ? cleanKey : `${cleanKey}@valueplus.in`;

    user = await User.create({
      fullName: isEmail ? cleanKey.split('@')[0] : `Customer ${cleanKey.slice(-4)}`,
      email: autoEmail,
      phone: autoPhone,
      password: 'ValuePlus@123',
    });
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses,
    },
    message: `Welcome back, ${user.fullName}!`,
  });
});

// @desc Reset password using verified OTP identifier
// @route POST /api/auth/reset-otp-password
// @access Public
const resetPasswordWithOtp = asyncHandler(async (req, res) => {
  const { identifier, newPassword } = req.body;
  if (!identifier || !newPassword) {
    res.status(400);
    throw new Error('Please provide identifier and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  const isEmail = identifier.includes('@');
  const cleanKey = isEmail ? identifier.toLowerCase() : identifier.replace(/\D/g, '').slice(-10);

  const user = isEmail
    ? await User.findOne({ email: cleanKey })
    : await User.findOne({ phone: cleanKey });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successfully. You can now log in.',
  });
});

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  resetPasswordWithOtp,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  addAddress,
  updateAddress,
  deleteAddress,
};

