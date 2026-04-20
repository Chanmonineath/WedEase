/*******************************************************
 *  W E D E A S E – Track & Manage (Ballroom Layout)
 *  - Guest list (scroll >5 rows)
 *  - Seating: full ballroom with zones A, C (VIP), B
 *    -> round tables, 10 seats, names on each chair
 *  - Gifts: type (with custom "Other"), from, value
 *******************************************************/

/* ==============================
   API CONFIG
============================== */
const API_BASE = 'http://127.0.0.1:5000';

function getAuthToken() {
    return localStorage.getItem('wedease_auth_token') || sessionStorage.getItem('wedease_auth_token');
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
    };
}

/* ==============================
   DATA STORAGE
============================== */
let guests = [];
let seatingTables = []; // {id, zone, label, capacity, guests:[guestId]}
let gifts = [];

let editingGuestId = null;
let editingGiftId = null;

// Seating stays in localStorage — it's a layout preference, not critical data
const SEATING_KEY = "wedease_seating";

function saveSeating() {
    localStorage.setItem(SEATING_KEY, JSON.stringify(seatingTables));
}

function loadSeating() {
    seatingTables = JSON.parse(localStorage.getItem(SEATING_KEY) || "[]");
}

/* ==============================
   UTILITIES
============================== */
function $(id) {
    return document.getElementById(id);
}

function showSuccess(msg) {
    const el = $("successMessage");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2500);
}

function showError(msg) {
    const el = $("errorMessage");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 3000);
}

/* ==============================
   LOAD STATE FROM DB
============================== */
async function loadState() {
    loadSeating();

    const token = getAuthToken();
    if (!token) {
        // Not logged in — start with empty arrays
        guests = [];
        gifts = [];
        return;
    }

    try {
        const [gRes, gifRes] = await Promise.all([
            fetch(`${API_BASE}/api/guests`, { headers: authHeaders() }),
            fetch(`${API_BASE}/api/gifts`, { headers: authHeaders() })
        ]);

        const gData = await gRes.json();
        const gifData = await gifRes.json();

        if (gData.success) {
            // Map _id -> id so all existing code works unchanged
            guests = gData.data.map(g => ({ ...g, id: g._id.toString() }));
        } else {
            guests = [];
        }

        if (gifData.success) {
            gifts = gifData.data.map(g => ({ ...g, id: g._id.toString() }));
        } else {
            gifts = [];
        }
    } catch (err) {
        console.error("Failed to load from DB:", err);
        guests = [];
        gifts = [];
        showError("Could not connect to server. Check your backend is running.");
    }
}

/* ==============================
   MODALS
============================== */
function openGuestModal(id = null) {
    editingGuestId = id;
    const modal = $("guestModal");
    if (!modal) return;

    // defaults
    $("guestName").value = "";
    $("guestGroupSelect").value = "";
    $("guestGroupCustom").value = "";
    $("guestRSVP").value = "pending";
    toggleGuestCustomGroup();

    if (id) {
        const g = guests.find(g => g.id === id);
        if (g) {
            $("guestName").value = g.name || "";
            $("guestRSVP").value = g.rsvp || "pending";

            // match group to dropdown or custom
            const standard = [
                "Bride's Family",
                "Classmates",
                "Co-workers",
                "VIP"
            ];
            if (standard.includes(g.group)) {
                $("guestGroupSelect").value = g.group;
                $("guestGroupCustom").value = "";
            } else if (g.group) {
                $("guestGroupSelect").value = "__other";
                $("guestGroupCustom").value = g.group;
            }
            toggleGuestCustomGroup();
        }
    }

    modal.classList.add("active");
    modal.classList.remove("hidden");
}

