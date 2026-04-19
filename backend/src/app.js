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
const chatbotRoutes = require("./routes/chatbot.routes");
const themeRoutes = require("./routes/theme.routes"); // ADD THIS LINE
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");

// ============================================
// COMPLETE CORS CONFIGURATION - FIXED
// ============================================
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5503',
    'http://127.0.0.1:5503',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================
// ROUTES
// ============================================
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

// Theme routes - ADD THESE LINES
app.use("/api/themes", themeRoutes);

// Other routes
app.use("/api/auth", authRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/gifts", giftRoutes);
app.use("/api/chatbot", chatbotRoutes);

// ============================================
// ERROR HANDLING
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
const startServer = () =>
  connectToDatabase()
    .then(() => {
      const server = app.listen(port, () =>
        console.log(`
╔════════════════════════════════════════════════╗
║   Backend Server Running                       ║
╠════════════════════════════════════════════════╣
║   Express started on http://localhost:${port}  ║
║   Chatbot endpoint: /api/chatbot               ║
║   Themes endpoint: /api/themes/fetch-all       ║
║   CORS enabled for development                 ║
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