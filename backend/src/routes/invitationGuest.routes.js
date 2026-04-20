// backend/src/routes/invitationGuest.routes.js
const express = require("express");
const invitationGuestController = require("../controllers/invitationGuest.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes FIRST (no auth)
router.get("/public/:token", invitationGuestController.getGuestByTokenPublic);
router.post("/public/rsvp/:token", invitationGuestController.submitRSVP);

// Protected routes with auth
router.use(authMiddleware);
router.get("/", invitationGuestController.listInvitationGuests);
router.post("/", invitationGuestController.createInvitationGuest);
router.post("/bulk", invitationGuestController.bulkCreateInvitationGuests);
router.post("/send-invitations", invitationGuestController.sendInvitations);
router.delete("/:id", invitationGuestController.deleteInvitationGuest);
router.delete("/", invitationGuestController.deleteAllInvitationGuests);
router.get("/stats", invitationGuestController.getRSVPStats);

module.exports = router;