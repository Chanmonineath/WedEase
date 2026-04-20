// frontend/js/invitation.js - Unified MongoDB + localStorage fallback
const API_URL = "http://localhost:5000/api";
let guests = [];

// ============================================
// API Helper Functions
// ============================================
function getAuthToken() {
  // First check AuthManager's sessionStorage
  const currentUser = sessionStorage.getItem("wedease_current");
  if (currentUser) {
    // Create a simple token from the user email
    return btoa(
      JSON.stringify({
        userId: currentUser,
        email: currentUser,
        timestamp: Date.now(),
      }),
    );
  }

  // Then check localStorage
  const token = localStorage.getItem("token");
  if (token) {
    return token;
  }

  return null;
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }
  return data;
}

// ============================================
// Load guests from MongoDB
// ============================================
async function loadGuestsFromMongoDB() {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log("No auth token, using localStorage");
      loadGuestsFromStorage();
      return;
    }

    const result = await apiRequest("/guests");
    guests = result.data;
    saveGuestsToStorage();
    renderGuestList();

    const stats = await apiRequest("/guests/stats");
    if (stats.data.total > 0) {
      const statsSection = document.getElementById("statsSection");
      if (statsSection) statsSection.style.display = "block";
      updateStatsFromAPI(stats.data);
    }
  } catch (error) {
    console.error("Error loading from MongoDB:", error);
    loadGuestsFromStorage();
  }
}

// ============================================
// Add guest to MongoDB
// ============================================
async function addGuestToMongoDB(guestData) {
  try {
    const token = getAuthToken();
    if (!token) {
      // Fallback to localStorage
      const newGuest = {
        id: Date.now().toString(),
        ...guestData,
        status: "pending",
        trackingLink: null,
      };
      guests.push(newGuest);
      saveGuestsToStorage();
      renderGuestList();
      showNotification("Guest added (local mode)", "success");
      return;
    }

    const result = await apiRequest("/guests", {
      method: "POST",
      body: JSON.stringify(guestData),
    });

    guests.push(result.data);
    saveGuestsToStorage();
    renderGuestList();
    showNotification("Guest added to database!", "success");
  } catch (error) {
    console.error("Error adding to MongoDB:", error);
    showNotification("Failed to add guest", "error");
  }
}

// ============================================
// Send invitations via MongoDB
// ============================================
async function sendInvitationsToMongoDB() {
  if (guests.length === 0) {
    showNotification("No guests to send invitations to", "error");
    return;
  }

  const invitationDetails = {
    coupleNames: document.getElementById("coupleNames")?.value || "John & Jane",
    message: document.getElementById("personalMessage")?.value || "",
    weddingDate: document.getElementById("weddingDate")?.value || "",
    venue: document.getElementById("venue")?.value || "",
    theme: document.getElementById("themeSelect")?.value || "classic",
  };

  // Save for RSVP page
  localStorage.setItem("wedease_couple_names", invitationDetails.coupleNames);
  localStorage.setItem("wedease_invitation_message", invitationDetails.message);
  localStorage.setItem("wedease_wedding_date", invitationDetails.weddingDate);
  localStorage.setItem("wedease_venue", invitationDetails.venue);
  localStorage.setItem("wedease_invitation_theme", invitationDetails.theme);

  try {
    const token = getAuthToken();
    if (!token) {
      generateLocalInvitations();
      return;
    }

    const guestIds = guests.map((g) => g._id || g.id);
    const result = await apiRequest("/guests/send-invitations", {
      method: "POST",
      body: JSON.stringify({ guestIds, invitationDetails }),
    });

    guests = result.data;
    saveGuestsToStorage();
    renderGuestList();

    const statsSection = document.getElementById("statsSection");
    if (statsSection) statsSection.style.display = "block";

    let message = `✅ Invitations sent to ${guests.length} guests!\n\n`;
    guests.slice(0, 5).forEach((g) => {
      message += `📧 ${g.name}: ${g.invitationLink}\n`;
    });
    if (guests.length > 5) message += `\n... and ${guests.length - 5} more.`;
    alert(message);
    showNotification(`Invitations sent to ${guests.length} guests!`, "success");
  } catch (error) {
    console.error("Error sending invitations:", error);
    generateLocalInvitations();
  }
}

