const express = require("express");
const themeController = require("../controllers/themeController");

const router = express.Router();

// GET /api/themes - returns list of themes
router.get("/", themeController.listThemes);

// GET /api/themes/fetch-all - fetch all themes with images from Unsplash
router.get("/fetch-all", themeController.fetchAllThemes);

module.exports = router;
