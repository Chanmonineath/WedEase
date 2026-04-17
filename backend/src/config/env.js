const dotenv = require("dotenv");
const path = require("node:path");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  override: true,
});

if (!process.env.ATLAS_URI && !process.env.MONGODB_URI) {
  throw new Error(
    "Missing MongoDB URI. Set either ATLAS_URI or MONGODB_URI in environment variables.",
  );
}

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production.");
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.ATLAS_URI || process.env.MONGODB_URI,
  dbName: process.env.DB_NAME || "wedease",
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret_change_me",
  corsOrigin: process.env.CORS_ORIGIN || "*",
};

module.exports = env;
