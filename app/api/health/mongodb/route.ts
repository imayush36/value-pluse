import { NextResponse } from 'next/server';
import { getMongoDb } from '../../../../src/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const database = await getMongoDb();
    await database.command({ ping: 1 });
    return NextResponse.json({ ok: true, database: database.databaseName });
  } catch (error) {
    console.error('MongoDB health check failed', error);
    return NextResponse.json({ ok: false, message: 'MongoDB connection failed' }, { status: 503 });
  }
}
