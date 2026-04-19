const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("node:path");
const { connectToDatabase } = require("./config/db");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(cors({ origin: "http://localhost:5500", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth.routes"));
// ...existing routes (guests, invitations, gifts, themes, etc.)

app.get("/", (req, res) =>
  res.json({ success: true, message: "WedEase backend API is ready." }),
);

const port = process.env.PORT || 5000;
connectToDatabase().then(() => {
  app.listen(port, () =>
    console.log(`Server running on http://localhost:${port}`),
  );
});
