import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/src/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const db = await getMongoDb();
    const usersCollection = db.collection('users');

    // Handle Login Action
    if (body.action === 'login') {
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found. Please register.' }, { status: 404 });
      }
      if (body.password && user.password && user.password !== body.password) {
        return NextResponse.json({ success: false, message: 'Incorrect password.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        user: {
          id: user._id.toString(),
          fullName: user.fullName || 'Valued Customer',
          email: user.email,
          phone: user.phone || '',
        },
      });
    }

    // Handle Registration / Upsert Action
    const updateDoc: any = {
      fullName: body.fullName,
      phone: body.phone,
      email,
      updatedAt: new Date(),
    };

    if (body.password) {
      updateDoc.password = body.password;
    }

    const result = await usersCollection.updateOne(
      { email },
      {
        $set: updateDoc,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'User registered/updated successfully in MongoDB',
      result,
      user: {
        fullName: body.fullName,
        phone: body.phone,
        email,
      },
    });
  } catch (error: any) {
    console.error('Error in MongoDB users API:', error);
    return NextResponse.json({ success: false, message: error.message || 'Database error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email query parameter required' }, { status: 400 });
    }

    const db = await getMongoDb();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user from MongoDB:', error);
    return NextResponse.json({ success: false, message: error.message || 'Database error' }, { status: 500 });
  }
}
