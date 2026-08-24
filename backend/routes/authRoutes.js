const express = require('express');
const router = express.Router();
const {
  register, login, sendOtp, verifyOtp, resetPasswordWithOtp, getProfile, updateProfile, changePassword,
  forgotPassword, resetPassword, addAddress, updateAddress, deleteAddress,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-otp-password', resetPasswordWithOtp);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);


// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

module.exports = router;
