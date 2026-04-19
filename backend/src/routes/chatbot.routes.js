const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chatbot.controller");

router.post("/", chat);

module.exports = router;