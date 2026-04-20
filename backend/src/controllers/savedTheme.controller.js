// backend/src/controllers/savedTheme.controller.js
const SavedTheme = require("../models/SavedTheme");

// GET /api/saved-themes
const getAllSavedThemes = async (req, res, next) => {
  try {
    const themes = await SavedTheme.getAllSavedThemes(req.user.userId);
    return res.status(200).json({ success: true, data: themes });
  } catch (err) { return next(err); }
};

// POST /api/saved-themes
const saveTheme = async (req, res, next) => {
  try {
    const { themeKey, title, description, images, link } = req.body;
    if (!themeKey || !title)
      return res.status(400).json({ success: false, message: "themeKey and title are required." });
    const saved = await SavedTheme.saveTheme({
      userId: req.user.userId, themeKey, title,
      description: description || "", images: images || [], link: link || "#",
    });
    return res.status(201).json({ success: true, data: saved });
  } catch (err) { return next(err); }
};

// DELETE /api/saved-themes/:themeKey
const removeTheme = async (req, res, next) => {
  try {
    const { themeKey } = req.params;
    if (!themeKey)
      return res.status(400).json({ success: false, message: "themeKey is required." });
    const deleted = await SavedTheme.removeTheme(req.user.userId, themeKey);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Saved theme not found." });
    return res.status(200).json({ success: true, message: "Theme removed." });
  } catch (err) { return next(err); }
};

module.exports = { getAllSavedThemes, saveTheme, removeTheme };