
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'revira_nexgen_erp';

let db = null;
let client = null;

export async function connectToDatabase() {
  if (db) return db;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Successfully connected to MongoDB instance');
    db = client.db(DB_NAME);
    return db;
  } catch (error) {
    console.error('Critical error connecting to MongoDB:', error);
    throw error;
  }
}

export async function closeConnection() {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
}
