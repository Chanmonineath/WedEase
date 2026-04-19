const express = require("express");

const guestController = require("../controllers/guestController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", guestController.listGuests);
router.post("/", guestController.createGuest);

module.exports = router;