// ============================================
// Local fallback for invitations
// ============================================
function generateLocalInvitations() {
  const baseUrl = window.location.protocol + "//" + window.location.host;
  const rsvpPath = window.location.pathname.includes("/src/pages/")
    ? "../../rsvp.html"
    : "rsvp.html";
  const rsvpUrl = `${baseUrl}/${rsvpPath}`;

  guests.forEach((guest) => {
    const token = btoa(guest.email + Date.now() + Math.random())
      .replace(/=/g, "")
      .substring(0, 32);
    guest.trackingLink = `${rsvpUrl}?token=${encodeURIComponent(token)}`;
    guest.status = "sent";
  });

  saveGuestsToStorage();
  renderGuestList();
  const statsSection = document.getElementById("statsSection");
  if (statsSection) statsSection.style.display = "block";
  updateStats();

  let message = `✅ Invitations ready for ${guests.length} guests!\n\n`;
  guests.slice(0, 5).forEach((g) => {
    message += `📧 ${g.name}: ${g.trackingLink}\n`;
  });
  if (guests.length > 5) message += `\n... and ${guests.length - 5} more.`;
  alert(message);
}

// ============================================
// Guest Management Functions
// ============================================
function addGuest() {
  const name = document.getElementById("guestName")?.value.trim();
  const email = document.getElementById("guestEmail")?.value.trim();

  if (!name || !email) {
    showNotification("Please enter name and email", "error");
    return;
  }

  const guestData = {
    name: name,
    email: email,
    phone: document.getElementById("guestPhone")?.value.trim() || "",
    guestCount: 1,
    dietaryRestrictions: "",
  };

  addGuestToMongoDB(guestData);
  clearGuestForm();
}

function clearGuestForm() {
  const nameInput = document.getElementById("guestName");
  const emailInput = document.getElementById("guestEmail");
  const phoneInput = document.getElementById("guestPhone");

  if (nameInput) nameInput.value = "";
  if (emailInput) emailInput.value = "";
  if (phoneInput) phoneInput.value = "";
}

function removeGuest(id) {
  if (!confirm("Remove this guest?")) return;
  guests = guests.filter((g) => g.id !== id && g._id !== id);
  saveGuestsToStorage();
  renderGuestList();
  showNotification("Guest removed", "success");
}

function copyTrackingLink(link) {
  navigator.clipboard.writeText(link);
  showNotification("Invitation link copied!", "success");
}

function renderGuestList() {
  const tbody = document.getElementById("guestListBody");
  const guestCountSpan = document.getElementById("guestCount");

  if (!tbody) return;
  guestCountSpan.textContent = guests.length;

  if (guests.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center; padding:2rem;">No guests added yet</td></tr>';
    return;
  }

  tbody.innerHTML = guests
    .map((guest) => {
      const trackingLink = guest.invitationLink || guest.trackingLink;
      return `
      <tr>
        <td title="${escapeHtml(guest.name)}">${escapeHtml(guest.name)}</td>
        <td title="${escapeHtml(guest.email)}">${escapeHtml(guest.email)}</td>
        <td title="${escapeHtml(guest.phone || "")}">${escapeHtml(guest.phone || "—")}</td>
        <td>
          ${
            trackingLink
              ? `<span class="tracking-link-cell" onclick="copyTrackingLink('${trackingLink}')" style="cursor:pointer;color:var(--wed-primary);">
                ${trackingLink.substring(0, 40)}...
               </span>`
              : '<span style="color:var(--wed-text);">Not sent</span>'
          }
        </td>
        <td><span class="status-badge status-${guest.status}">${guest.status}</span></td>
      </tr>
    `;
    })
    .join("");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// CSV Upload
// ============================================
function setupCSVUpload() {
  const csvInput = document.getElementById("csvUpload");
  if (csvInput) {
    const newCsvInput = csvInput.cloneNode(true);
    csvInput.parentNode.replaceChild(newCsvInput, csvInput);

    newCsvInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log("CSV file selected:", file.name);
        parseCSVLocally(file);
        e.target.value = "";
      }
    });
  }
}

function parseCSVLocally(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const lines = content.split(/\r?\n/);
    let count = 0;
    const newGuests = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = parseCSVLine(line);

      if (parts.length >= 2) {
        const name = parts[0].trim().replace(/^"|"$/g, "");
        const email = parts[1].trim().replace(/^"|"$/g, "");

        if (name && email) {
          newGuests.push({
            name: name,
            email: email,
            phone: parts[2] ? parts[2].trim().replace(/^"|"$/g, "") : "",
            guestCount: 1,
            dietaryRestrictions: "",
          });
          count++;
        }
      }
    }

    if (newGuests.length > 0) {
      bulkAddGuestsToMongoDB(newGuests);
    } else {
      showNotification("No valid guests found in CSV", "error");
    }
  };
  reader.readAsText(file);
}

