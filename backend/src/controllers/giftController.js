const Gift = require("../models/Gift");

const listGifts = async (req, res, next) => {
  try {
    const gifts = await Gift.listGifts();

    return res.status(200).json({
      success: true,
      data: gifts,
    });
  } catch (error) {
    return next(error);
  }
};

const createGift = async (req, res, next) => {
  try {
    const { name, budget, category, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required.",
      });
    }

    const gift = await Gift.createGift({
      name,
      budget,
      category,
      notes,
    });

    return res.status(201).json({
      success: true,
      data: gift,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listGifts,
  createGift,
};
