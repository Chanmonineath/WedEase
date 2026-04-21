const userModel = require("../models/auth/userModel");
const revokedTokenModel = require("../models/auth/revokedTokenModel");
const authService = require("../services/authService");
const { normalizeEmail } = require("../utils/email");
const { getClient } = require("../config/db");

const getAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

const register = async (req, res) => {
  const client = getClient();
  const session = client.startSession();

  try {
    const { username, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await userModel.findUserByEmail(normalizedEmail);
    if (existingUser)
      return res.status(409).json({ message: "Email already exists" });

    const hashedPassword = await authService.hashPassword(password);

    const userId = await session.withTransaction(async () => {
      const createdUserId = await userModel.createUser(
        { username, email: normalizedEmail, password: hashedPassword },
        { session },
      );

      // profile creation removed (frontend doesn't use profiles in demo)

      return createdUserId;
    });

    res.status(201).json({ userId });
  } catch (error) {
    if (error?.code === 11000)
      return res.status(409).json({ message: "Email already exists" });
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  } finally {
    await session.endSession();
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await userModel.findUserByEmail(normalizedEmail);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await authService.comparePassword(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = authService.generateToken(user);

    res.cookie("wedease_token", token, getAuthCookieOptions());

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
};

// account recovery removed: keep auth endpoints minimal for registration/login flows

const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.authToken || authHeader?.split(" ")[1];

    if (!token)
      return res.status(200).json({ message: "Logged out successfully" });

    let decoded = req.user;
    if (!decoded) {
      try {
        decoded = authService.verifyToken(token);
      } catch {
        return res.status(200).json({ message: "Logged out successfully" });
      }
    }

    const tokenHash = authService.hashToken(token);
    const expiresAt = decoded.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await revokedTokenModel.revokeToken({
      tokenHash,
      userId: decoded.userId,
      expiresAt,
    });

    res.clearCookie("wedease_token", {
      ...getAuthCookieOptions(),
      expires: new Date(0),
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch {
    return res.status(500).json({ message: "Logout failed" });
  }
};

// update email flow removed to keep authentication surface minimal

const updatePassword = async (req, res) => {
  const client = getClient();
  const session = client.startSession();

  try {
    const { currentPassword, newPassword } = req.body;

    const user = await userModel.findActiveUserById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isCurrentPasswordMatch = await authService.comparePassword(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const isSamePassword = await authService.comparePassword(
      newPassword,
      user.password,
    );
    if (isSamePassword)
      return res
        .status(400)
        .json({ message: "New password must be different" });

    const hashedPassword = await authService.hashPassword(newPassword);

    const authHeader = req.headers.authorization;
    const token = req.authToken || authHeader?.split(" ")[1];

    if (!token)
      throw new Error("Current auth token unavailable for revocation");

    const decoded = req.user || authService.verifyToken(token);
    const tokenHash = authService.hashToken(token);
    const expiresAt = decoded.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await session.withTransaction(async () => {
      await userModel.updateUserPasswordById(req.user.userId, hashedPassword, {
        session,
      });

      await revokedTokenModel.revokeToken(
        { tokenHash, userId: req.user.userId, expiresAt },
        { session },
      );
    });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({ message: "Failed to update password" });
  } finally {
    await session.endSession();
  }
};

const deleteAccount = async (req, res) => {
  const client = getClient();
  const session = client.startSession();

  try {
    const { currentPassword } = req.body;

    const user = await userModel.findActiveUserById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await authService.comparePassword(
      currentPassword,
      user.password,
    );
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    await session.withTransaction(async () => {
      await userModel.softDeleteUserById(req.user.userId, { session });
      // profile soft-delete removed (no profile documents created in demo)
    });

    const token = req.authToken;
    if (token) {
      const tokenHash = authService.hashToken(token);
      const expiresAt = req.user.exp
        ? new Date(req.user.exp * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await revokedTokenModel.revokeToken({
        tokenHash,
        userId: req.user.userId,
        expiresAt,
      });
    }

    return res.status(200).json({
      message: "Account deleted successfully",
      recovery: "Account was soft-deleted and can be recovered later",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ message: "Failed to delete account" });
  } finally {
    await session.endSession();
  }
};

const me = async (req, res) => {
  try {
    const user = await userModel.findActiveUserById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // compute avatar (gravatar) from email for a lightweight profile image
    const crypto = require("crypto");
    const emailForHash = (user.email || "").trim().toLowerCase();
    const hash = emailForHash
      ? crypto.createHash("md5").update(emailForHash).digest("hex")
      : null;
    const avatarUrl = hash
      ? `https://www.gravatar.com/avatar/${hash}?s=128&d=identicon`
      : null;

    return res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl,
      },
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};
module.exports = {
  register,
  login,
  logout,
  me,
  updatePassword,
  deleteAccount,
};
