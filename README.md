# **WedEASE — Wedding Planning Made Easy**

A modern, elegant, single-page wedding planning platform designed to simplify the entire planning experience.
Built with **HTML, CSS, and JavaScript** (no frameworks), WedEASE focuses on smooth navigation, beautiful UI, and practical tools for brides, grooms, and coordinators.

---

## 🌸 **Features Overview**

### 🔗 **Navigation Workflow**

WedEASE contains five main pages:

- **Home**
- **About**
- **Budget**
- **Theme**
- **Track**

Clicking **Start Now** on the Home page takes users directly to the **About** page, which introduces the platform and leads them to detailed tools.

---

## 🕊️ **About Page Workflow**

The About page contains:

- **About WedEASE**
- **Our Mission**
- **Why Choose WedEASE?**

Under _Why Choose WedEASE_, users can navigate via CTAs:

- **Manage Budget** → Budget Page
- **Explore Theme** → Theme Page
- **Track Guests** → Track Page

---

# 💰 **Budget Page**

A complete budget management system that includes:

### **1. Budget Tracker (CRUD System)**

Users can:

- Add budget items
- Edit items
- Delete items
- Store details such as:
  - Category name
  - Estimated cost
  - Status
  - Notes

### **2. Budget Progress Estimator**

Users can input their **total budget**, and the system automatically:

- Calculates recommended spending per category
- Animates each category value using count-up effects
- Updates calculations dynamically when the user changes inputs
- Allows users to add additional custom categories

### **3. Multi-Currency Support**

- Convert budget between **USD ↔ KHR (Khmer RIEL)**
- Uses live **Currency API**
- Automatically updates all category estimates

### **4. Export to PDF**

Users can download their budget overview as a clean PDF.

---

# 🎨 **Theme Page**

Users can explore unlimited themes using a **public image API** (e.g., Pexels / Unsplash).

Features:

- Load wedding themes dynamically
- Display theme images, titles, and descriptions
- Allow browsing for inspiration
- Smooth loading & responsive grid layout

---

# 🪑 **Track Page — Guest Seating Generator**

A simple but powerful guest management system:

- Add guest names
- Create guest groups (Family, Friends, Office, etc.)
- System generates a **seating layout** automatically based on group size
- Visual seat mapping using a grid
- Users can reorganize guests anytime

---

# 🔐 **User Authentication (LocalStorage Based)**

WedEASE includes a lightweight login system:

- **Sign Up**
  - Email + password
  - Password securely hashed with SHA-256

- **Sign In**
  - LocalStorage-based credential validation

- **Logged-in header state**
  - Displays username
  - Click to sign out

- No backend required — 100% client-side

---

# 🧩 **Tech Stack**

| Layer              | Technology                       |
| ------------------ | -------------------------------- |
| UI / Pages         | HTML5, CSS3                      |
| Styling            | Custom CSS (no frameworks)       |
| Logic              | Vanilla JavaScript               |
| Charts / Animation | Custom count-up number animation |
| Currency API       | Third-party REST API             |
| Authentication     | LocalStorage + SHA-256 hashing   |
| Export             | jsPDF (PDF generation)           |

---

# 📁 **Project Structure**

WedEASE is organized as a **monorepo** with separate frontend and backend applications:

```
WedEASE/
├── backend/                       # Node.js + Express + MongoDB server
│   ├── node_modules/
│   ├── src/
│   │   ├── config/               # Environment & database setup
│   │   ├── middlewares/           # Error & not-found handlers
│   │   ├── modules/              # Feature modules (routes/controllers/models)
│   │   ├── routes/               # API route registry
│   │   ├── app.js                # Express app composition
│   │   └── server.js             # Startup & graceful shutdown
│   ├── package.json              # Backend dependencies
│   ├── package-lock.json
│   ├── .env                      # Backend environment config
│   └── .env.example
│
├── frontend/                      # HTML5 + CSS3 + Vanilla JavaScript
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── assets/
│   ├── src/
│   ├── app.js, budget.js, theme.js, track.js
│   └── package.json              # Frontend metadata (optional tooling)
│
├── package.json                   # Root monorepo orchestration
├── README.md                      # This file
├── .gitignore
└── .vscode/
```

## **Package Structure**

- **Root `package.json`** — Monorepo management with workspace commands
- **Backend `package.json`** — Node.js dependencies (Express, Mongoose, etc.)
- **Frontend `package.json`** — Frontend metadata for future tooling (no build step required)

## **API Endpoints**

Current endpoints:

- `GET /api/health` — Health check endpoint

---

# 🛠️ **Installation & Setup**

## **Clone the Repository**

```bash
git clone https://github.com/<your-username>/WedEASE.git
cd WedEASE
```

## **Quick Start (Backend + Frontend)**

From the root directory, install and run both:

```bash
# Install all dependencies (root + backend)
npm run setup

# Start backend server (from root)
npm run dev

# In a separate terminal, start frontend (optional - can open directly in browser)
npm run dev:frontend
```

## **Backend Setup** (Detailed)

Navigate to the backend folder:

```bash
cd backend

# Install dependencies
npm install

# Create environment file from template
# macOS/Linux
cp .env.example .env

# Windows (PowerShell)
copy .env.example .env
```

Ensure MongoDB is running locally, or update `MONGODB_URI` in `backend/.env` with your Atlas connection.

Start the backend server:

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Backend API runs on **http://localhost:5000**

## **Frontend Setup** (Detailed)

The frontend is a static site with no build step required.

From root, open the frontend directly or serve locally:

```bash
# Option 1: Direct file open
open frontend/index.html

# Option 2: Serve locally with Python
cd frontend
python -m http.server 8000

# Then visit http://localhost:8000/index.html
```

Alternatively, use VS Code Live Server or any static HTTP server of your choice.

---

# 🚀 **Future Improvements**

- Add API for live wedding service pricing
- Add drag-and-drop seating arrangement
- Sync user data with cloud backend (Firebase or Supabase)
- Add dark mode
- Allow sharing budget PDF to email

---
