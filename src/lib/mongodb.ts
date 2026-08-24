import { MongoClient, type Db } from 'mongodb';

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

export let mongoClientPromise: Promise<MongoClient> | undefined;

export function getMongoClient(): Promise<MongoClient> {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.NEXT_PUBLIC_MONGODB_URI ||
    'mongodb+srv://ayush979430_db_user:afusIImbEIW1Jlpn@cluster0.gcikbaj.mongodb.net/';

  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  if (!globalForMongo.mongoClientPromise) {
    const client = new MongoClient(mongoUri, {
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 20000,
      serverSelectionTimeoutMS: 5000,
    });

    globalForMongo.mongoClientPromise = client.connect();
  }

  mongoClientPromise = globalForMongo.mongoClientPromise;
  return mongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const connectedClient = await getMongoClient();
  return connectedClient.db(process.env.MONGODB_DB_NAME || 'value_plus');
}
