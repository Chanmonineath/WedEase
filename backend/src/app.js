const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("node:path");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
  override: false,
});

const port = Number(process.env.PORT) || 5000;

const { connectToDatabase, closeDatabase } = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const guestRoutes = require("./routes/guest.routes");
const invitationRoutes = require("./routes/invitation.routes");
const giftRoutes = require("./routes/gift.routes");
const { listThemes } = require("./controllers/theme.controller");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");

// ===============================================
// CORS CONFIGURATION - FIXED (No path-to-regexp issues)
// ===============================================
// Allow all origins for development
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoints
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "WedEase backend API is ready.",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Express server is running",
  });
});

// API Routes
app.get("/api/themes", listThemes);
app.use("/api/auth", authRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/gifts", giftRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = () =>
  connectToDatabase()
    .then(() => {
      const server = app.listen(port, () =>
        console.log(`
╔════════════════════════════════════════════════╗
║   Backend Server Running                       ║
╠════════════════════════════════════════════════╣
║   Express started on http://localhost:${port}     ║
║   CORS enabled for all origins                 ║
║   Database: MongoDB                            ║
║   press Ctrl-C to terminate.                   ║
╚════════════════════════════════════════════════╝
  `),
      );

      const shutdown = async () => {
        await closeDatabase();
        server.close(() => {
          console.log("Server closed.");
          process.exit(0);
        });
      };

      process.on("SIGINT", shutdown);
      process.on("SIGTERM", shutdown);

      return server;
    })
    .catch((error) => {
      console.error(
        "Failed to connect to the database. Server not started.",
        error,
      );
      process.exit(1);
    });

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;