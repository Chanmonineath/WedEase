const express = require("express");
const savedThemeController = require("../controllers/savedTheme.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/saved-themes - get all saved themes for user
router.get("/", savedThemeController.getAllSavedThemes);

// POST /api/saved-themes - save a theme
router.post("/", savedThemeController.saveTheme);

// DELETE /api/saved-themes/:themeKey - remove a saved theme
router.delete("/:themeKey", savedThemeController.removeTheme);

module.exports = router;
