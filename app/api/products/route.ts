import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '../../../src/lib/mongodb';
import { PRODUCTS } from '../../../src/data/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const id = searchParams.get('id');

    // Single product by ID
    if (id) {
      const db = await getMongoDb();
      const dbProduct = await db.collection('products').findOne({ id });
      if (dbProduct) {
        return NextResponse.json({ success: true, product: dbProduct });
      }
      const staticProduct = PRODUCTS.find((p) => p.id === id);
      return NextResponse.json({ success: true, product: staticProduct || null });
    }

    // Try MongoDB products collection if populated
    try {
      const db = await getMongoDb();
      const mongoProducts = await db.collection('products').find({}).toArray();
      if (mongoProducts && mongoProducts.length > 0) {
        let results = mongoProducts;
        if (category && category !== 'all') {
          results = results.filter((p) => p.category === category);
        }
        if (search) {
          const q = search.toLowerCase();
          results = results.filter((p) => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
        }
        return NextResponse.json({ success: true, count: results.length, products: results, source: 'mongodb' });
      }
    } catch (dbErr) {
      console.warn('MongoDB products fallback to static catalog:', dbErr);
    }

    // Dynamic filtering over full catalog
    let list = [...PRODUCTS];
    if (category && category !== 'all') {
      list = list.filter((p) => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }

    return NextResponse.json({
      success: true,
      count: list.length,
      products: list,
      source: 'catalog',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
