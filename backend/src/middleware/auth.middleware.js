const { verifyToken } = require("../utils/generateToken");

const authMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers.authorization || "";
  const token = authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.slice(7)
    : req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    console.log("Auth middleware - User ID:", req.user.userId);
    return next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;