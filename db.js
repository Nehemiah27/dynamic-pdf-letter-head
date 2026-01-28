import { MongoClient } from "mongodb";

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017",
  DB_NAME = "revira_nexgen_erp";

let db = null,
  client = null;

export async function connectToDatabase() {
  if (db) return db;
  try {
    client = new MongoClient(MONGODB_URL);
    await client.connect();
    console.log("Successfully connected to MongoDB instance");
    db = client.db(DB_NAME);
    return db;
  } catch (error) {
    console.error("Critical error connecting to MongoDB:", error);
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
