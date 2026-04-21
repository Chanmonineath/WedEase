// frontend/js/invitation.js - Complete Working Version
const API_URL = "http://127.0.0.1:5000/api";
let guests = [];
let currentUserId = null;

// ============================================
// API Helper Functions
// ============================================
function getAuthToken() {
  const token = localStorage.getItem("wedease_auth_token");
  if (token) return token;

  const sessionToken = sessionStorage.getItem("wedease_auth_token");
  if (sessionToken) return sessionToken;

  const demoUser = localStorage.getItem("wedease_current_user");
  if (demoUser) {
    try {
      const user = JSON.parse(demoUser);
      if (user && user.email) {
        return btoa(JSON.stringify({ userId: user.email, email: user.email }));
      }
    } catch (e) {}
  }

  return null;
}

function getCurrentUser() {
  try {
    const userStr =
      localStorage.getItem("wedease_current_user") ||
      sessionStorage.getItem("wedease_current_user");
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {}
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
    console.log("Auth token present?", !!token);

    if (!token) {
      console.log("No auth token, using localStorage");
      loadGuestsFromStorage();
      return;
    }

    console.log("Fetching guests from MongoDB...");
    const result = await apiRequest("/invitation-guests");
    console.log("API response:", result);

    if (result.data && result.data.length > 0) {
      guests = result.data;
      console.log(`Loaded ${guests.length} guests from MongoDB`);
    } else {
      console.log("No guests found in MongoDB, checking localStorage");
      loadGuestsFromStorage();
    }

    saveGuestsToStorage();
    renderGuestList();

    try {
      const stats = await apiRequest("/invitation-guests/stats");
      if (stats.data && stats.data.total > 0) {
        const statsSection = document.getElementById("statsSection");
        if (statsSection) statsSection.style.display = "block";
        updateStatsFromAPI(stats.data);
      }
    } catch (statsError) {
      console.log("Stats not available yet");
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
    console.log("Adding guest to MongoDB, token present?", !!token);

    if (!token) {
      console.log("No auth token, using localStorage fallback");
      const newGuest = {
        id: Date.now().toString(),
        ...guestData,
        status: "pending",
        invitationLink: null,
      };
      guests.push(newGuest);
      saveGuestsToStorage();
      renderGuestList();
      showNotification(
        "Guest added (local mode - login to save to database)",
        "success",
      );
      return;
    }

    console.log("Sending guest to MongoDB:", guestData);
    const result = await apiRequest("/invitation-guests", {
      method: "POST",
      body: JSON.stringify(guestData),
    });

    console.log("Guest added to MongoDB:", result);
    guests.push(result.data);
    saveGuestsToStorage();
    renderGuestList();
    showNotification("Guest added to database!", "success");
  } catch (error) {
    console.error("Error adding to MongoDB:", error);
    showNotification("Failed to add guest: " + error.message, "error");
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

  const unsentGuests = guests.filter(
    (g) => g.status !== "sent" && !g.invitationLink,
  );

  if (unsentGuests.length === 0) {
    showNotification("All guests already have invitations", "info");
    return;
  }

  const invitationDetails = {
    coupleNames: document.getElementById("coupleNames")?.value || "John & Jane",
    message: document.getElementById("personalMessage")?.value || "",
    weddingDate: document.getElementById("weddingDate")?.value || "",
    venue: document.getElementById("venue")?.value || "",
    theme: document.getElementById("themeSelect")?.value || "classic",
  };

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

    const guestIds = unsentGuests.map((g) => g._id || g.id);
    console.log("Sending invitations to guest IDs:", guestIds);
    console.log("Invitation details:", invitationDetails);

    const result = await apiRequest("/invitation-guests/send-invitations", {
      method: "POST",
      body: JSON.stringify({ guestIds, invitationDetails }),
    });

    console.log("Send invitations result:", result);

    // FIX: use String() on both sides so ObjectId vs string comparison works
    if (result.data && result.data.length) {
      result.data.forEach((updatedGuest) => {
        if (!updatedGuest) return; // FIX: skip null entries
        const index = guests.findIndex(
          (g) => String(g._id || g.id) === String(updatedGuest._id || updatedGuest.id),
        );
        if (index !== -1) {
          guests[index] = updatedGuest;
        }
      });
    }

    saveGuestsToStorage();
    renderGuestList();

    const statsSection = document.getElementById("statsSection");
    if (statsSection) statsSection.style.display = "block";

    let message = `✅ Invitations sent to ${unsentGuests.length} guests!\n\n`;
    unsentGuests.slice(0, 5).forEach((g) => {
      const updatedGuest = guests.find(
        (u) => String(u._id || u.id) === String(g._id || g.id),
      );
      const link = updatedGuest?.invitationLink || "Link not available";
      message += `📧 ${g.name}: ${link}\n`;
    });
    if (unsentGuests.length > 5) {
      message += `\n... and ${unsentGuests.length - 5} more.`;
    }
    alert(message);
    showNotification(
      `Invitations sent to ${unsentGuests.length} guests!`,
      "success",
    );

    try {
      const stats = await apiRequest("/invitation-guests/stats");
      if (stats.data) updateStatsFromAPI(stats.data);
    } catch (e) {
      console.log("Stats refresh error:", e);
    }
  } catch (error) {
    console.error("Error sending invitations:", error);
    showNotification("Failed to send invitations: " + error.message, "error");
    generateLocalInvitations();
  }
}

// ============================================
// Local fallback for invitations
// ============================================
function generateLocalInvitations() {
  const baseUrl = window.location.protocol + "//" + window.location.host;
  const rsvpUrl = `${baseUrl}/rsvp.html`;

  console.log("RSVP URL:", rsvpUrl);
  console.log("Current path:", window.location.pathname);

  let sentCount = 0;

  guests.forEach((guest) => {
    if (!guest.invitationLink) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const emailPrefix = guest.email.split("@")[0].substring(0, 8);
      const token = `${emailPrefix}-${timestamp}-${random}`;

      guest.invitationLink = `${rsvpUrl}?token=${encodeURIComponent(token)}`;
      guest.status = "sent";
      sentCount++;
      console.log(`Generated link for ${guest.name}: ${guest.invitationLink}`);
    }
  });

  saveGuestsToStorage();
  renderGuestList();

  const statsSection = document.getElementById("statsSection");
  if (statsSection) statsSection.style.display = "block";
  updateStats();

  let message = `✅ Invitations ready for ${sentCount} guests!\n\n`;
  guests.slice(0, 5).forEach((g) => {
    if (g.invitationLink) {
      message += `📧 ${g.name}: ${g.invitationLink}\n`;
    }
  });
  if (guests.length > 5) message += `\n... and ${guests.length - 5} more.`;
  alert(message);

  showNotification(`${sentCount} invitation links generated!`, "success");
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

  const token = getAuthToken();
  if (token) {
    apiRequest(`/invitation-guests/${id}`, { method: "DELETE" })
      .then(() => {
        guests = guests.filter((g) => g._id !== id && g.id !== id);
        saveGuestsToStorage();
        renderGuestList();
        showNotification("Guest removed", "success");
      })
      .catch((err) => {
        console.error("Error deleting guest:", err);
        showNotification("Failed to delete guest", "error");
      });
  } else {
    guests = guests.filter((g) => g.id !== id && g._id !== id);
    saveGuestsToStorage();
    renderGuestList();
    showNotification("Guest removed", "success");
  }
}

