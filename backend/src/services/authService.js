const bcrypt = require("bcrypt");
const { createHash, randomUUID } = require("node:crypto");
const jwt = require("jsonwebtoken");
const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      jti: randomUUID(),
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
};

const hashToken = (token) => {
  return createHash("sha256").update(token).digest("hex");
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  hashToken,
  verifyToken,
};
