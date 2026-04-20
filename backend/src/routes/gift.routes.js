// backend/src/routes/gift.routes.js

const express = require("express");
const giftController = require("../controllers/gift.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", giftController.listGifts);
router.post("/", giftController.createGift);
router.put("/:id", giftController.updateGift);
router.delete("/:id", giftController.deleteGift);

module.exports = router;
