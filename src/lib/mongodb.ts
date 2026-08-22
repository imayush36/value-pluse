import { MongoClient, type Db } from 'mongodb';

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI environment variable');
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

const client = new MongoClient(mongoUri, {
  maxPoolSize: 5,
  minPoolSize: 0,
  maxIdleTimeMS: 20000,
  serverSelectionTimeoutMS: 5000,
});

export const mongoClientPromise = globalForMongo.mongoClientPromise ?? client.connect();

if (process.env.NODE_ENV !== 'production') {
  globalForMongo.mongoClientPromise = mongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const connectedClient = await mongoClientPromise;
  return connectedClient.db(process.env.MONGODB_DB_NAME || 'value_plus');
}
