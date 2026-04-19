const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

function generateToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = { generateToken, verifyToken };
