const { verifyToken } = require("../utils/generateToken");
const User = require("../models/User");

async function auth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}

module.exports = auth;