async function bulkAddGuestsToMongoDB(guestsArray) {
  try {
    const token = getAuthToken();
    if (!token) {
      // Fallback to localStorage
      const newGuests = guestsArray.map((g) => ({
        id: Date.now() + Math.random(),
        ...g,
        status: "pending",
        trackingLink: null,
      }));
      guests.push(...newGuests);
      saveGuestsToStorage();
      renderGuestList();
      showNotification(
        `Added ${guestsArray.length} guests (local mode)`,
        "success",
      );
      return;
    }

    const result = await apiRequest("/guests/bulk", {
      method: "POST",
      body: JSON.stringify({ guests: guestsArray }),
    });

    await loadGuestsFromMongoDB();
    showNotification(
      `Added ${guestsArray.length} guests to database!`,
      "success",
    );
  } catch (error) {
    console.error("Error bulk adding guests:", error);
    showNotification("Failed to add guests", "error");
  }
}

function parseCSVLine(line) {
  const result = [];
  let inQuotes = false;
  let currentValue = "";

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(currentValue);
      currentValue = "";
    } else {
      currentValue += char;
    }
  }
  result.push(currentValue);
  return result;
}

// ============================================
// Export Guest List
// ============================================
function exportGuestList() {
  if (guests.length === 0) {
    showNotification("No guests to export", "error");
    return;
  }

  const headers = ["Name", "Email", "Phone", "Status", "RSVP Status"];
  const csvRows = [headers.join(",")];

  guests.forEach((guest) => {
    const row = [
      `"${guest.name}"`,
      `"${guest.email}"`,
      `"${guest.phone || ""}"`,
      guest.status,
      guest.rsvpStatus || "pending",
    ];
    csvRows.push(row.join(","));
  });

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `guests_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification("Guest list exported!", "success");
}

// ============================================
// Clear All Guests
// ============================================
async function clearAllGuests() {
  if (guests.length === 0) {
    showNotification("No guests to clear", "error");
    return;
  }

  if (!confirm(`Delete all ${guests.length} guests?`)) return;

  try {
    const token = getAuthToken();
    if (token) {
      await apiRequest("/guests", { method: "DELETE" });
      await loadGuestsFromMongoDB();
    } else {
      guests = [];
      saveGuestsToStorage();
      renderGuestList();
    }
    const statsSection = document.getElementById("statsSection");
    if (statsSection) statsSection.style.display = "none";
    showNotification("All guests cleared", "success");
  } catch (error) {
    console.error("Error clearing guests:", error);
    showNotification("Failed to clear guests", "error");
  }
}

// ============================================
// Preview Update
// ============================================
function updatePreview() {
  const theme = document.getElementById("themeSelect")?.value || "classic";
  const couple = document.getElementById("coupleNames")?.value || "John & Jane";
  const date = document.getElementById("weddingDate")?.value;
  const venue = document.getElementById("venue")?.value || "Venue TBD";
  const message =
    document.getElementById("personalMessage")?.value ||
    "Join us as we begin our new journey together";

  const previewCard = document.getElementById("previewCard");
  if (previewCard) previewCard.className = `invitation-card ${theme}`;

  const previewCouple = document.getElementById("previewCouple");
  if (previewCouple) previewCouple.textContent = couple;

  const previewVenue = document.getElementById("previewVenue");
  if (previewVenue) previewVenue.textContent = venue;

  const previewMessage = document.getElementById("previewMessage");
  if (previewMessage) previewMessage.textContent = message;

  const previewDate = document.getElementById("previewDate");
  if (previewDate) {
    if (date) {
      previewDate.textContent = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      previewDate.textContent = "Date TBD";
    }
  }

  const divider = document.getElementById("previewDivider");
  if (divider) {
    if (theme === "modern") {
      divider.innerHTML = '<span class="divider-dot"></span>';
    } else if (theme === "garden") {
      divider.innerHTML = '<span class="divider-leaf">✦</span>';
    } else {
      divider.innerHTML = "";
    }
  }
}

// ============================================
// Statistics
// ============================================
function updateStats() {
  const total = guests.filter(
    (g) => g.status === "sent" || g.status === "responded",
  ).length;
  const responded = guests.filter((g) => g.status === "responded").length;

  const statTotal = document.getElementById("statTotal");
  const statConfirmed = document.getElementById("statConfirmed");
  const statPending = document.getElementById("statPending");
  const statDeclined = document.getElementById("statDeclined");
  const rsvpProgress = document.getElementById("rsvpProgress");
  const progressText = document.getElementById("progressText");

  if (statTotal) statTotal.textContent = total;
  if (statConfirmed) statConfirmed.textContent = responded;
  if (statPending) statPending.textContent = total - responded;
  if (statDeclined) statDeclined.textContent = 0;

  const percentage = total > 0 ? (responded / total) * 100 : 0;
  if (rsvpProgress) rsvpProgress.style.width = `${percentage}%`;
  if (progressText)
    progressText.textContent = `${Math.round(percentage)}% response rate`;
}

function updateStatsFromAPI(stats) {
  const statTotal = document.getElementById("statTotal");
  const statConfirmed = document.getElementById("statConfirmed");
  const statPending = document.getElementById("statPending");
  const statDeclined = document.getElementById("statDeclined");
  const rsvpProgress = document.getElementById("rsvpProgress");
  const progressText = document.getElementById("progressText");

  if (statTotal) statTotal.textContent = stats.total || 0;
  if (statConfirmed)
    statConfirmed.textContent = stats.responded || stats.confirmed || 0;
  if (statPending) statPending.textContent = stats.pending || 0;
  if (statDeclined) statDeclined.textContent = stats.declined || 0;

  const total = stats.total || 0;
  const responded = stats.responded || stats.confirmed || 0;
  const percentage = total > 0 ? (responded / total) * 100 : 0;
  if (rsvpProgress) rsvpProgress.style.width = `${percentage}%`;
  if (progressText)
    progressText.textContent = `${Math.round(percentage)}% response rate`;
}

// ============================================
// Storage
// ============================================
function saveGuestsToStorage() {
  localStorage.setItem("wedease_invitation_guests", JSON.stringify(guests));
}

function loadGuestsFromStorage() {
  const saved = localStorage.getItem("wedease_invitation_guests");
  if (saved) {
    guests = JSON.parse(saved);
    console.log(`Loaded ${guests.length} guests from localStorage`);
    if (guests.some((g) => g.status === "sent" || g.status === "responded")) {
      const statsSection = document.getElementById("statsSection");
      if (statsSection) statsSection.style.display = "block";
      updateStats();
    }
  }
}

// ============================================
// Notifications
// ============================================
function showNotification(message, type) {
  const notification = document.createElement("div");
  const bgColor =
    type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#17a2b8";
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 12px 20px;
    border-radius: 10px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: var(--font-sans);
    font-size: 0.9rem;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// ============================================
// Download Sample CSV
// ============================================
window.downloadSampleCSV = function () {
  const sampleData =
    "Name,Email,Phone\nJohn Doe,john@example.com,1234567890\nJane Smith,jane@example.com,0987654321";
  const blob = new Blob([sampleData], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "guest_list_sample.csv";
  a.click();
  URL.revokeObjectURL(url);
};

// ============================================
// Animation Style
// ============================================
const style = document.createElement("style");
style.textContent = `@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`;
document.head.appendChild(style);

// ============================================
// Sync Header with Auth (like theme page)
// ============================================
function syncHeaderWithAuth() {
  const currentUser = sessionStorage.getItem("wedease_current");
  const headerRight = document.querySelector(".header-right");
  
  if (!headerRight) return;
  
  const loginBtn = headerRight.querySelector(".login-btn");
  const existingUserLabel = document.getElementById("user-label");
  
  if (currentUser) {
    // Hide login button
    if (loginBtn) loginBtn.style.display = "none";
    
    // Add user label if not exists
    if (!existingUserLabel) {
      const userLabel = document.createElement("button");
      userLabel.id = "user-label";
      userLabel.className = "login-btn";
      userLabel.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        ${currentUser.split("@")[0]}
      `;
      userLabel.onclick = () => {
        if (confirm("Sign out?")) {
          sessionStorage.removeItem("wedease_current");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "login.html";
        }
      };
      headerRight.appendChild(userLabel);
    }
  } else {
    // Show login button
    if (loginBtn) loginBtn.style.display = "flex";
    if (existingUserLabel) existingUserLabel.remove();
  }
}

