// backend/src/controllers/guest.controller.js

const Guest = require("../models/Guest");

const listGuests = async (req, res, next) => {
  try {
    const guests = await Guest.listGuests(req.user.userId);
    return res.status(200).json({ success: true, data: guests });
  } catch (error) {
    return next(error);
  }
};

const createGuest = async (req, res, next) => {
  try {
    const { name, group, rsvp } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "name is required." });
    }

    const guest = await Guest.createGuest({
      name,
      group,
      rsvp,
      userId: req.user.userId,
    });

    return res.status(201).json({ success: true, data: guest });
  } catch (error) {
    return next(error);
  }
};

const updateGuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const guest = await Guest.updateGuest(id, req.user.userId, updates);

    if (!guest) {
      return res.status(404).json({ success: false, message: "Guest not found." });
    }

    return res.status(200).json({ success: true, data: guest });
  } catch (error) {
    return next(error);
  }
};

const deleteGuest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Guest.deleteGuest(id, req.user.userId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Guest not found." });
    }

    return res.status(200).json({ success: true, message: "Guest deleted." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listGuests,
  createGuest,
  updateGuest,
  deleteGuest,
};