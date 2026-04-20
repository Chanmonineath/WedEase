// backend/src/routes/invitation.routes.js
const express = require("express");
const multer = require("multer");
const invitationController = require("../controllers/invitation.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protected routes (require authentication)
router.use(authMiddleware);

router.get("/", invitationController.listInvitations);
router.post("/", invitationController.createInvitation);
router.post("/:id/send", invitationController.sendInvitations);
router.post("/upload-csv", upload.single("file"), invitationController.uploadCSV);
router.get("/:id/stats", invitationController.getRSVPStats);
router.get("/:id/guests", invitationController.listGuestInvites);
router.delete("/:id", invitationController.deleteInvitation);

// Public RSVP routes (no auth needed)
// These should be BEFORE the auth middleware or in a separate router
// But since we already have authMiddleware applied above, 
// we need to move these to a separate router or before the auth middleware

module.exports = router;
