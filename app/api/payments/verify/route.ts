import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/src/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, amount, upiId, cardDetails, customerEmail, orderId } = body;

    if (!method || !amount) {
      return NextResponse.json({ success: false, message: 'Payment method and amount required' }, { status: 400 });
    }

    // Simulated Bank Gateway Processing
    const transactionId =
      method === 'upi'
        ? `UPI-${Math.floor(100000000000 + Math.random() * 900000000000)}`
        : `CARD-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const paymentRecord = {
      transactionId,
      orderId: orderId || `VP-${Math.floor(100000 + Math.random() * 900000)}`,
      method,
      amount,
      customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : '',
      upiId: upiId || null,
      cardLast4: cardDetails?.cardNumber ? cardDetails.cardNumber.slice(-4) : null,
      cardType: cardDetails?.cardType || (method === 'card' ? 'Visa' : null),
      status: 'SUCCESS',
      paidAt: new Date(),
    };

    try {
      const db = await getMongoDb();
      await db.collection('payments').insertOne(paymentRecord);
    } catch (dbErr) {
      console.warn('MongoDB payments collection insert warning:', dbErr);
    }

    return NextResponse.json({
      success: true,
      status: 'PAID',
      message: `${method.toUpperCase()} Payment of ₹${amount.toLocaleString('en-IN')} completed successfully!`,
      transactionId,
      paymentDetails: paymentRecord,
    });
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Payment processing failed' }, { status: 500 });
  }
}