function copyTrackingLink(link) {
  navigator.clipboard.writeText(link);
  showNotification("Invitation link copied!", "success");
}

function renderGuestList() {
  const tbody = document.getElementById("guestListBody");
  const guestCountSpan = document.getElementById("guestCount");

  if (!tbody) return;

  console.log("Rendering guest list, count:", guests.length);

  if (guestCountSpan) guestCountSpan.textContent = guests.length;

  if (guests.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:2rem;">
          No guests added yet
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = guests
    .map((guest) => {
      const trackingLink = guest.invitationLink;
      const guestId = guest._id || guest.id;
      const status = guest.status || "pending";
      const rsvpStatus = guest.rsvpStatus;

      let displayStatus = status;
      if (rsvpStatus === "confirmed") displayStatus = "responded";
      else if (rsvpStatus === "declined") displayStatus = "declined";
      else if (status === "sent") displayStatus = "sent";
      else displayStatus = "pending";

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
        <td>
          <span class="status-badge status-${displayStatus}">
            ${displayStatus}
          </span>
        </td>
      </tr>
    `;
    })
    .join("");
}

function escapeHtml(text) {
  if (!text) return "";
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

        if (name && email && email.includes("@")) {
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
      const newGuests = guestsArray.map((g) => ({
        id: Date.now() + Math.random(),
        ...g,
        status: "pending",
        invitationLink: null,
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

    const result = await apiRequest("/invitation-guests/bulk", {
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
    showNotification("Failed to add guests: " + error.message, "error");
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

  const headers = ["Name", "Email", "Phone", "Status", "RSVP Status", "Invitation Link"];
  const csvRows = [headers.join(",")];

  guests.forEach((guest) => {
    const row = [
      `"${guest.name}"`,
      `"${guest.email}"`,
      `"${guest.phone || ""}"`,
      guest.status || "pending",
      guest.rsvpStatus || "pending",
      `"${guest.invitationLink || ""}"`,
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

  if (!confirm(`Delete all ${guests.length} guests? This cannot be undone.`))
    return;

  try {
    const token = getAuthToken();

    if (token) {
      await apiRequest("/invitation-guests", { method: "DELETE" });
      console.log("All guests deleted from database");

      guests = [];
      localStorage.removeItem("wedease_invitation_guests");
      renderGuestList();

      const statsSection = document.getElementById("statsSection");
      if (statsSection) statsSection.style.display = "none";

      const statTotal = document.getElementById("statTotal");
      const statConfirmed = document.getElementById("statConfirmed");
      const statPending = document.getElementById("statPending");
      const statDeclined = document.getElementById("statDeclined");
      const rsvpProgress = document.getElementById("rsvpProgress");
      const progressText = document.getElementById("progressText");
      const guestCountSpan = document.getElementById("guestCount");

      if (statTotal) statTotal.textContent = "0";
      if (statConfirmed) statConfirmed.textContent = "0";
      if (statPending) statPending.textContent = "0";
      if (statDeclined) statDeclined.textContent = "0";
      if (rsvpProgress) rsvpProgress.style.width = "0%";
      if (progressText) progressText.textContent = "0% response rate";
      if (guestCountSpan) guestCountSpan.textContent = "0";

      showNotification("All guests cleared from database!", "success");

      setTimeout(async () => {
        await loadGuestsFromMongoDB();
      }, 500);
    } else {
      guests = [];
      localStorage.removeItem("wedease_invitation_guests");
      renderGuestList();

      const statsSection = document.getElementById("statsSection");
      if (statsSection) statsSection.style.display = "none";

      const guestCountSpan = document.getElementById("guestCount");
      if (guestCountSpan) guestCountSpan.textContent = "0";

      showNotification("All guests cleared from local storage", "success");
    }
  } catch (error) {
    console.error("Error clearing guests:", error);
    showNotification("Failed to clear guests: " + error.message, "error");
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
  if (previewCard) {
    previewCard.className = "invitation-card";
    previewCard.classList.add(theme);
  }

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
}

// ============================================
// Statistics
// ============================================
function updateStats() {
  const total = guests.length;
  const responded = guests.filter(
    (g) => g.status === "responded" || g.rsvpStatus === "confirmed",
  ).length;
  const pending = guests.filter(
    (g) => g.status === "sent" && (!g.rsvpStatus || g.rsvpStatus === "pending"),
  ).length;
  const declined = guests.filter((g) => g.rsvpStatus === "declined").length;

  const statTotal = document.getElementById("statTotal");
  const statConfirmed = document.getElementById("statConfirmed");
  const statPending = document.getElementById("statPending");
  const statDeclined = document.getElementById("statDeclined");
  const rsvpProgress = document.getElementById("rsvpProgress");
  const progressText = document.getElementById("progressText");

  if (statTotal) statTotal.textContent = total;
  if (statConfirmed) statConfirmed.textContent = responded;
  if (statPending) statPending.textContent = pending;
  if (statDeclined) statDeclined.textContent = declined;

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
    statConfirmed.textContent = stats.confirmed || stats.responded || 0;
  if (statPending) statPending.textContent = stats.pending || 0;
  if (statDeclined) statDeclined.textContent = stats.declined || 0;

  const total = stats.total || 0;
  const responded = stats.confirmed || stats.responded || 0;
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
// Initialize
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Invitation page loaded");

  setupCSVUpload();

  const currentUser = getCurrentUser();
  console.log("Current user:", currentUser);

  if (currentUser) {
    console.log("✅ User logged in:", currentUser.email);
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