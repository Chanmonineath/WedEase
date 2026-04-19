const Chat = require("../models/Chat");

const SYSTEM_PROMPT = `You are a warm, knowledgeable wedding planning assistant for WedEASE. Help couples plan their perfect wedding by answering questions about wedding themes, budget planning, guest list management, seating charts, invitations, timelines, venue selection, catering, and entertainment. Keep responses concise, practical, and friendly. Do not use emojis.`;

const chat = async (req, res) => {
  console.log("Chatbot request received");
  
  const { messages, chatId } = req.body;
  const userId = req.user?.userId;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: "messages array is required." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY not found");
    return res.status(500).json({ success: false, message: "Groq API key is not configured." });
  }

  try {
    let currentChatId = chatId;

    // Create new chat session if needed
    if (userId && !currentChatId) {
      const newChat = await Chat.createChatSession(userId, messages);
      currentChatId = newChat._id.toString();
      console.log("Created new chat session:", currentChatId);
    }

    // Save user message - with duplicate check
    if (userId && currentChatId) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage && lastUserMessage.role === "user") {
        const existingChat = await Chat.getChatById(currentChatId, userId);
        const lastMessage = existingChat?.messages[existingChat.messages.length - 1];
        
        if (!lastMessage || lastMessage.content !== lastUserMessage.content) {
          await Chat.addMessageToChat(currentChatId, userId, "user", lastUserMessage.content);
          console.log("Saved user message");
        } else {
          console.log("Duplicate user message - not saving");
        }
      }
    }

    // Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return res.status(502).json({
        success: false,
        message: "Failed to reach AI service.",
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ||
                  "I'm sorry, I couldn't generate a response. Please try again.";

    // Save assistant response - with duplicate check
    if (userId && currentChatId) {
      const existingChat = await Chat.getChatById(currentChatId, userId);
      const lastMessage = existingChat?.messages[existingChat.messages.length - 1];
      
      if (!lastMessage || lastMessage.content !== reply) {
        await Chat.addMessageToChat(currentChatId, userId, "assistant", reply);
        console.log("Saved assistant response");
      } else {
        console.log("Duplicate assistant response - not saving");
      }
    }

    return res.status(200).json({ 
      success: true, 
      reply,
      chatId: currentChatId
    });
    
  } catch (err) {
    console.error("Chatbot error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const chats = await Chat.getUserChats(userId);
    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
};

const getChat = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const chat = await Chat.getChatById(chatId, userId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }
    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ success: false, message: "Failed to fetch chat" });
  }
};

const deleteChat = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const deleted = await Chat.deleteChat(chatId, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }
    res.status(200).json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ success: false, message: "Failed to delete chat" });
  }
};

module.exports = { 
  chat, 
  getChatHistory, 
  getChat, 
  deleteChat 
};