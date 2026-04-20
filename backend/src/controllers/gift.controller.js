// backend/src/controllers/gift.controller.js

const Gift = require("../models/Gift");

const listGifts = async (req, res, next) => {
  try {
    const gifts = await Gift.listGifts(req.user.userId);
    return res.status(200).json({ success: true, data: gifts });
  } catch (error) {
    return next(error);
  }
};

const createGift = async (req, res, next) => {
  try {
    const { type, budget, guestId } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, message: "type is required." });
    }

    const gift = await Gift.createGift({
      type,
      budget,
      guestId: guestId || null,
      userId: req.user.userId,
    });

    return res.status(201).json({ success: true, data: gift });
  } catch (error) {
    return next(error);
  }
};

const updateGift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const gift = await Gift.updateGift(id, req.user.userId, updates);

    if (!gift) {
      return res.status(404).json({ success: false, message: "Gift not found." });
    }

    return res.status(200).json({ success: true, data: gift });
  } catch (error) {
    return next(error);
  }
};

const deleteGift = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Gift.deleteGift(id, req.user.userId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Gift not found." });
    }

    return res.status(200).json({ success: true, message: "Gift deleted." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listGifts,
  createGift,
  updateGift,
  deleteGift,
};