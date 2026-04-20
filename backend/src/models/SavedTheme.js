// backend/src/models/SavedTheme.js
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../config/db");

const COLLECTION = "saved_themes";

const getCollection = async () => {
  const db = await connectToDatabase();
  return db.collection(COLLECTION);
};

// Save a theme (upsert — safe to call twice)
const saveTheme = async ({ userId, themeKey, title, description, images, link }) => {
  const col = await getCollection();
  const now = new Date();
  await col.updateOne(
    { userId: new ObjectId(userId), themeKey },
    {
      $set:         { title, description: description || "", images: images || [], link: link || "#", updatedAt: now },
      $setOnInsert: { userId: new ObjectId(userId), themeKey, createdAt: now },
    },
    { upsert: true }
  );
  return col.findOne({ userId: new ObjectId(userId), themeKey });
};

// Get all saved themes for a user
const getAllSavedThemes = async (userId) => {
  const col = await getCollection();
  return col.find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
};

// Remove one saved theme
const removeTheme = async (userId, themeKey) => {
  const col = await getCollection();
  const result = await col.deleteOne({ userId: new ObjectId(userId), themeKey });
  return result.deletedCount > 0;
};

module.exports = { saveTheme, getAllSavedThemes, removeTheme };