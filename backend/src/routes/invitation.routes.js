const express = require("express");

const invitationController = require("../controllers/invitation.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", invitationController.listInvitations);
router.post("/", invitationController.createInvitation);

module.exports = router;
