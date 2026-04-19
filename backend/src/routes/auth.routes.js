const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const ctrl = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").isLength({ min: 2, max: 50 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  ctrl.register,
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  ctrl.login,
);

router.post("/logout", ctrl.logout);
router.get("/me", auth, ctrl.me);
router.delete("/delete", auth, ctrl.deleteAccount);

module.exports = router;
