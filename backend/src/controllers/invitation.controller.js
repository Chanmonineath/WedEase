// backend/src/controllers/invitation.controller.js - Firebase Version
const Invitation = require("../models/Invitation");

const listInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.listInvitations(req.user.userId);
    return res.status(200).json({ success: true, data: invitations });
  } catch (error) {
    return next(error);
  }
};
const uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const guests = [];
    const csvContent = req.file.buffer.toString();
    const lines = csvContent.split(/\r?\n/);

    console.log("📁 Processing CSV file, lines:", lines.length);

    // Parse CSV (skip header row)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV line (handles quotes)
      const parts = parseCSVLine(line);

      if (parts.length >= 2) {
        const name = parts[0].trim().replace(/^"|"$/g, "");
        const email = parts[1].trim().replace(/^"|"$/g, "");

        if (name && email) {
          guests.push({
            name: name,
            email: email,
            phone: parts[2] ? parts[2].trim().replace(/^"|"$/g, "") : "",
            guestCount: 1,
            dietaryRestrictions: "",
            userId: req.user.userId, // Add the user ID
            status: "pending",
            rsvpStatus: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    console.log("📋 Parsed guests:", guests.length);

    if (guests.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid guests found in CSV" });
    }

    // Save to Firestore using Guest model
    const Guest = require("../models/GuestFirebase");
    const result = await Guest.bulkCreateGuests(guests, req.user.userId);

    console.log("✅ Saved to Firestore:", result.length, "guests");

    return res.status(200).json({
      success: true,
      data: result,
      message: `Successfully added ${result.length} guests`,
    });
  } catch (error) {
    console.error("❌ CSV upload error:", error);
    return next(error);
  }
};

// Helper function to parse CSV lines with quotes
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
const createInvitation = async (req, res, next) => {
  try {
    const {
      title,
      eventDate,
      theme,
      coupleNames,
      venue,
      message,
      primaryColor,
      secondaryColor,
    } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({
        success: false,
        message: "title and eventDate are required.",
      });
    }

    const invitation = await Invitation.createInvitation({
      title,
      eventDate: new Date(eventDate).toISOString(),
      theme: theme || "classic",
      coupleNames: coupleNames || "",
      venue: venue || "",
      message: message || "",
      primaryColor: primaryColor || "#667eea",
      secondaryColor: secondaryColor || "#764ba2",
      userId: req.user.userId,
    });

    return res.status(201).json({ success: true, data: invitation });
  } catch (error) {
    return next(error);
  }
};

const sendInvitations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { guests } = req.body;

    if (!guests || !guests.length) {
      return res
        .status(400)
        .json({ success: false, message: "No guests to send invitations to" });
    }

    const results = await Invitation.bulkSendInvitations(id, guests);
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return next(error);
  }
};

const getRSVPStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stats = await Invitation.getRSVPStats(id);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return next(error);
  }
};

const listGuestInvites = async (req, res, next) => {
  try {
    const { id } = req.params;
    const guests = await Invitation.listGuestInvites(id);
    return res.status(200).json({ success: true, data: guests });
  } catch (error) {
    return next(error);
  }
};

const deleteInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Invitation.deleteInvitation(id);
    return res
      .status(200)
      .json({ success: true, message: "Invitation deleted" });
  } catch (error) {
    return next(error);
  }
};

// Public RSVP handlers
const submitRSVP = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { rsvpStatus, guestCount, dietaryRestrictions, notes } = req.body;

    if (!rsvpStatus) {
      return res
        .status(400)
        .json({ success: false, message: "RSVP status is required" });
    }

    const result = await Invitation.updateRSVP(token, {
      rsvpStatus,
      guestCount,
      dietaryRestrictions,
      notes,
    });

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid invitation token" });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

const getInvitationByToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const invitation = await Invitation.getInvitationByToken(token);

    if (!invitation) {
      return res
        .status(404)
        .json({ success: false, message: "Invitation not found" });
    }

    return res.status(200).json({ success: true, data: invitation });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listInvitations,
  createInvitation,
  uploadCSV,
  sendInvitations,
  getRSVPStats,
  listGuestInvites,
  deleteInvitation,
  submitRSVP,
  getInvitationByToken,
};
