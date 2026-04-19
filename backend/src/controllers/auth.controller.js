const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");

const isProduction = process.env.NODE_ENV === "production";

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const existingUser = await User.findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const createdUser = await User.createUser({
      name,
      email,
      password,
      role: role || "user",
    });

    const token = generateToken({
      userId: createdUser._id.toString(),
      email: createdUser.email,
      role: createdUser.role,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: createdUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.validateUserCredentials(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return next(error);
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const logout = async (req, res) => {
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