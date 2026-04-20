const validator = require("validator");

const validateUsername = (username) => {
  const trimmedUsername = username ? username.trim() : "";
  if (!trimmedUsername) return "Username is required";
  if (!validator.isAlphanumeric(trimmedUsername))
    return "Username must be alphanumeric";
  if (!validator.isLength(trimmedUsername, { min: 3, max: 30 }))
    return "Username must be between 3 to 30 characters";
  return null;
};

const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minNumbers: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
  ) {
    return "Password must contain uppercase, number, and symbol";
  }
  return null;
};

const validateLoginPassword = (password) => {
  if (typeof password !== "string" || !password.trim()) {
    return "Password is required";
  }
};

const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;
  const normalizedEmail = typeof email === "string" ? email.trim() : "";

  if (!normalizedEmail)
    return res.status(400).json({ message: "Email is required" });
  if (!validator.isEmail(normalizedEmail))
    return res.status(400).json({ message: "Invalid email format" });

  const passwordError = validateLoginPassword(password);
  if (passwordError) return res.status(400).json({ message: passwordError });

  req.body.email = normalizedEmail;
  next();
};

const validateUserRegistration = (req, res, next) => {
  const { username, password, email } = req.body;
  const normalizedUsername = typeof username === "string" ? username.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim() : "";

  if (!normalizedUsername) {
    return res.status(400).json({ message: "Username is required" });
  }

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (typeof password !== "string" || !password.trim()) {
    return res.status(400).json({ message: "Password is required" });
  }

  const usernameError = validateUsername(normalizedUsername);
  if (usernameError) return res.status(400).json({ message: usernameError });

  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ message: passwordError });

  if (!validator.isEmail(normalizedEmail))
    return res.status(400).json({ message: "Invalid email format" });

  req.body.username = normalizedUsername;
  req.body.email = normalizedEmail;
  next();
};

const validateUpdateEmail = (req, res, next) => {
  const { newEmail, currentPassword } = req.body;

  if (!newEmail) {
    return res.status(400).json({ message: "New email is required" });
  }

  if (!validator.isEmail(newEmail)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const passwordError = validateLoginPassword(currentPassword);
  if (passwordError) {
    return res.status(400).json({ message: "Current password is required" });
  }

  next();
};

const validateUpdatePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const currentPasswordError = validateLoginPassword(currentPassword);
  if (currentPasswordError) {
    return res.status(400).json({ message: "Current password is required" });
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  next();
};

const validateDeleteAccount = (req, res, next) => {
  const { currentPassword } = req.body;

  const passwordError = validateLoginPassword(currentPassword);
  if (passwordError) {
    return res.status(400).json({ message: "Current password is required" });
  }

  next();
};

module.exports = {
  validateUserLogin,
  validateUserRegistration,
  validateUpdateEmail,
  validateUpdatePassword,
  validateDeleteAccount,
};
