const express = require("express");

const guestController = require("../controllers/guest.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", guestController.listGuests);
router.post("/", guestController.createGuest);

module.exports = router;
