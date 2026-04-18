const SYSTEM_PROMPT = `You are a warm, knowledgeable wedding planning assistant for WedEASE — a smart wedding planning platform.
Help couples plan their perfect wedding by answering questions about:
- Wedding themes and decor ideas
- Budget planning and vendor costs
- Guest list management and RSVP tips
- Seating chart organization
- Invitation design and wording
- Timeline and checklist planning
- Venue selection advice
- Catering and entertainment suggestions
- Any other wedding planning topics

Keep responses concise, practical, and friendly. Do not use emojis.
When suggesting numbers or costs, note they are estimates that vary by location and scale.
Always be encouraging — wedding planning can be stressful and couples need support.`;

const chat = async (req, res) => {
  console.log("📨 Chatbot request received");

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: "messages array is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found");
    return res.status(500).json({ success: false, message: "Gemini API key is not configured." });
  }

  try {
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === "user").pop();
    if (!lastUserMessage) {
      return res.status(400).json({ success: false, message: "No user message found." });
    }

    // Build conversation context
    let conversationHistory = "";
    for (const msg of messages.slice(0, -1)) {
      conversationHistory += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
    }

    const prompt = `${SYSTEM_PROMPT}\n\nConversation history:\n${conversationHistory}\nUser: ${lastUserMessage.content}\nAssistant:`;

    console.log("🤖 Calling Gemini API with model: gemini-2.5-flash");

    // Use the correct model from your available models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            topP: 0.95,
            topK: 64,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Gemini API error:", errorText);
      return res.status(502).json({ 
        success: false, 
        message: "Failed to reach AI service.",
        details: errorText 
      });
    }

    const data = await response.json();
    console.log("✅ Gemini API response received");
    
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                  "I'm sorry, I couldn't generate a response. Please try again.";

    return res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error("❌ Chatbot controller error:", err);
    return res.status(500).json({ success: false, message: "Internal server error: " + err.message });
  }
};

module.exports = { chat };