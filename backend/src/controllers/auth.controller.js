const crypto = require("node:crypto");

const User = require("../models/User");
const env = require("../config/env");
const { generateToken } = require("../utils/generateToken");

const hashPassword = (
  password,
  salt = crypto.randomBytes(16).toString("hex"),
) => {
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return { salt, hash };
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email, and password are required.",
      });
    }

    const existingUser = await User.findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const passwordDigest = hashPassword(password);
    const createdUser = await User.createUser({
      name,
      email,
      role: role || "user",
      passwordHash: passwordDigest.hash,
      passwordSalt: passwordDigest.salt,
    });

    const token = generateToken({
      userId: createdUser._id,
      email: createdUser.email,
      role: createdUser.role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: sanitizeUser(createdUser),
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required.",
      });
    }

    const user = await User.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const { hash } = hashPassword(password, user.passwordSalt);

    if (hash !== user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user || null,
  });
};

const logout = async (req, res) => {
  res.clearCookie("token");

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

module.exports = {
  register,
  login,
  me,
  logout,
};
