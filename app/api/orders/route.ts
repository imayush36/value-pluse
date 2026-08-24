import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/src/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();

    if (!orderData || !orderData.orderId || !orderData.customer) {
      return NextResponse.json({ success: false, message: 'Invalid order data' }, { status: 400 });
    }

    const db = await getMongoDb();
    const ordersCollection = db.collection('orders');

    const result = await ordersCollection.updateOne(
      { orderId: orderData.orderId },
      {
        $set: {
          ...orderData,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Order saved successfully to database',
      orderId: orderData.orderId,
      result,
    });
  } catch (error: any) {
    console.error('Error saving order to MongoDB:', error);
    return NextResponse.json({ success: false, message: error.message || 'Database error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const orderId = searchParams.get('orderId');

    const db = await getMongoDb();
    const ordersCollection = db.collection('orders');

    const query: any = {};
    if (email) {
      query['customer.email'] = { $regex: new RegExp(`^${email.trim()}$`, 'i') };
    }
    if (orderId) {
      query.orderId = orderId.trim();
    }

    const orders = await ordersCollection.find(query).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Error fetching orders from MongoDB:', error);
    return NextResponse.json({ success: false, message: error.message || 'Database error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ success: false, message: 'orderId and status required' }, { status: 400 });
    }

    const db = await getMongoDb();
    const ordersCollection = db.collection('orders');

    await ordersCollection.updateOne(
      { orderId },
      { $set: { status, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: `Order ${orderId} updated to ${status}` });
  } catch (error: any) {
    console.error('Error updating order in MongoDB:', error);
    return NextResponse.json({ success: false, message: error.message || 'Database error' }, { status: 500 });
  }
}
