
import { MongoClient, Db, MongoNetworkError, MongoServerSelectionError } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB_NAME || 'quotationflow'; // Default DB name changed

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env. See .env.example for guidance.');
}

interface CachedMongoConnection {
  client: MongoClient | null;
  db: Db | null;
}

declare global {
  var mongo: CachedMongoConnection | undefined;
}

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { client: null, db: null };
}

export async function connectToDatabase(): Promise<{ client: MongoClient, db: Db }> {
  if (cached!.client && cached!.db) {
    try {
      await cached!.client.db(MONGODB_DB).command({ ping: 1 });
    } catch (e) {
      console.warn("Cached MongoDB client connection lost. Reconnecting...", e);
      cached!.client = null;
      cached!.db = null;
    }
    if(cached!.client && cached!.db) {
        return { client: cached!.client, db: cached!.db };
    }
  }

  const client = new MongoClient(MONGODB_URI!);

  try {
    await client.connect();
  } catch (error: any) {
    console.error("MongoDB Connection Error while trying to connect:", error);
    let userMessage = `Failed to connect to MongoDB using URI: ${MONGODB_URI}.`;

    if (error instanceof MongoNetworkError || (error.message && error.message.includes('ECONNREFUSED'))) {
      userMessage += " Connection refused. Please ensure your MongoDB server is running, accessible from this application, and that the MONGODB_URI in your .env file is correct (host, port, credentials).";
    } else if (error instanceof MongoServerSelectionError) {
      userMessage += " Server selection error. This could be due to network issues, incorrect replica set configuration, or the server(s) not being available. Please check your MongoDB server status, configuration, and network accessibility.";
       if (error.message.includes('connect ECONNREFUSED')) {
         userMessage += " Specifically, the connection was refused, reinforcing the need to check if the server is running and accessible at the specified address.";
       }
    } else {
      userMessage += ` An unexpected error occurred: ${error.message || 'Unknown error'}. Check the console for more details.`;
    }
    throw new Error(userMessage);
  }
  
  const db = client.db(MONGODB_DB);

  cached!.client = client;
  cached!.db = db;

  return { client, db };
}
