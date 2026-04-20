// backend/src/routes/savedTheme.routes.js
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/savedTheme.controller");
const auth    = require("../middleware/auth.middleware");

router.use(auth);
router.get("/",            ctrl.getAllSavedThemes);
router.post("/",           ctrl.saveTheme);
router.delete("/:themeKey", ctrl.removeTheme);

module.exports = router;