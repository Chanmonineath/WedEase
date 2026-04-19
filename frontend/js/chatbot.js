(function () {
    console.log("Initializing Chatbot...");

    const API_BASE = 'http://127.0.0.1:5000';
    let currentChatId = null;
    let chatHistory = [];
    let isLoading = false;
    let isOpen = false;
    let isSending = false;

    const btn        = document.getElementById("wedease-chat-btn");
    const panel      = document.getElementById("wedease-chat-panel");
    const messagesEl = document.getElementById("wedease-chat-messages");
    const inputEl    = document.getElementById("wedease-chat-input");
    const sendBtn    = document.getElementById("wedease-chat-send");
    const suggestionsEl = document.getElementById("wedease-suggestions");

    const SUGGESTIONS = [
        "How do I plan a wedding budget?",
        "What are popular wedding themes?",
        "How many guests should I invite?",
        "When should I send invitations?",
        "How to create a seating chart?"
    ];

    function getAuthToken() {
        return localStorage.getItem('wedease_auth_token') ||
               sessionStorage.getItem('wedease_auth_token');
    }

    function hidePanel() {
        if (panel) {
            panel.classList.remove('open');
            setTimeout(() => {
                panel.style.display = 'none';
            }, 300);
        }
        isOpen = false;
    }

    function showPanel() {
        if (panel) {
            panel.style.display = 'flex';
            setTimeout(() => panel.classList.add('open'), 10);
            if (chatHistory.length === 0 && messagesEl.children.length === 0) {
                startNewChat();
            }
            if (inputEl) inputEl.focus();
        }
        isOpen = true;
    }

    function togglePanel() {
        isOpen ? hidePanel() : showPanel();
    }

    function buildHeader() {
        const header = document.getElementById('wedease-chat-header');
        if (!header) return;

        header.innerHTML = `
            <div id="wedease-chat-header-left">
                <div class="header-avatar">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </div>
                <div class="header-text-wrap">
                    <div id="wedease-chat-title">WedEase</div>
                    <div id="wedease-chat-subtitle">
                        <span class="status-dot"></span>Wedding assistant
                    </div>
                </div>
            </div>
            <div class="header-buttons">
                <button class="history-btn" id="history-btn">History</button>
                <button id="wedease-chat-close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;

        document.getElementById('wedease-chat-close').addEventListener('click', hidePanel);
        document.getElementById('history-btn').addEventListener('click', showHistoryPanel);
    }

    function buildChatBtn() {
        if (!btn) return;
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
        `;
    }

    function buildSendBtn() {
        if (!sendBtn) return;
        sendBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" fill="white" style="transform:translateX(1px)">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
            </svg>
        `;
    }

    function appendMessage(role, text) {
        if (!messagesEl) return;
        const wrap = document.createElement("div");
        wrap.className = `message ${role}`;
        const bubble = document.createElement("div");
        bubble.className = "message-bubble";
        bubble.textContent = text;
        wrap.appendChild(bubble);
        messagesEl.appendChild(wrap);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function appendDateSeparator() {
        if (!messagesEl) return;
        const sep = document.createElement("div");
        sep.className = "date-separator";
        sep.innerHTML = `<span>Today</span>`;
        messagesEl.appendChild(sep);
    }

    function clearMessages() {
        if (messagesEl) messagesEl.innerHTML = '';
    }

    function showTyping() {
        hideTyping();
        const wrap = document.createElement("div");
        wrap.className = "message assistant";
        wrap.id = "typing-indicator";
        wrap.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
        messagesEl.appendChild(wrap);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
        const t = document.getElementById("typing-indicator");
        if (t) t.remove();
    }

    function renderSuggestions() {
        if (!suggestionsEl) return;
        suggestionsEl.innerHTML = "";

        if (chatHistory.length <= 1) {
            SUGGESTIONS.forEach(q => {
                const chip = document.createElement("button");
                chip.className = "suggestion-chip";
                chip.textContent = q;
                chip.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isLoading || isSending) return;
                    // Directly call the send function without touching input
                    sendMessageDirect(q);
                };
                suggestionsEl.appendChild(chip);
            });
            suggestionsEl.style.display = "flex";
        } else {
            suggestionsEl.style.display = "none";
        }
    }

    // New function for direct sending from suggestions
    async function sendMessageDirect(message) {
        if (!message || isLoading || isSending) return;
        
        isSending = true;
        
        if (suggestionsEl) suggestionsEl.style.display = "none";
        
        if (sendBtn) sendBtn.disabled = true;

        appendMessage("user", message);
        chatHistory.push({ role: "user", content: message });

        isLoading = true;
        showTyping();

        try {
            const token   = getAuthToken();
            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res  = await fetch(`${API_BASE}/api/chatbot`, {
                method: "POST",
                headers,
                body: JSON.stringify({ messages: chatHistory, chatId: currentChatId }),
            });
            const data = await res.json();

            if (data.success && data.reply) {
                hideTyping();
                appendMessage("assistant", data.reply);
                chatHistory.push({ role: "assistant", content: data.reply });
                if (data.chatId && !currentChatId) {
                    currentChatId = data.chatId;
                    console.log("Chat saved:", currentChatId);
                }
            } else {
                throw new Error(data.message || "Unknown error");
            }
        } catch (err) {
            console.error("Chatbot error:", err);
            hideTyping();
            appendMessage("assistant", "Sorry, I couldn't connect. Please make sure the backend is running.");
        } finally {
            isLoading = false;
            isSending = false;
            if (sendBtn) sendBtn.disabled = false;
            if (inputEl) {
                inputEl.disabled = false;
                inputEl.focus();
            }
        }
    }

    function startNewChat() {
        currentChatId = null;
        chatHistory = [];
        isSending = false;
        clearMessages();
        appendDateSeparator();
        const welcome = "Hello! I'm your WedEASE wedding planning assistant. What would you like to know?";
        chatHistory.push({ role: "assistant", content: welcome });
        appendMessage("assistant", welcome);
        renderSuggestions();
        if (inputEl) inputEl.value = '';
        console.log("Started new chat");
    }

    function showHistoryPanel() {
        const token = getAuthToken();
        if (!token) {
            appendMessage("assistant", "Please log in to view chat history.");
            return;
        }

        let historyPanel = document.getElementById('history-panel');
        if (!historyPanel) {
            historyPanel = document.createElement('div');
            historyPanel.id = 'history-panel';
            historyPanel.className = 'history-panel';
            panel.appendChild(historyPanel);
        }

        historyPanel.style.display = 'flex';
        messagesEl.style.display = 'none';
        if (suggestionsEl) suggestionsEl.style.display = 'none';

        fetch(`${API_BASE}/api/chatbot/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data && data.data.length > 0) {
                renderHistoryList(data.data, historyPanel);
            } else {
                renderHistoryShell(historyPanel, '<div class="history-empty">No saved conversations yet.</div>');
            }
        })
        .catch(() => {
            renderHistoryShell(historyPanel, '<div class="history-empty">Failed to load history.</div>');
        });
    }

    function renderHistoryShell(hp, bodyHtml) {
        hp.innerHTML = `
            <div class="history-header">
                <span>Past conversations</span>
                <button class="history-new-btn">+ New chat</button>
            </div>
            <div class="history-list">${bodyHtml}</div>
        `;
        setupHistoryShellEvents(hp);
    }

    function setupHistoryShellEvents(hp) {
        const newBtn = hp.querySelector('.history-new-btn');
        if (newBtn) {
            newBtn.onclick = () => {
                startNewChat();
                hp.style.display = 'none';
                messagesEl.style.display = 'flex';
                if (suggestionsEl && chatHistory.length <= 1) {
                    suggestionsEl.style.display = 'flex';
                }
            };
        }
    }

    function closeHistoryPanel(hp) {
        hp.style.display = 'none';
        messagesEl.style.display = 'flex';
        if (suggestionsEl && chatHistory.length <= 1) {
            suggestionsEl.style.display = 'flex';
        }
    }

    function renderHistoryList(chats, hp) {
        const itemsHtml = chats.map(chat => {
            const d = new Date(chat.updatedAt);
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `
                <div class="history-item" data-id="${chat._id}">
                    <div class="history-item-info">
                        <div class="history-item-title">${escapeHtml(chat.title)}</div>
                        <div class="history-item-date">${label}</div>
                    </div>
                    <button class="history-delete" data-id="${chat._id}">Remove</button>
                </div>
            `;
        }).join('');

        hp.innerHTML = `
            <div class="history-header">
                <span>Past conversations</span>
                <button class="history-new-btn">+ New chat</button>
            </div>
            <div class="history-list">${itemsHtml}</div>
        `;

        setupHistoryShellEvents(hp);

        hp.querySelectorAll('.history-item').forEach(item => {
            item.onclick = (e) => {
                if (e.target.classList.contains('history-delete')) return;
                loadChatSession(item.dataset.id);
                closeHistoryPanel(hp);
                if (suggestionsEl) suggestionsEl.style.display = 'none';
            };
        });

        hp.querySelectorAll('.history-delete').forEach(delBtn => {
            delBtn.onclick = async (e) => {
                e.stopPropagation();
                if (!confirm('Delete this conversation?')) return;
                const token = getAuthToken();
                await fetch(`${API_BASE}/api/chatbot/${delBtn.dataset.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showHistoryPanel();
            };
        });
    }

    async function loadChatSession(chatId) {
        const token = getAuthToken();
        if (!token) return;
        try {
            const res  = await fetch(`${API_BASE}/api/chatbot/${chatId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                currentChatId = data.data._id;
                chatHistory   = data.data.messages || [];
                clearMessages();
                appendDateSeparator();
                chatHistory.forEach(m => appendMessage(m.role, m.content));
                if (!isOpen) togglePanel();
            }
        } catch (err) {
            console.error("Failed to load chat:", err);
        }
    }

    async function sendMessage() {
        const message = inputEl?.value.trim();
        if (!message || isLoading || isSending) return;

        isSending = true;
        inputEl.value = "";
        if (suggestionsEl) suggestionsEl.style.display = "none";
        
        if (sendBtn) sendBtn.disabled = true;
        if (inputEl) inputEl.disabled = true;

        appendMessage("user", message);
        chatHistory.push({ role: "user", content: message });

        isLoading = true;
        showTyping();

        try {
            const token   = getAuthToken();
            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res  = await fetch(`${API_BASE}/api/chatbot`, {
                method: "POST",
                headers,
                body: JSON.stringify({ messages: chatHistory, chatId: currentChatId }),
            });
            const data = await res.json();

            if (data.success && data.reply) {
                hideTyping();
                appendMessage("assistant", data.reply);
                chatHistory.push({ role: "assistant", content: data.reply });
                if (data.chatId && !currentChatId) {
                    currentChatId = data.chatId;
                    console.log("Chat saved:", currentChatId);
                }
            } else {
                throw new Error(data.message || "Unknown error");
            }
        } catch (err) {
            console.error("Chatbot error:", err);
            hideTyping();
            appendMessage("assistant", "Sorry, I couldn't connect. Please make sure the backend is running.");
        } finally {
            isLoading = false;
            isSending = false;
            if (sendBtn) sendBtn.disabled = false;
            if (inputEl) {
                inputEl.disabled = false;
                inputEl.focus();
            }
        }
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    if (btn) btn.addEventListener("click", togglePanel);
    if (sendBtn) sendBtn.addEventListener("click", e => { e.preventDefault(); sendMessage(); });
    if (inputEl) {
        inputEl.addEventListener("keydown", e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
        });
    }
    document.addEventListener("keydown", e => { if (e.key === "Escape" && isOpen) hidePanel(); });

    if (panel) panel.style.display = "none";

    buildChatBtn();
    buildHeader();
    buildSendBtn();
    startNewChat();

    console.log("Chatbot ready");
})();