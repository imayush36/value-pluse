import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getMongoDb } from '../src/lib/mongodb';

async function testOrders() {
  const db = await getMongoDb();
  console.log('Successfully connected to MongoDB Database:', db.databaseName);

  const testOrder = {
    orderId: 'VP-TEST-999',
    date: new Date().toISOString(),
    customer: {
      fullName: 'Ayush Test Customer',
      email: 'ayush.test@valueplus.in',
      phone: '9876543210',
      address: 'Hazratganj Main Market',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226001',
    },
    items: [
      {
        id: 'prod-tv-1',
        name: 'Sony Bravia 55" 4K Google TV',
        price: 54990,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
      },
    ],
    subtotal: 54990,
    delivery: 0,
    discount: 0,
    total: 54990,
    status: 'Confirmed',
    estimatedDelivery: 'Wed, Aug 26',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Upsert Order
  const result = await db.collection('orders').updateOne(
    { orderId: testOrder.orderId },
    { $set: testOrder },
    { upsert: true }
  );
  console.log('Order upsert result in MongoDB:', result.acknowledged ? 'SUCCESS' : 'FAILED');

  // Verify Retrieval
  const fetched = await db.collection('orders').findOne({ orderId: 'VP-TEST-999' });
  console.log('Retrieved order:', {
    orderId: fetched?.orderId,
    customer: fetched?.customer?.fullName,
    itemsCount: fetched?.items?.length,
    total: fetched?.total,
    status: fetched?.status,
  });

  const totalCount = await db.collection('orders').countDocuments();
  console.log('Total live orders currently in MongoDB:', totalCount);

  // Clean up test order
  await db.collection('orders').deleteOne({ orderId: 'VP-TEST-999' });
  console.log('Cleaned up test order. Database is pristine and verified working!');
}

testOrders().catch((err) => {
  console.error('Test DB failed:', err);
  process.exit(1);
});
