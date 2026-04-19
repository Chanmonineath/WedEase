const express = require("express");

const invitationController = require("../controllers/invitationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", invitationController.listInvitations);
router.post("/", invitationController.createInvitation);

module.exports = router;
