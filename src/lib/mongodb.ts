
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB_NAME || 'invoiceflow'; // Default DB name if not set

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface CachedMongoConnection {
  client: MongoClient | null;
  db: Db | null;
}

// Extend global to add our cached connection
declare global {
  var mongo: CachedMongoConnection | undefined;
}

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { client: null, db: null };
}

export async function connectToDatabase(): Promise<{ client: MongoClient, db: Db }> {
  if (cached!.client && cached!.db) {
    return { client: cached!.client, db: cached!.db };
  }

  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  const db = client.db(MONGODB_DB);

  cached!.client = client;
  cached!.db = db;

  return { client, db };
}
