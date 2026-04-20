// backend/src/controllers/invitationGuest.controller.js
const InvitationGuest = require("../models/InvitationGuest");

const getUserId = (req) => {
  if (req.user && req.user.userId) {
    return req.user.userId;
  }
  return null;
};

const listInvitationGuests = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const guests = await InvitationGuest.getInvitationGuestsByUserId(userId);
    
    return res.status(200).json({
      success: true,
      data: guests,
    });
  } catch (error) {
    return next(error);
  }
};

const createInvitationGuest = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "name and email are required.",
      });
    }

    const guest = await InvitationGuest.createInvitationGuest({
      name,
      email,
      phone,
      userId: userId,
    });

    return res.status(201).json({
      success: true,
      data: guest,
    });
  } catch (error) {
    return next(error);
  }
};

const bulkCreateInvitationGuests = async (req, res, next) => {
  try {
    const { guests } = req.body;
    const userId = getUserId(req);
    
    console.log("📥 Bulk create invitation guests:", guests?.length, "for user:", userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    if (!guests || !guests.length) {
      return res.status(400).json({
        success: false,
        message: "No guests provided",
      });
    }

    const result = await InvitationGuest.bulkCreateInvitationGuests(guests, userId);
    
    console.log("✅ Bulk create success:", result.insertedCount, "invitation guests added");
    
    return res.status(201).json({
      success: true,
      data: { insertedCount: result.insertedCount },
    });
  } catch (error) {
    console.error("Bulk create error:", error);
    return next(error);
  }
};

const sendInvitations = async (req, res, next) => {
  try {
    const { guestIds, invitationDetails } = req.body;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    if (!guestIds || !guestIds.length) {
      return res.status(400).json({
        success: false,
        message: "No guests selected",
      });
    }
    
    // Use BASE_URL from env, with fallback
    const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:5503/frontend';
    console.log("📧 Sending invitations with base URL:", baseUrl);
    
    const updatedGuests = await InvitationGuest.sendInvitationLinks(
      guestIds, 
      userId, 
      invitationDetails, 
      baseUrl
    );
    
    return res.status(200).json({ success: true, data: updatedGuests });
  } catch (error) {
    console.error("Send invitations error:", error);
    return next(error);
  }
};

const deleteInvitationGuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const result = await InvitationGuest.deleteInvitationGuest(id, userId);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Guest deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const deleteAllInvitationGuests = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const result = await InvitationGuest.deleteAllInvitationGuests(userId);
    
    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} guests deleted successfully`,
    });
  } catch (error) {
    return next(error);
  }
};

const getRSVPStats = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const stats = await InvitationGuest.getInvitationRSVPStats(userId);
    
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return next(error);
  }
};

// Public routes (no authentication needed)
const getGuestByTokenPublic = async (req, res, next) => {
  try {
    const { token } = req.params;
    const guest = await InvitationGuest.getInvitationGuestByToken(token);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Invalid invitation token",
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        id: guest._id,
        name: guest.name,
        email: guest.email,
        status: guest.status,
        rsvpStatus: guest.rsvpStatus,
        invitationDetails: guest.invitationDetails,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const submitRSVP = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { rsvpStatus, guestCount, dietaryRestrictions, notes } = req.body;
    
    if (!rsvpStatus) {
      return res.status(400).json({
        success: false,
        message: "RSVP status is required",
      });
    }
    
    const result = await InvitationGuest.updateInvitationGuestRSVP(token, {
      rsvpStatus,
      guestCount,
      dietaryRestrictions,
      notes,
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Invalid invitation token",
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "RSVP submitted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listInvitationGuests,
  createInvitationGuest,
  bulkCreateInvitationGuests,
  sendInvitations,
  deleteInvitationGuest,
  deleteAllInvitationGuests,
  getRSVPStats,
  getGuestByTokenPublic,
  submitRSVP,
};