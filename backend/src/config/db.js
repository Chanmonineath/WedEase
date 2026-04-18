const path = require("node:path");
const { MongoClient } = require("mongodb");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
  override: false,
});

const uri = process.env.ATLAS_URI || process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Missing ATLAS_URI environment variable");
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000,
});
const databaseName = process.env.DB_NAME || "WedEase";

let db;

const connectToDatabase = async () => {
  if (db) {
    return db;
  }

  if (
    uri.includes("<db_password>") ||
    uri.includes("REPLACE_WITH_DB_PASSWORD")
  ) {
    throw new Error(
      "MongoDB URI still contains a password placeholder. Replace it with the real database password.",
    );
  }

  await client.connect();
  console.log("Connected to MongoDB");
  db = client.db(databaseName);
  return db;
};

const getDatabase = () => {
  if (!db) {
    throw new Error(
      "Database not initialized. Call connectToDatabase() first.",
    );
  }

  return db;
};

const closeDatabase = async () => {
  if (client) {
    await client.close();
    db = null;
  }
};

module.exports = {
  connectToDatabase,
  getDatabase,
  closeDatabase,
};
