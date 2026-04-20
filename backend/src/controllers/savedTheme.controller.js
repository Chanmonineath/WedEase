const SavedTheme = require("../models/SavedTheme");

// Get all saved themes for current user
const getAllSavedThemes = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const savedThemes = await SavedTheme.getSavedThemesByUser(userId);

    return res.status(200).json({
      success: true,
      data: savedThemes,
      count: savedThemes.length,
    });
  } catch (error) {
    return next(error);
  }
};

// Save a theme
const saveTheme = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id, key, title, description, images, link } = req.body;

    if (!key || !title) {
      return res.status(400).json({
        success: false,
        message: "key and title are required.",
      });
    }

    // Check if already saved
    const alreadySaved = await SavedTheme.isThemeSaved(userId, key);
    if (alreadySaved) {
      return res.status(409).json({
        success: false,
        message: "Theme is already saved.",
      });
    }

    const savedTheme = await SavedTheme.saveTheme(userId, {
      id: id || key,
      key,
      title,
      description,
      images,
      link,
    });

    return res.status(201).json({
      success: true,
      message: "Theme saved successfully.",
      data: savedTheme,
    });
  } catch (error) {
    return next(error);
  }
};

// Remove a saved theme
const removeTheme = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { themeKey } = req.params;

    if (!themeKey) {
      return res.status(400).json({
        success: false,
        message: "themeKey is required.",
      });
    }

    const deleted = await SavedTheme.removeTheme(userId, themeKey);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Saved theme not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Theme removed from saved.",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllSavedThemes,
  saveTheme,
  removeTheme,
};
