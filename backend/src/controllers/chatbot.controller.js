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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ GROQ_API_KEY not found");
    return res.status(500).json({ success: false, message: "Groq API key is not configured." });
  }

  try {
    console.log("🤖 Calling Groq API with model: llama-3.3-70b-versatile");

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
      console.error("❌ Groq API error:", errorText);
      return res.status(502).json({
        success: false,
        message: "Failed to reach AI service.",
        details: errorText
      });
    }

    const data = await response.json();
    console.log("✅ Groq API response received");

    const reply = data.choices?.[0]?.message?.content ||
                  "I'm sorry, I couldn't generate a response. Please try again.";

    return res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error("❌ Chatbot controller error:", err);
    return res.status(500).json({ success: false, message: "Internal server error: " + err.message });
  }
};

module.exports = { chat };