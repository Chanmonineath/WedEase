const Invitation = require("../models/Invitation");

const listInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.listInvitations();

    return res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    return next(error);
  }
};

const createInvitation = async (req, res, next) => {
  try {
    const { title, eventDate, guestIds, theme } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "title is required.",
      });
    }

    const invitation = await Invitation.createInvitation({
      title,
      eventDate,
      guestIds,
      theme,
    });

    return res.status(201).json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listInvitations,
  createInvitation,
};