function closeGuestModal() {
    const modal = $("guestModal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.classList.add("hidden");
    editingGuestId = null;
}

function openGiftModal(id = null) {
    editingGiftId = id;
    const modal = $("giftModal");
    if (!modal) return;

    // Fill guest dropdown
    const select = $("giftGuest");
    select.innerHTML = `<option value="">Select guest (optional)</option>`;
    guests.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g.id;
        opt.textContent = g.name;
        select.appendChild(opt);
    });

    if (!id) {
        $("giftType").value = "money";
        $("giftTypeCustom").value = "";
        $("giftBudget").value = "";
        $("giftGuest").value = "";
    } else {
        const gift = gifts.find(g => g.id === id);
        if (gift) {
            const standardTypes = ["money", "jewelry", "household", "experience", "other"];
            if (standardTypes.includes(gift.type)) {
                $("giftType").value = gift.type;
                $("giftTypeCustom").value = "";
            } else {
                $("giftType").value = "other";
                $("giftTypeCustom").value = gift.type;
            }
            $("giftBudget").value = gift.budget;
            $("giftGuest").value = gift.guestId || "";
        }
    }

    toggleGiftCustomInput();
    modal.classList.add("active");
    modal.classList.remove("hidden");
}

function closeGiftModal() {
    const modal = $("giftModal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.classList.add("hidden");
    editingGiftId = null;
}

/* ==============================
   GUEST MANAGEMENT
============================== */
function getGuestGroupValue() {
    const selectVal = $("guestGroupSelect").value;
    if (selectVal === "__other") {
        const custom = $("guestGroupCustom").value.trim();
        return custom || "Other";
    }
    return selectVal || "";
}

async function saveGuest() {
    const name = $("guestName").value.trim();
    if (!name) return showError("Guest name is required");

    const group = getGuestGroupValue();
    const rsvp = $("guestRSVP").value || "pending";

    try {
        if (editingGuestId) {
            const res = await fetch(`${API_BASE}/api/guests/${editingGuestId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ name, group, rsvp })
            });
            const data = await res.json();
            if (data.success) {
                const index = guests.findIndex(x => x.id === editingGuestId);
                if (index !== -1) {
                    guests[index] = { ...data.data, id: data.data._id.toString() };
                }
                showSuccess("Guest updated");
            } else {
                showError(data.message || "Failed to update guest");
                return;
            }
        } else {
            const res = await fetch(`${API_BASE}/api/guests`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ name, group, rsvp })
            });
            const data = await res.json();
            if (data.success) {
                guests.push({ ...data.data, id: data.data._id.toString() });
                showSuccess("Guest added");
            } else {
                showError(data.message || "Failed to add guest");
                return;
            }
        }
    } catch (err) {
        console.error("saveGuest error:", err);
        showError("Could not save guest. Check your connection.");
        return;
    }

    editingGuestId = null;
    closeGuestModal();
    refresh();
}

async function deleteGuest(id) {
    if (!confirm("Delete this guest?")) return;

    try {
        await fetch(`${API_BASE}/api/guests/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
    } catch (err) {
        console.error("deleteGuest error:", err);
    }

    guests = guests.filter(g => g.id !== id);

    // Remove from seating
    seatingTables.forEach(t => {
        t.guests = t.guests.filter(gid => gid !== id);
    });
    saveSeating();

    refresh();
    showSuccess("Guest deleted");
}

function formatRSVP(status) {
    if (status === "yes") return `<span class="badge badge-success">Confirmed</span>`;
    if (status === "no") return `<span class="badge badge-danger">Declined</span>`;
    return `<span class="badge badge-warning">Pending</span>`;
}

function updateGroupFilterOptions() {
    const select = $("guestGroupFilter");
    if (!select) return;

    const groups = Array.from(
        new Set(
            guests
                .map(g => (g.group || "").trim())
                .filter(g => g.length > 0)
        )
    ).sort((a, b) => a.localeCompare(b));

    const currentValue = select.value;
    select.innerHTML = `<option value="">All groups</option>`;
    groups.forEach(group => {
        const opt = document.createElement("option");
        opt.value = group;
        opt.textContent = group;
        select.appendChild(opt);
    });

    if (groups.includes(currentValue)) {
        select.value = currentValue;
    }
}

function getFilteredGuests() {
    const search = ($("guestSearch")?.value || "").toLowerCase();
    const groupFilter = $("guestGroupFilter")?.value || "";
    const rsvpFilter = $("guestRsvpFilter")?.value || "";

    return guests.filter(g => {
        if (search && !g.name.toLowerCase().includes(search)) return false;
        if (groupFilter && (g.group || "") !== groupFilter) return false;
        if (rsvpFilter && g.rsvp !== rsvpFilter) return false;
        return true;
    });
}

function renderGuestList() {
    const tbody = $("guestTable");
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = getFilteredGuests().sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    if (!filtered.length) {
        tbody.innerHTML =
            `<tr><td colspan="4">
                <div class="empty-state">
                    <div class="empty-state-icon"><img
                                        src="../../assets/img/track/people.png" alt="" class="entrance-icon"></div>
                    No guests match your filters.
                </div>
            </td></tr>`;
        return;
    }

    // Group by first letter
    const groups = {};
    filtered.forEach(g => {
        const firstChar = (g.name || "?").charAt(0).toUpperCase();
        const key = /[A-Z]/.test(firstChar) ? firstChar : "#";
        if (!groups[key]) groups[key] = [];
        groups[key].push(g);
    });

    Object.keys(groups)
        .sort()
        .forEach(letter => {
            const headerRow = document.createElement("tr");
            headerRow.className = "guest-group-row";
            headerRow.innerHTML = `<td colspan="4">${letter}</td>`;
            tbody.appendChild(headerRow);

            groups[letter].forEach(g => {
                const tr = document.createElement("tr");
                tr.className = "guest-row";
                tr.innerHTML = `
                    <td>${g.name}</td>
                    <td>${g.group || "-"}</td>
                    <td>${formatRSVP(g.rsvp)}</td>
                    <td>
                        <button class="icon-btn" title="Edit guest" onclick="openGuestModal('${g.id}')"><img
                                        src="../../assets/img/track/edit.png" alt="" class="entrance-icon edit-icon"></button>
                        <button class="icon-btn danger" title="Delete guest" onclick="deleteGuest('${g.id}')"><img
                                        src="../../assets/img/track/bin.png" alt="" class="entrance-icon edit-icon"></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });
}

/* ==============================
   CSV IMPORT (Name, Group, RSVP)
============================== */
async function importGuestsCSV(file) {
    const reader = new FileReader();
    reader.onload = async function (e) {
        const lines = e.target.result.split(/\r?\n/);
        let count = 0;
        const promises = [];

        lines.forEach((line, i) => {
            if (!line.trim()) return;
            if (i === 0 && line.toLowerCase().includes("name")) return; // header row

            const parts = parseCSV(line);
            if (!parts.length) return;

            const name = parts[0] ? parts[0].trim() : "";
            if (!name) return;

            const group = parts[1] ? parts[1].trim() : "";
            const rsvpRaw = (parts[2] || "pending").toLowerCase();
            let rsvp = "pending";
            if (rsvpRaw.startsWith("y")) rsvp = "yes";
            else if (rsvpRaw.startsWith("n") || rsvpRaw.startsWith("d")) rsvp = "no";

            const p = fetch(`${API_BASE}/api/guests`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ name, group, rsvp })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    guests.push({ ...data.data, id: data.data._id.toString() });
                    count++;
                }
            })
            .catch(err => console.error("CSV import row failed:", err));

            promises.push(p);
        });

        await Promise.all(promises);
        showSuccess(`Imported ${count} guests`);
        refresh();
    };

    reader.readAsText(file);
}

function parseCSV(line) {
    const result = [];
    let inside = false;
    let value = "";

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (inside) {
            if (ch === '"') {
                if (line[i + 1] === '"') {
                    value += '"';
                    i++;
                } else {
                    inside = false;
                }
            } else {
                value += ch;
            }
        } else {
            if (ch === '"') {
                inside = true;
            } else if (ch === ",") {
                result.push(value);
                value = "";
            } else {
                value += ch;
            }
        }
    }
    result.push(value);
    return result;
}

/* ==============================
   SEATING CHART – ZONES A / C / B
============================== */
async function deleteAllGuests() {
    if (!guests.length) {
        return showError("No guests to delete");
    }

    if (!confirm(`Are you sure you want to delete ALL ${guests.length} guests? This cannot be undone.`)) {
        return;
    }

    try {
        await Promise.all(
            guests.map(g =>
                fetch(`${API_BASE}/api/guests/${g.id}`, {
                    method: 'DELETE',
                    headers: authHeaders()
                })
            )
        );
    } catch (err) {
        console.error("deleteAllGuests error:", err);
    }

    guests = [];
    seatingTables = [];
    gifts = gifts.filter(gift => !gift.guestId);
    saveSeating();

    refresh();
    showSuccess("All guests have been deleted");
}

function createTableForZone(zone, capacity, counters) {
    if (!counters[zone]) counters[zone] = 0;
    counters[zone] += 1;

    const index = counters[zone];
    const label = zone + "-" + index;

    const t = {
        id: "t_" + label,
        zone,
        label,
        capacity,
        guests: []
    };

    seatingTables.push(t);
    return t;
}

function seatGuestsInZone(zone, guestList, capacity, counters) {
    if (!guestList.length) return;

    let current = seatingTables.filter(t => t.zone === zone).slice(-1)[0];

    guestList.forEach(g => {
        if (!current || current.guests.length >= capacity) {
            current = createTableForZone(zone, capacity, counters);
        }
        current.guests.push(g.id);
    });
}

function generateSeating() {
    if (!guests.length) return showError("No guests available yet.");

    const confirmedGuests = guests.filter(g => g.rsvp === "yes");
    if (!confirmedGuests.length) {
        return showError("No confirmed guests. Only confirmed guests are seated.");
    }

    const capacity = Math.max(1, Math.min(10, parseInt($("tableCapacity").value) || 10));
    $("tableCapacity").value = capacity;

    seatingTables = [];
    const counters = { A: 0, B: 0, C: 0 };

    // Split into VIP and others
    const vipGuests = confirmedGuests.filter(g => (g.group || "").toLowerCase() === "vip");
    const nonVip = confirmedGuests.filter(g => (g.group || "").toLowerCase() !== "vip");

    // 1) Seat VIP in zone C (center)
    seatGuestsInZone("C", vipGuests, capacity, counters);

    // 2) For others, group by group label and alternate zones A/B
    const groupMap = {};
    nonVip.forEach(g => {
        const key = g.group || "Other";
        if (!groupMap[key]) groupMap[key] = [];
        groupMap[key].push(g);
    });

    const groupKeys = Object.keys(groupMap);
    let zoneToggle = 0;
    const nonVipZones = ["A", "B"];

    groupKeys.forEach(key => {
        const zone = nonVipZones[zoneToggle % nonVipZones.length];
        zoneToggle++;
        seatGuestsInZone(zone, groupMap[key], capacity, counters);
    });

    updateGuestSeats();
    saveSeating();
    renderSeating();
    showSuccess("Seating plan generated");
}

function updateGuestSeats() {
    guests.forEach(g => {
        g.seatTableId = null;
        g.seatZone = null;
    });

    seatingTables.forEach(t => {
        t.guests.forEach(id => {
            const g = guests.find(x => x.id === id);
            if (g) {
                g.seatTableId = t.id;
                g.seatZone = t.zone;
            }
        });
    });
}

function renderSeating() {
    const zoneA = $("zoneA");
    const zoneB = $("zoneB");
    const zoneC = $("zoneC");
    if (!zoneA || !zoneB || !zoneC) return;

    zoneA.innerHTML = "";
    zoneB.innerHTML = "";
    zoneC.innerHTML = "";

    if (!seatingTables.length) {
        zoneC.innerHTML = `
            <div class="empty-state">
                No seating yet. Generate a seating plan when you have confirmed guests.
            </div>`;
        $("tableCount").textContent = "0 tables";
        $("seatedCount").textContent = "0 seated";
        return;
    }

    seatingTables.forEach(table => {
        const guestsAtTable = table.guests
            .map(id => guests.find(x => x.id === id))
            .filter(Boolean);

        const tableEl = document.createElement("div");
        tableEl.className = "round-table";

        const labelEl = document.createElement("div");
        labelEl.className = "table-label";
        labelEl.textContent = table.label;
        tableEl.appendChild(labelEl);

        // TABLE IMAGE INSTEAD OF CIRCLE
        const tableImg = document.createElement("img");
        tableImg.src = "../../assets/img/track/table.png";
        tableImg.className = "table-img";
        tableEl.appendChild(tableImg);

        const totalSeats = table.capacity || 10;
        const centerX = 100;
        const centerY = 100;
        const radius = 60;
        for (let i = 0; i < totalSeats; i++) {
            const angle = -Math.PI / 2 + (2 * Math.PI * i) / totalSeats;
            const seatX = centerX + radius * Math.cos(angle);
            const seatY = centerY + radius * Math.sin(angle);
            const chair = document.createElement("div");
            chair.className = "chair";
            chair.style.left = seatX + "px";
            chair.style.top = seatY + "px";
            const nameSpan = document.createElement("span");
            nameSpan.className = "chair-name";
            const guest = guestsAtTable[i];
            if (guest) {
                nameSpan.textContent = guest.name;
            } else {
                nameSpan.textContent = "Empty";
                nameSpan.classList.add("empty");
            }
            const img = document.createElement("img");
            img.className = "chair-img";
            img.src = "../../assets/img/track/chair.png";
            chair.appendChild(nameSpan);
            chair.appendChild(img);
            tableEl.appendChild(chair);
        }

        if (table.zone === "A") {
            zoneA.appendChild(tableEl);
        } else if (table.zone === "B") {
            zoneB.appendChild(tableEl);
        } else {
            zoneC.appendChild(tableEl);
        }
    });

    const totalSeated = seatingTables.reduce((sum, t) => sum + t.guests.length, 0);
    $("tableCount").textContent = `${seatingTables.length}`;
    $("seatedCount").textContent = `${totalSeated}`;
}

/* ==============================
   GIFT REGISTRY
============================== */
function toggleGiftCustomInput() {
    const typeSelect = $("giftType");
    const wrapper = $("giftTypeCustomWrapper");
    if (!typeSelect || !wrapper) return;

    if (typeSelect.value === "other") {
        wrapper.classList.remove("hidden");
    } else {
        wrapper.classList.add("hidden");
    }
}

/* ==============================
   IMPORT GIFTS CSV
   Format: GiftType, FromName, Value
============================== */
async function importGiftsCSV(file) {
    const reader = new FileReader();
    reader.onload = async function (e) {
        const lines = e.target.result.split(/\r?\n/);
        let count = 0;
        const promises = [];

        lines.forEach((line, i) => {
            if (!line.trim()) return;
            if (i === 0 && line.toLowerCase().includes("gift")) return;

            const parts = parseCSV(line);
            const type = parts[0] ? parts[0].trim() : "";
            const fromName = parts[1] ? parts[1].trim() : "";
            const value = parseFloat(parts[2] || "0");

            if (!type || isNaN(value)) return;

            // match guest by name (optional)
            let guestId = null;
            if (fromName) {
                const g = guests.find(gg => gg.name.toLowerCase() === fromName.toLowerCase());
                if (g) guestId = g.id;
            }

            const p = fetch(`${API_BASE}/api/gifts`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ type, budget: value, guestId })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    gifts.push({ ...data.data, id: data.data._id.toString() });
                    count++;
                }
            })
            .catch(err => console.error("Gift CSV import row failed:", err));

            promises.push(p);
        });

        await Promise.all(promises);
        showSuccess(`Imported ${count} gifts`);
        refresh();
    };

    reader.readAsText(file);
}

async function deleteAllGifts() {
    if (!gifts.length) {
        return showError("No gifts to delete");
    }

    if (!confirm(`Are you sure you want to delete ALL ${gifts.length} gifts? This cannot be undone.`)) {
        return;
    }

    try {
        await Promise.all(
            gifts.map(g =>
                fetch(`${API_BASE}/api/gifts/${g.id}`, {
                    method: 'DELETE',
                    headers: authHeaders()
                })
            )
        );
    } catch (err) {
        console.error("deleteAllGifts error:", err);
    }

    gifts = [];
    refresh();
    showSuccess("All gifts have been deleted");
}

async function saveGift() {
    const typeSelect = $("giftType");
    const customType = $("giftTypeCustom").value.trim();
    const budgetValue = $("giftBudget").value;
    const budget = parseFloat(budgetValue);
    const guestId = $("giftGuest").value || null;

    if (isNaN(budget)) return showError("Please enter a valid amount");

    let type;
    if (typeSelect.value === "other") {
        type = customType || "Other";
    } else {
        type = typeSelect.value;
    }

    try {
        if (editingGiftId) {
            const res = await fetch(`${API_BASE}/api/gifts/${editingGiftId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ type, budget, guestId })
            });
            const data = await res.json();
            if (data.success) {
                const index = gifts.findIndex(g => g.id === editingGiftId);
                if (index !== -1) {
                    gifts[index] = { ...data.data, id: data.data._id.toString() };
                }
                showSuccess("Gift updated");
            } else {
                showError(data.message || "Failed to update gift");
                return;
            }
        } else {
            const res = await fetch(`${API_BASE}/api/gifts`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ type, budget, guestId })
            });
            const data = await res.json();
            if (data.success) {
                gifts.push({ ...data.data, id: data.data._id.toString() });
                showSuccess("Gift added");
            } else {
                showError(data.message || "Failed to add gift");
                return;
            }
        }
    } catch (err) {
        console.error("saveGift error:", err);
        showError("Could not save gift. Check your connection.");
        return;
    }

    editingGiftId = null;
    closeGiftModal();
    refresh();
}

