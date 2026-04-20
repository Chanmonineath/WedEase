const express = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth.middleware"); // import directly since module.exports = authenticate
const {
  validateUserRegistration,
  validateUserLogin,
  validateUpdatePassword,
  validateDeleteAccount,
} = require("../middleware/validation.midleware");

const router = express.Router();

// Registration and login
router.post("/register", validateUserRegistration, authController.register);
router.post("/login", validateUserLogin, authController.login);

// Authenticated routes
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);

// Account management
router.patch(
  "/password",
  authenticate,
  validateUpdatePassword,
  authController.updatePassword,
);
router.delete(
  "/account",
  authenticate,
  validateDeleteAccount,
  authController.deleteAccount,
);

// Optional flows (remove if not needed)
// router.post("/recover", authController.recoverAccount);
// router.patch("/email", authenticate, authController.updateEmail);

module.exports = router;
