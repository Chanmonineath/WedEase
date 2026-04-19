const express = require("express");

const giftController = require("../controllers/giftController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", giftController.listGifts);
router.post("/", giftController.createGift);

module.exports = router;
