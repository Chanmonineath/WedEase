const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/db");

const collectionName = "saved_themes";

const getSavedThemesCollection = () => getDatabase().collection(collectionName);

// Get all saved themes for a user
const getSavedThemesByUser = async (userId) => {
  return getSavedThemesCollection()
    .find({ userId: new ObjectId(userId) })
    .toArray();
};

// Save a theme for a user
const saveTheme = async (userId, themeData) => {
  const now = new Date();
  const savedTheme = {
    userId: new ObjectId(userId),
    id: themeData.id,
    key: themeData.key,
    title: themeData.title,
    description: themeData.description,
    images: themeData.images || [null, null, null],
    link: themeData.link || "#",
    savedAt: now,
    updatedAt: now,
  };

  const result = await getSavedThemesCollection().insertOne(savedTheme);
  return { ...savedTheme, _id: result.insertedId };
};

// Check if theme is already saved
const isThemeSaved = async (userId, themeKey) => {
  const savedTheme = await getSavedThemesCollection().findOne({
    userId: new ObjectId(userId),
    key: themeKey,
  });
  return !!savedTheme;
};

// Remove a saved theme
const removeTheme = async (userId, themeKey) => {
  const result = await getSavedThemesCollection().deleteOne({
    userId: new ObjectId(userId),
    key: themeKey,
  });
  return result.deletedCount > 0;
};

module.exports = {
  getSavedThemesByUser,
  saveTheme,
  isThemeSaved,
  removeTheme,
};