// ============================================
// Make functions global for HTML onclick
// ============================================
window.addGuest = addGuest;
window.clearAllGuests = clearAllGuests;
window.exportGuestList = exportGuestList;
window.sendAllInvitations = sendInvitationsToMongoDB;
window.updatePreview = updatePreview;
window.copyTrackingLink = copyTrackingLink;
window.removeGuest = removeGuest;

// ============================================
// SINGLE Initialize - FIXED (no duplicate)
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Invitation page loaded");

  // Sync header with auth
  syncHeaderWithAuth();
  
  setupCSVUpload();

  // Check AuthManager's sessionStorage (same as theme page)
  const currentUser = sessionStorage.getItem("wedease_current");

  console.log("Current user from sessionStorage:", currentUser);

  if (currentUser) {
    console.log("✅ User logged in via AuthManager:", currentUser);
    // Also set localStorage for API compatibility
    if (!localStorage.getItem("token")) {
      localStorage.setItem("token", "auth-token-" + Date.now());
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: currentUser,
          email: currentUser,
          name: currentUser.split("@")[0],
        }),
      );
    }
    loadGuestsFromMongoDB();
  } else {
    console.log("🔓 No user logged in, using localStorage mode");
    loadGuestsFromStorage();
    renderGuestList();
  }

  updatePreview();

  const today = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("weddingDate");
  if (dateInput) dateInput.min = today;
});