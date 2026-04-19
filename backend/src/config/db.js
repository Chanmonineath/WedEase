const mongoose = require("mongoose");

const connectToDatabase = async () => {
  const uri = process.env.ATLAS_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing ATLAS_URI/MONGODB_URI");
  await mongoose.connect(uri, { dbName: process.env.DB_NAME || "WedEase" });
  console.log("Connected to MongoDB");
};

module.exports = { connectToDatabase };
