import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '../../../../src/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, email, otp, fullName } = body;

    const db = await getMongoDb();
    const otpCollection = db.collection('otp_verifications');

    // 1. SEND OR RESEND OTP ACTION
    if (action === 'send' || action === 'resend') {
      if (!phone) {
        return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 });
      }

      // Generate 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      await otpCollection.updateOne(
        { phone: phone.trim() },
        {
          $set: {
            phone: phone.trim(),
            email: email ? email.trim().toLowerCase() : '',
            fullName: fullName || '',
            otp: generatedOtp,
            expiresAt,
            verified: false,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      console.log(`[OTP API] Generated OTP for +91 ${phone}: ${generatedOtp}`);

      return NextResponse.json({
        success: true,
        message: `OTP sent successfully to +91 ${phone}`,
        phone: phone.trim(),
        otp: generatedOtp,
        expiresInSeconds: 600,
      });
    }

    // 2. VERIFY OTP ACTION
    if (action === 'verify') {
      if (!phone || !otp) {
        return NextResponse.json({ success: false, message: 'Phone and OTP are required' }, { status: 400 });
      }

      const record = await otpCollection.findOne({ phone: phone.trim() });

      if (!record) {
        return NextResponse.json({ success: false, message: 'No OTP request found for this mobile number.' }, { status: 404 });
      }

      if (record.otp !== otp.trim()) {
        return NextResponse.json({ success: false, message: 'Invalid OTP code. Please enter the correct code.' }, { status: 400 });
      }

      if (new Date() > new Date(record.expiresAt)) {
        return NextResponse.json({ success: false, message: 'OTP has expired. Please request a new OTP.' }, { status: 400 });
      }

      // Mark verified
      await otpCollection.updateOne(
        { phone: phone.trim() },
        { $set: { verified: true, verifiedAt: new Date() } }
      );

      return NextResponse.json({
        success: true,
        message: 'Mobile number OTP verified successfully!',
        phone: phone.trim(),
        verified: true,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in OTP API:', error);
    return NextResponse.json({ success: false, message: error.message || 'OTP server error' }, { status: 500 });
  }
}
