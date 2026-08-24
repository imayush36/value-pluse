import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before migrating.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function migrate() {
  const { getMongoDb, mongoClientPromise } = await import('../src/lib/mongodb');
  const [{ data: profiles, error: profilesError }, { data: orders, error: ordersError }] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('orders').select('*'),
  ]);

  if (profilesError) throw profilesError;
  if (ordersError) throw ordersError;

  const database = await getMongoDb();
  const profileCollection = database.collection('profiles');
  const orderCollection = database.collection('orders');

  await profileCollection.createIndex({ id: 1 }, { unique: true });
  await orderCollection.createIndex({ orderId: 1 }, { unique: true });
  await orderCollection.createIndex({ userId: 1, createdAt: -1 });

  if (profiles?.length) {
    await profileCollection.bulkWrite(
      profiles.map((profile) => ({
        updateOne: {
          filter: { id: profile.id },
          update: {
            $set: {
              id: profile.id,
              fullName: profile.full_name,
              phone: profile.phone,
              createdAt: profile.created_at,
              migratedAt: new Date(),
            },
          },
          upsert: true,
        },
      })),
    );
  }

  if (orders?.length) {
    await orderCollection.bulkWrite(
      orders.map((order) => ({
        updateOne: {
          filter: { orderId: order.order_id },
          update: {
            $set: {
              userId: order.user_id,
              orderId: order.order_id,
              customer: order.customer,
              items: order.items,
              subtotal: order.subtotal,
              delivery: order.delivery,
              discount: order.discount,
              total: order.total,
              status: order.status,
              estimatedDelivery: order.estimated_delivery,
              createdAt: order.created_at,
              migratedAt: new Date(),
            },
          },
          upsert: true,
        },
      })),
    );
  }

  console.log(`Migrated ${profiles?.length ?? 0} profiles and ${orders?.length ?? 0} orders to ${database.databaseName}.`);
  await (await mongoClientPromise).close();
}

migrate().catch(async (error) => {
  console.error('Supabase to MongoDB migration failed:', error);
  process.exitCode = 1;
});
