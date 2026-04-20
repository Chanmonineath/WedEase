// backend/src/controllers/guest.controller.js
const Guest = require("../models/Guest");

const listGuests = async (req, res, next) => {
  try {
    const guests = await Guest.getGuestsByUserId(req.user.userId);
    return res.status(200).json({ success: true, data: guests });
  } catch (error) {
    return next(error);
  }
};

const createGuest = async (req, res, next) => {
  try {
    const { name, email, phone, guestCount, dietaryRestrictions } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "name and email are required.",
      });
    }

    const guest = await Guest.createGuest({
      name,
      email,
      phone: phone || "",
      guestCount: guestCount || 1,
      dietaryRestrictions: dietaryRestrictions || "",
      userId: req.user.userId,
    });

    return res.status(201).json({ success: true, data: guest });
  } catch (error) {
    return next(error);
  }
};

const bulkCreateGuests = async (req, res, next) => {
  try {
    const { guests } = req.body;
    
    if (!guests || !guests.length) {
      return res.status(400).json({
        success: false,
        message: "No guests provided",
      });
    }

    const result = await Guest.bulkCreateGuests(guests, req.user.userId);
    
    return res.status(201).json({
      success: true,
      data: { insertedCount: result.insertedCount },
    });
  } catch (error) {
    return next(error);
  }
};

const sendInvitations = async (req, res, next) => {
  try {
    const { guestIds, invitationDetails } = req.body;
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:5500';
    const updatedGuests = await Guest.sendInvitations(
      guestIds, 
      req.user.userId, 
      invitationDetails, 
      baseUrl
    );
    
    return res.status(200).json({ success: true, data: updatedGuests });
  } catch (error) {
    return next(error);
  }
};

const deleteGuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Guest.deleteGuest(id, req.user.userId);
    
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

const deleteAllGuests = async (req, res, next) => {
  try {
    const result = await Guest.deleteAllGuests(req.user.userId);
    
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
    const stats = await Guest.getRSVPStats(req.user.userId);
    
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return next(error);
  }
};

// Public routes (no authentication)
const getGuestByTokenPublic = async (req, res, next) => {
  try {
    const { token } = req.params;
    const guest = await Guest.getGuestByToken(token);
    
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
    
    const result = await Guest.updateRSVP(token, {
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
  listGuests,
  createGuest,
  bulkCreateGuests,
  sendInvitations,
  deleteGuest,
  deleteAllGuests,
  getRSVPStats,
  getGuestByTokenPublic,
  submitRSVP,
};