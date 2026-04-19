const express = require("express");
const router = express.Router();
const { chat, getChatHistory, getChat, deleteChat } = require("../controllers/chatbot.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Apply authMiddleware to ALL routes that need authentication
router.post("/", authMiddleware, chat);  // Add authMiddleware here
router.get("/history", authMiddleware, getChatHistory);
router.get("/:chatId", authMiddleware, getChat);
router.delete("/:chatId", authMiddleware, deleteChat);

module.exports = router;