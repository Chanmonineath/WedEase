const crypto = require("node:crypto");

const env = require("../config/env");

const sign = (value) =>
  crypto.createHmac("sha256", env.jwtSecret).update(value).digest("base64url");

const generateToken = (payload) => {
  const tokenPayload = {
    ...payload,
    iat: Date.now(),
  };
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
};

const verifyToken = (token) => {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Invalid token.");
  }

  if (sign(encodedPayload) !== signature) {
    throw new Error("Invalid token.");
  }

  return JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
};

module.exports = {
  generateToken,
  verifyToken,
};
