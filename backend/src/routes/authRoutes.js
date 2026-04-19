const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const ctrl = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").isLength({ min: 2, max: 50 }),
    body("email").isEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long.")
      .matches(/[a-z]/)
      .withMessage("Password must contain a lowercase letter.")
      .matches(/[A-Z]/)
      .withMessage("Password must contain an uppercase letter.")
      .matches(/[0-9]/)
      .withMessage("Password must contain a number."),
  ],
  ctrl.register,
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  ctrl.login,
);

router.post("/logout", ctrl.logout);
router.get("/me", auth, ctrl.getMe);
router.delete("/delete", auth, ctrl.deleteAccount);

module.exports = router;
