const express = require("express");

const giftController = require("../controllers/gift.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", giftController.listGifts);
router.post("/", giftController.createGift);

module.exports = router;
