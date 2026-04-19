const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("node:path");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
  override: false,
});

const port = Number(process.env.PORT) || 5000;

const { connectToDatabase, closeDatabase } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const guestRoutes = require("./routes/guestRoutes");
const invitationRoutes = require("./routes/invitationRoutes");
const giftRoutes = require("./routes/giftRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const themeRoutes = require("./routes/themeRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");

// ============================================
// COMPLETE CORS CONFIGURATION - FIXED
// ============================================
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:5503", // ADD THIS
      "http://127.0.0.1:5503", // ADD THIS
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "http://localhost:5000",
      "http://127.0.0.1:5000",
      "*",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Origin",
    ],
    exposedHeaders: ["Content-Length", "X-Requested-With"],
    optionsSuccessStatus: 200,
  }),
);

app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
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
                                                               
╔════════════════════════════════════════════════╗            ╔════════════════════════════════════════════════╗                                                                            
║             AUTH SYSTEM                        ║            ║               AUTH ENDPOINTS                   ║
║       Login / Register / Session               ║            ╠════════════════════════════════════════════════╣
╠════════════════════════════════════════════════╣            ║   - POST /api/auth/register                    ║
║   - Security Layer Active                      ║            ║   - PATCH /api/auth/login                      ║
║   - JWT Cookie Authentication                  ║            ║   - GET /api/auth/me                           ║
║   - bcrypt Password Hashing                    ║            ║   - POST /api/auth/logout                      ║
║   - express-validator enabled                  ║            ║   - DELETE /api/auth/account                   ║
║    - MongoDB User Model                        ║            ║                                                ║
╚════════════════════════════════════════════════╝            ╚════════════════════════════════════════════════╝
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
