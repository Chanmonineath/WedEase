const Guest = require("../models/Guest");

const listGuests = async (req, res, next) => {
  try {
    const guests = await Guest.listGuests();

    return res.status(200).json({
      success: true,
      data: guests,
    });
  } catch (error) {
    return next(error);
  }
};

const createGuest = async (req, res, next) => {
  try {
    const { name, email, phone, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "name and email are required.",
      });
    }

    const guest = await Guest.createGuest({
      name,
      email,
      phone,
      status,
    });

    return res.status(201).json({
      success: true,
      data: guest,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listGuests,
  createGuest,
};
