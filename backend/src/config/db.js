const { MongoClient } = require("mongodb");

const env = require("./env");

let client;
let db;

const connectToDatabase = async () => {
  if (db) {
    return db;
  }

  if (
    env.mongoUri.includes("<db_password>") ||
    env.mongoUri.includes("REPLACE_WITH_DB_PASSWORD")
  ) {
    throw new Error(
      "MongoDB URI still contains a password placeholder. Replace it with the real database password.",
    );
  }

  client = new MongoClient(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  await client.connect();
  db = client.db(env.dbName);
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
    client = null;
    db = null;
  }
};

module.exports = {
  connectToDatabase,
  getDatabase,
  closeDatabase,
};
