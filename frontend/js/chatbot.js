// ===============================================
// WEDEASE CHATBOT WIDGET — JAVASCRIPT
// ===============================================

(function () {

  // ── State ──────────────────────────────────────────────────────────────────
  const state = {
    open: false,
    loading: false,
    history: [],
  };

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

  const SUGGESTIONS = [
    "How do I set a wedding budget?",
    "What themes work for outdoor weddings?",
    "How many guests should I invite?",
    "When should I send invitations?",
    "How do I create a seating chart?",
  ];

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const btn           = document.getElementById("wedease-chat-btn");
  const panel         = document.getElementById("wedease-chat-panel");
  const messagesEl    = document.getElementById("wedease-chat-messages");
  const inputEl       = document.getElementById("wedease-chat-input");
  const sendBtn       = document.getElementById("wedease-chat-send");
  const closeBtn      = document.getElementById("wedease-chat-close");
  const suggestionsEl = document.getElementById("wedease-suggestions");

  if (!btn || !panel) {
    console.warn("WedEASE Chatbot: required HTML elements not found.");
    return;
  }

  // ── Toggle panel ───────────────────────────────────────────────────────────
  function togglePanel(force) {
    state.open = force !== undefined ? force : !state.open;
    panel.classList.toggle("open", state.open);

    if (state.open) {
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>`;
      if (state.history.length === 0) showWelcome();
      setTimeout(() => inputEl.focus(), 300);
    } else {
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>`;
    }
  }

  // ── Welcome message ────────────────────────────────────────────────────────
  function showWelcome() {
    appendMessage(
      "assistant",
      "Hello! I am your WedEASE wedding planning assistant. Whether you need help with budgets, themes, guest lists, or anything else for your big day — I am here to help. What would you like to know?"
    );
    renderSuggestions();
  }

  // ── Suggested questions ────────────────────────────────────────────────────
  function renderSuggestions() {
    suggestionsEl.innerHTML = "";
    SUGGESTIONS.forEach((q) => {
      const chip = document.createElement("button");
      chip.className = "wc-suggestion";
      chip.textContent = q;
      chip.addEventListener("click", () => {
        suggestionsEl.innerHTML = "";
        sendMessage(q);
      });
      suggestionsEl.appendChild(chip);
    });
  }

  // ── Append a message bubble ────────────────────────────────────────────────
  function appendMessage(role, text) {
    const wrapper = document.createElement("div");
    wrapper.className = `wc-msg ${role}`;

    const bubble = document.createElement("div");
    bubble.className = "wc-bubble";
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
    scrollToBottom();
    return bubble;
  }

  // ── Typing indicator ───────────────────────────────────────────────────────
  function showTyping() {
    const wrapper = document.createElement("div");
    wrapper.className = "wc-msg assistant";
    wrapper.id = "wc-typing-indicator";

    const typing = document.createElement("div");
    typing.className = "wc-typing";
    typing.innerHTML = `
      <div class="wc-dot"></div>
      <div class="wc-dot"></div>
      <div class="wc-dot"></div>`;

    wrapper.appendChild(typing);
    messagesEl.appendChild(wrapper);
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.getElementById("wc-typing-indicator");
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  function setLoading(val) {
    state.loading = val;
    sendBtn.disabled = val;
    inputEl.disabled = val;
  }

  // ── Anthropic API call ─────────────────────────────────────────────────────
  async function callClaude(userMessage) {
    state.history.push({ role: "user", content: userMessage });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: state.history,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    state.history.push({ role: "assistant", content: reply });
    return reply;
  }

  // ── Send message ───────────────────────────────────────────────────────────
  async function sendMessage(text) {
    const message = (text || inputEl.value).trim();
    if (!message || state.loading) return;

    inputEl.value = "";
    inputEl.style.height = "auto";
    suggestionsEl.innerHTML = "";

    appendMessage("user", message);
    setLoading(true);
    showTyping();

    try {
      const reply = await callClaude(message);
      hideTyping();
      appendMessage("assistant", reply);
    } catch (err) {
      hideTyping();
      appendMessage(
        "assistant",
        "I am sorry, I could not connect right now. Please try again in a moment."
      );
      console.error("WedEASE chatbot error:", err);
      state.history.pop();
    } finally {
      setLoading(false);
      inputEl.focus();
    }
  }

  // ── Auto-resize textarea ───────────────────────────────────────────────────
  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + "px";
  });

  // ── Event listeners ────────────────────────────────────────────────────────
  btn.addEventListener("click", () => togglePanel());
  closeBtn.addEventListener("click", () => togglePanel(false));
  sendBtn.addEventListener("click", () => sendMessage());

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  document.addEventListener("click", (e) => {
    if (state.open && !panel.contains(e.target) && !btn.contains(e.target)) {
      togglePanel(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.open) togglePanel(false);
  });

})();