async function deleteGift(id) {
    if (!confirm("Delete this gift?")) return;

    try {
        await fetch(`${API_BASE}/api/gifts/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
    } catch (err) {
        console.error("deleteGift error:", err);
    }

    gifts = gifts.filter(g => g.id !== id);
    refresh();
    showSuccess("Gift deleted");
}

function renderGiftList() {
    const tbody = $("giftTable");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!gifts.length) {
        tbody.innerHTML =
            `<tr><td colspan="4">
                <div class="empty-state">
                    <div class="empty-state-icon"><img
                                        src="../../assets/img/track/gift.png" alt="" class="entrance-icon"></div>
                    No gifts recorded yet.
                </div>
            </td></tr>`;
        return;
    }

    gifts.forEach(gift => {
        const guest = guests.find(x => x.id === gift.guestId);
        const from = guest ? guest.name : "—";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${from}</td>
            <td>${gift.type}</td>
            <td>$${(gift.budget || 0).toFixed(2)}</td>
            <td>
                <button class="icon-btn" title="Edit gift" onclick="openGiftModal('${gift.id}')"><img
                                        src="../../assets/img/track/edit.png" alt="" class="entrance-icon edit-icon"></button>
                <button class="icon-btn danger" title="Delete gift" onclick="deleteGift('${gift.id}')"><img
                                        src="../../assets/img/track/bin.png" alt="" class="entrance-icon edit-icon"></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* ==============================
   STATS
============================== */
function updateStats() {
    const total = guests.length;
    const yes = guests.filter(g => g.rsvp === "yes").length;
    const pending = guests.filter(g => g.rsvp === "pending").length;
    const no = guests.filter(g => g.rsvp === "no").length;

    $("statGuests").textContent = total;
    $("statConfirmed").textContent = yes;

    $("rsvpTotal").textContent = total;
    $("rsvpYes").textContent = yes;
    $("rsvpPending").textContent = pending;
    $("rsvpNo").textContent = no;

    $("giftCount").textContent = gifts.length;
    $("statGifts").textContent = gifts.length;
    const totalValue = gifts.reduce((s, g) => s + (g.budget || 0), 0);
    $("giftTotalAmount").textContent = "$" + totalValue.toFixed(2);
    $("statBudget").textContent = "$" + totalValue.toFixed(2);
}

/* ==============================
   HELPERS
============================== */
function toggleGuestCustomGroup() {
    const selectVal = $("guestGroupSelect").value;
    const wrapper = $("guestGroupCustomWrapper");
    if (!wrapper) return;
    if (selectVal === "__other") wrapper.classList.remove("hidden");
    else wrapper.classList.add("hidden");
}

/* ==============================
   REFRESH ALL UI
============================== */
function refresh() {
    updateGroupFilterOptions();
    renderGuestList();
    renderGiftList();
    renderSeating();
    updateStats();
    // Note: seating is saved explicitly when changed, not on every refresh
}

/* ==============================
   INIT
============================== */
document.addEventListener("DOMContentLoaded", async () => {
    await loadState();
    refresh();

    // Import CSV
    const csvInput = $("guestCsvInput");
    const importBtn = $("btnImportCsv");

    if (importBtn && csvInput) {
        importBtn.addEventListener("click", () => csvInput.click());
        csvInput.addEventListener("change", e => {
            const file = e.target.files[0];
            if (file) importGuestsCSV(file);
            e.target.value = "";
        });
    }

    // Seating buttons
    $("btnGenerateSeating")?.addEventListener("click", generateSeating);
    $("btnResetSeating")?.addEventListener("click", () => {
        if (confirm("Reset seating plan?")) {
            seatingTables = [];
            guests.forEach(g => {
                g.seatTableId = null;
                g.seatZone = null;
            });
            saveSeating();
            refresh();
        }
    });

    // Filters & search for guests
    $("guestSearch")?.addEventListener("input", renderGuestList);
    $("guestGroupFilter")?.addEventListener("change", renderGuestList);
    $("guestRsvpFilter")?.addEventListener("change", renderGuestList);

    // Gift type custom input
    $("giftType")?.addEventListener("change", toggleGiftCustomInput);

    // Guest group custom input
    $("guestGroupSelect")?.addEventListener("change", toggleGuestCustomGroup);

    const giftCsvInput = $("giftCsvInput");
    const btnGiftImport = $("btnImportGiftCsv");

    if (btnGiftImport && giftCsvInput) {
        btnGiftImport.addEventListener("click", () => giftCsvInput.click());
        giftCsvInput.addEventListener("change", e => {
            const file = e.target.files[0];
            if (file) importGiftsCSV(file);
            e.target.value = "";
        });
    }

    // Delete All buttons
    $("btnDeleteAllGifts")?.addEventListener("click", deleteAllGifts);
    $("btnDeleteAllGuests")?.addEventListener("click", deleteAllGuests);
});

/* ==============================
   EXPORT GLOBALS
============================== */
window.openGuestModal = openGuestModal;
window.closeGuestModal = closeGuestModal;
window.saveGuest = saveGuest;
window.deleteGuest = deleteGuest;
window.deleteAllGuests = deleteAllGuests;

window.openGiftModal = openGiftModal;
window.closeGiftModal = closeGiftModal;
window.saveGift = saveGift;
window.deleteGift = deleteGift;