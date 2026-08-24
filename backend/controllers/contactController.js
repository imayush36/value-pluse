const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');
const sendEmail = require('../utils/sendEmail');

// @desc  Submit contact form
// @route POST /api/contact
// @access Public
const submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  // Save to DB
  const contact = await Contact.create({ name, email, phone, subject, message });

  // Try to send notification email to admin (non-blocking)
  if (process.env.EMAIL_USER) {
    try {
      await sendEmail({
        to: process.env.EMAIL_USER,
        subject: `[Value Plus Contact] ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #0a6cdc;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${name}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${email}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${phone || 'N/A'}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold;">Subject:</td><td style="padding: 8px;">${subject}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Message:</td><td style="padding: 8px;">${message}</td></tr>
            </table>
          </div>
        `,
      });
    } catch (e) {
      // Email failure doesn't block the response
      console.log('Contact email notification failed:', e.message);
    }
  }

  res.status(201).json({
    success: true,
    message: "Thank you for reaching out! We'll get back to you within 24 hours.",
    contact: { _id: contact._id },
  });
});

module.exports = { submitContact };
