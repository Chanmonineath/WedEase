// ===============================================
// WEDEASE CHATBOT - FULLY WORKING
// ===============================================

(function() {
    console.log("🚀 Initializing Chatbot...");
    
    // Use 127.0.0.1 instead of localhost for consistency
    const API_BASE = 'http://127.0.0.1:5000';
    
    // DOM Elements
    const btn = document.getElementById("wedease-chat-btn");
    const panel = document.getElementById("wedease-chat-panel");
    const messagesEl = document.getElementById("wedease-chat-messages");
    const inputEl = document.getElementById("wedease-chat-input");
    const sendBtn = document.getElementById("wedease-chat-send");
    const closeBtn = document.getElementById("wedease-chat-close");
    const suggestionsEl = document.getElementById("wedease-suggestions");
    
    // State
    let isOpen = false;
    let isLoading = false;
    let chatHistory = [];
    
    const SUGGESTIONS = [
        "How do I plan a wedding budget?",
        "What are popular wedding themes?",
        "How many guests should I invite?",
        "When should I send invitations?",
        "How to create a seating chart?"
    ];
    
    // Hide panel initially
    if (panel) {
        panel.style.display = "none";
    }
    
    // Test backend connection
    async function testConnection() {
        try {
            console.log("Testing connection to:", API_BASE + "/api/health");
            const response = await fetch(`${API_BASE}/api/health`);
            if (response.ok) {
                const data = await response.json();
                console.log("✅ Backend connected!", data);
                return true;
            }
        } catch (error) {
            console.error("❌ Cannot connect to backend:", error.message);
            console.error("Make sure backend is running on port 5000");
            return false;
        }
    }
    
    // Run test
    testConnection();
    
    function togglePanel(force) {
        isOpen = force !== undefined ? force : !isOpen;
        
        if (isOpen) {
            panel.style.display = "flex";
            setTimeout(() => panel.classList.add("open"), 10);
            if (chatHistory.length === 0) {
                appendMessage("assistant", "Hello! I'm your WedEASE wedding planning assistant! What would you like to know?");
                renderSuggestions();
            }
            if (inputEl) inputEl.focus();
        } else {
            panel.classList.remove("open");
            setTimeout(() => panel.style.display = "none", 300);
        }
    }
    
    function renderSuggestions() {
        if (!suggestionsEl) return;
        suggestionsEl.innerHTML = "";
        SUGGESTIONS.forEach(question => {
            const chip = document.createElement("button");
            chip.className = "wc-suggestion";
            chip.textContent = question;
            chip.onclick = (e) => {
                e.preventDefault();
                console.log("Suggestion clicked:", question);
                if (inputEl) {
                    inputEl.value = question;
                }
                sendMessage();
            };
            suggestionsEl.appendChild(chip);
        });
    }
    
    function appendMessage(role, text) {
        if (!messagesEl) return;
        const messageDiv = document.createElement("div");
        messageDiv.className = `wc-msg ${role}`;
        const bubble = document.createElement("div");
        bubble.className = "wc-bubble";
        bubble.textContent = text;
        messageDiv.appendChild(bubble);
        messagesEl.appendChild(messageDiv);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    
    function showTyping() {
        hideTyping();
        const typingDiv = document.createElement("div");
        typingDiv.className = "wc-msg assistant";
        typingDiv.id = "wc-typing-indicator";
        typingDiv.innerHTML = `<div class="wc-typing"><div class="wc-dot"></div><div class="wc-dot"></div><div class="wc-dot"></div></div>`;
        messagesEl.appendChild(typingDiv);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    
    function hideTyping() {
        const typing = document.getElementById("wc-typing-indicator");
        if (typing) typing.remove();
    }
    
    async function sendMessage() {
        const message = inputEl?.value.trim();
        if (!message || isLoading) {
            console.log("No message or already loading");
            return;
        }
        
        console.log("Sending message:", message);
        
        // Clear input
        inputEl.value = "";
        
        // Clear suggestions
        if (suggestionsEl) {
            suggestionsEl.innerHTML = "";
        }
        
        // Add user message
        appendMessage("user", message);
        chatHistory.push({ role: "user", content: message });
        
        // Set loading state
        isLoading = true;
        if (sendBtn) sendBtn.disabled = true;
        if (inputEl) inputEl.disabled = true;
        showTyping();
        
        try {
            console.log("Calling API:", `${API_BASE}/api/chatbot`);
            
            const response = await fetch(`${API_BASE}/api/chatbot`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: chatHistory }),
            });
            
            console.log("Response status:", response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log("Response data:", data);
            
            if (data.success && data.reply) {
                hideTyping();
                appendMessage("assistant", data.reply);
                chatHistory.push({ role: "assistant", content: data.reply });
            } else {
                throw new Error(data.message || "Unknown error");
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            hideTyping();
            appendMessage("assistant", `Error: ${error.message}. Make sure backend is running on port 5000.`);
        } finally {
            isLoading = false;
            if (sendBtn) sendBtn.disabled = false;
            if (inputEl) {
                inputEl.disabled = false;
                inputEl.focus();
            }
        }
    }
    
    // Event listeners
    if (btn) {
        btn.addEventListener("click", () => togglePanel());
        console.log("✅ Button listener added");
    }
    
    if (closeBtn) {
        closeBtn.addEventListener("click", () => togglePanel(false));
    }
    
    if (sendBtn) {
        sendBtn.addEventListener("click", (e) => {
            e.preventDefault();
            sendMessage();
        });
    }
    
    if (inputEl) {
        inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Close on escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen) {
            togglePanel(false);
        }
    });
    
    console.log("✅ Chatbot initialized");
})();