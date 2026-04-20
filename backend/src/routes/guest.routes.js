// backend/src/routes/guest.routes.js
const express = require("express");
const guestController = require("../controllers/guest.controller");
// const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// TEMPORARILY COMMENT OUT AUTH FOR TESTING
// router.use(authMiddleware);

router.get("/", guestController.listGuests);
router.post("/", guestController.createGuest);
router.post("/bulk", guestController.bulkCreateGuests);
router.post("/send-invitations", guestController.sendInvitations);
router.delete("/:id", guestController.deleteGuest);
router.delete("/", guestController.deleteAllGuests);
router.get("/stats", guestController.getRSVPStats);

// Public routes (no auth needed for RSVP)
router.get("/public/:token", guestController.getGuestByTokenPublic);
router.post("/public/rsvp/:token", guestController.submitRSVP);

module.exports = router;