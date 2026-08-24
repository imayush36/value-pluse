import { MongoClient, type Db } from 'mongodb';

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

export let mongoClientPromise: Promise<MongoClient> | undefined;

export function getMongoClient(): Promise<MongoClient> {
  let mongoUri =
    process.env.MONGODB_URI ||
    process.env.NEXT_PUBLIC_MONGODB_URI ||
    'mongodb+srv://ayush979430_db_user:afusIImbEIW1Jlpn@cluster0.gcikbaj.mongodb.net/?retryWrites=true&w=majority';

  if (!mongoUri.includes('retryWrites=')) {
    mongoUri += (mongoUri.includes('?') ? '&' : '?') + 'retryWrites=true&w=majority';
  }

  if (!globalForMongo.mongoClientPromise) {
    const client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      tls: true,
      family: 4,
    });

    globalForMongo.mongoClientPromise = client.connect().catch((err) => {
      globalForMongo.mongoClientPromise = undefined;
      throw err;
    });
  }

  mongoClientPromise = globalForMongo.mongoClientPromise;
  return mongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const connectedClient = await getMongoClient();
  return connectedClient.db(process.env.MONGODB_DB_NAME || 'value_plus');
}
