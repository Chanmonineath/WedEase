# WedEASE - Wedding Planning Made Easy

## 📋 Overview

WedEASE is a comprehensive, all-in-one wedding planning platform designed to simplify the entire wedding planning experience. Built with **HTML, CSS, and vanilla JavaScript** on the frontend and **Node.js/Express** with **MongoDB** on the backend, WedEASE provides couples with powerful tools to manage every aspect of their big day—from theme selection and guest management to invitations and seating arrangements.

The platform features a modern, responsive design with a romantic aesthetic, real-time currency conversion, AI-powered chatbot assistance, and full CRUD operations for all wedding planning data.

> **Note:** The Budget Tracker feature was part of the previous Web II project and is not counted toward the current project's core functionality.

---

## ✨ Key Features

### 🏠 Home & Countdown
- Interactive wedding date countdown timer
- Dynamic hero section with rotating images and CTA buttons
- Smooth scrolling and responsive design

### 👤 Authentication System
- User registration and login with JWT tokens
- Session persistence (localStorage/sessionStorage)
- Password update and account deletion
- Secure password hashing with bcrypt

### 🎨 Wedding Themes
- Curated wedding themes with Unsplash image integration
- Search and filter functionality
- Save favorite themes (persisted to both localStorage and MongoDB)
- Theme inspiration gallery with image grids

### 📧 E-Invitation System
- CSV import for bulk guest uploads
- Manual guest addition
- Generate unique invitation links for each guest
- Track invitation status (Pending, Sent, Responded)
- RSVP statistics dashboard
- Guest list export to CSV

### 📊 Guest & Gift Management
- Guest list management with group filtering
- RSVP tracking (Confirmed, Pending, Declined)
- Gift registry with value tracking
- CSV import/export for guests and gifts
- Real-time statistics (guest count, confirmed RSVPs, gift totals)

### 🤖 AI Chatbot Assistant
- Powered by Groq's Llama 3.3 70B model
- Wedding-specific context and suggestions
- Chat history persistence per user
- Quick suggestion chips for common questions

### 👤 User Settings
- Change password with current password verification
- Account deletion (soft delete with recovery option)
- Profile preview with Gravatar integration

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling (custom CSS, no frameworks) |
| JavaScript (ES6+) | Interactivity and API integration |
| Google Fonts | Typography (Inter, Caveat, Great Vibes, etc.) |
| Material Icons | Iconography |
| jsPDF | PDF generation for budget reports |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB Atlas | Database (with Mongoose/MongoDB driver) |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Multer | CSV file upload handling |
| Groq API | AI chatbot responses |
| Unsplash API | Theme image sourcing |

### Testing Data
The project includes CSV files for testing:
- `invitation.csv` - Sample guest list for invitations (15 guests)
- `test_guests.csv` - Sample guest data with groups and RSVP status (10 guests)
- `test_gifts.csv` - Sample gift registry data (8 gifts)

---

## 📁 Project Structure

```
WedEASE/
├── frontend/                    # Frontend static files
│   ├── index.html              # Home page
│   ├── rsvp.html               # Public RSVP page
│   ├── css/                    # Stylesheets
│   │   ├── base.css           # Global styles
│   │   ├── index.css          # Home page styles
│   │   ├── about.css          # About page styles
│   │   ├── theme.css          # Themes page styles
│   │   ├── track.css          # Track page styles
│   │   ├── budget.css         # Budget page styles (legacy)
│   │   ├── login.css          # Login page styles
│   │   ├── chatbot.css        # Chatbot widget styles
│   │   └── user-settings.css  # Settings page styles
│   ├── js/                     # JavaScript files
│   │   ├── app.js             # Core utilities, auth, countdown
│   │   ├── nav.js             # Mobile navigation
│   │   ├── chatbot.js         # Chatbot widget
│   │   ├── budget.js          # Budget tracker (legacy)
│   │   ├── track.js           # Guest/gift management
│   │   ├── theme.js           # Theme manager
│   │   └── invitation.js      # E-invitation system
│   ├── assets/                 # Images and icons
│   │   └── img/
│   │       ├── track/         # Track page icons
│   │       ├── pink-purpleish logo.png
│   │       ├── bride and groom.png
│   │       ├── wedding car.png
│   │       └── ring hand.png
│   └── src/pages/              # Other HTML pages
│       ├── about.html
│       ├── theme.html
│       ├── track.html
│       ├── budget.html        # Legacy page
│       ├── invitation.html
│       ├── login.html
│       ├── favourites.html
│       └── user-settings.html
│
├── backend/                    # Backend Node.js server
│   ├── src/
│   │   ├── app.js             # Main Express app
│   │   ├── config/
│   │   │   └── db.js          # MongoDB connection
│   │   ├── controllers/       # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── guest.controller.js
│   │   │   ├── gift.controller.js
│   │   │   ├── invitationGuest.controller.js
│   │   │   ├── chatbot.controller.js
│   │   │   ├── theme.controller.js
│   │   │   └── savedTheme.controller.js
│   │   ├── middleware/        # Custom middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── errorHandler.js
│   │   │   ├── notFound.js
│   │   │   └── validation.midleware.js
│   │   ├── models/            # Database models
│   │   │   ├── auth/
│   │   │   │   ├── userModel.js
│   │   │   │   └── revokedTokenModel.js
│   │   │   ├── Guest.js
│   │   │   ├── Gift.js
│   │   │   ├── Chat.js
│   │   │   ├── InvitationGuest.js
│   │   │   └── SavedTheme.js
│   │   ├── routes/            # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── guest.routes.js
│   │   │   ├── gift.routes.js
│   │   │   ├── chatbot.routes.js
│   │   │   ├── theme.routes.js
│   │   │   ├── savedTheme.routes.js
│   │   │   └── invitationGuest.routes.js
│   │   ├── services/          # Business logic
│   │   │   └── authService.js
│   │   └── utils/             # Utilities
│   │       ├── csvParser.js
│   │       ├── email.js
│   │       └── generateToken.js
│   ├── package.json
│   └── .env                   # Environment variables (create this)
│
├── invitation.csv             # Sample guest list for testing
├── test_guests.csv           # Sample guest data with RSVP
├── test_gifts.csv            # Sample gift registry data
└── README.md                 # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB Atlas** account (or local MongoDB instance)
- **API Keys** (see below)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Chanmonineath/WedEase.git
cd WedEase
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas
ATLAS_URI=mongodb+srv://neathhchan_db_user:LpFd6lXGgTPhAWGH@cluster0.jt7czw5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=WedEase

# JWT Secret
JWT_SECRET=9a240f6b19e67c9a4f1ccec068da816010e8cd56a1c8a9e9ae28a57b9a12fcbeaa90df4bfc7d7090bf4e52f9ef77c006ff9697349fb005fe80c3948c9884db31

# API Keys
GROQ_API_KEY=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
UNSPLASH_ACCESS_KEY=i65VqX1kxQVuEwSEABbxMRtA_rufIZ7_DuQWG1W_EBQ

# Frontend Base URL (for invitation links)
BASE_URL=http://127.0.0.1:5504/frontend

# CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5503,http://127.0.0.1:5504
```

### Step 3: Frontend Setup

No build step required! The frontend is pure HTML/CSS/JS.

To serve the frontend, you can use any static server:

```bash
# Using Python (recommended)
cd frontend
python -m http.server 5504

# OR using VS Code Live Server extension (port 5500)
# OR using npx serve
npx serve frontend -p 5504
```

### Step 4: Start the Backend Server

```bash
cd backend
npm run dev    # Development with auto-reload (nodemon)
# OR
npm start      # Production mode
```

The backend will run on `http://localhost:5000`

### Step 5: Access the Application

Open your browser and navigate to:
- **Frontend:** `http://127.0.0.1:5503/frontend/index.html`
- **Backend API:** `http://localhost:5000`

---

## 🔑 API Keys & Services

### Required API Keys

| Service | Purpose | How to Get |
|---------|---------|------------|
| **MongoDB Atlas** | Database | [Sign up](https://www.mongodb.com/cloud/atlas) → Create cluster → Get connection string |
| **Groq API** | AI Chatbot | [Sign up](https://console.groq.com) → Generate API key |
| **Unsplash API** | Theme images | [Register app](https://unsplash.com/developers) → Get access key |

### API Key Notes
- The Unsplash API key is required for theme images; without it, placeholder images will be used.

---

## 🧪 Testing Data

The project includes CSV files for testing all features:

### 1. `invitation.csv` - Guest List for Invitations
```csv
Name,Email,Phone
Sokha Chea,sokha.chea@example.com,012345678
Rithy Sorn,rithy.sorn@example.com,098765432
...
```
**Use on:** Invitation page → "Upload Guest List (CSV)"

### 2. `test_guests.csv` - Guest Data with RSVP
```csv
Name,Group,RSVP
Anna Lim,Bride's Family,Yes
James Tan,Bride's Family,Yes
...
```
**Use on:** Track page → Guest List → "Import CSV"

### 3. `test_gifts.csv` - Gift Registry Data
```csv
GiftType,FromGuest,Value
Money,Anna Lim,200
Jewelry,Jessica Park,350
...
```
**Use on:** Track page → Gift Registry → "Import CSV"

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create new account |
| POST | `/login` | Login user |
| POST | `/logout` | Logout (revokes token) |
| GET | `/me` | Get current user info |
| PATCH | `/password` | Update password |
| DELETE | `/account` | Delete account |

### Guests (`/api/guests`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all guests |
| POST | `/` | Add a guest |
| PUT | `/:id` | Update guest |
| DELETE | `/:id` | Delete guest |

### Gifts (`/api/gifts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all gifts |
| POST | `/` | Add a gift |
| PUT | `/:id` | Update gift |
| DELETE | `/:id` | Delete gift |

### Invitation Guests (`/api/invitation-guests`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List invitation guests |
| POST | `/` | Add single guest |
| POST | `/bulk` | Bulk add guests |
| POST | `/send-invitations` | Generate invitation links |
| GET | `/stats` | Get RSVP statistics |
| DELETE | `/:id` | Delete guest |
| DELETE | `/` | Delete all guests |

**Public Routes (no auth):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/:token` | Get guest by invitation token |
| POST | `/public/rsvp/:token` | Submit RSVP response |

### Themes (`/api/themes`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all themes |
| GET | `/fetch-all` | Fetch themes with Unsplash images |

### Saved Themes (`/api/saved-themes`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user's saved themes |
| POST | `/` | Save a theme |
| DELETE | `/:themeKey` | Remove saved theme |

### Chatbot (`/api/chatbot`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Send message (requires auth) |
| GET | `/history` | Get chat history |
| GET | `/:chatId` | Get specific chat |
| DELETE | `/:chatId` | Delete chat |

---

## 🎨 Theme Customization

The color scheme can be customized by modifying CSS variables in `frontend/css/base.css`:

```css
:root {
  --wed-bg: #fcf4fb;
  --wed-primary: #a2437c;
  --wed-secondary: #6f3054;
  --wed-headline: #333333;
  --wed-text: #666;
  --wed-border: #e0d5e3;
  --cta-pink: #ffb6d9;
  --cta-dark-pink: #c2185b;
}
```

---

## 📱 Responsive Design

WedEASE is fully responsive and works on:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (< 768px)

Mobile features include:
- Hamburger menu navigation
- Stacked layouts
- Touch-friendly buttons
- Optimized font sizes

---

## 🐛 Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Backend won't start** | Check MongoDB connection string in `.env` |
| **API returns 401** | User not logged in; check token in localStorage |
| **Chatbot not responding** | Verify GROQ_API_KEY is valid and backend is running |
| **Theme images not loading** | Unsplash API key missing or rate limited; placeholders will appear |
| **CSV import fails** | Ensure CSV format matches expected headers (Name, Email, Phone) |
| **CORS errors** | Add your frontend URL to `CORS_ORIGINS` in `.env` |
| **Currency rates not updating** | Check internet connection; free API has rate limits |

### Development Tips

```bash
# Check backend logs
cd backend && npm run dev

# Check if MongoDB is accessible
mongosh <your_connection_string>

# Test API endpoint
curl http://localhost:5000/api/health
```

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👥 Contributors

- **Chanmonineath** - Lead Developer

---

## 🙏 Acknowledgments

- **Groq** for providing the Llama 3.3 API
- **Unsplash** for beautiful wedding photography
- **Google Fonts** for typography
- **Material Icons** for iconography

---

## 📞 Support

For questions, issues, or contributions:
- **GitHub Issues:** [Open an issue](https://github.com/Chanmonineath/WedEase/issues)

---

## 🗺️ Roadmap

Future enhancements planned:
- [ ] Mobile app (React Native)
- [ ] Vendor marketplace integration
- [ ] Real-time collaboration for couples
- [ ] Wedding website builder
- [ ] Photo sharing gallery
- [ ] Weather integration for outdoor weddings
- [ ] Multi-language support (Khmer, English)
- [ ] Offline mode with PWA

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025 | Initial release with core features |

---

**Made with ❤️ for couples everywhere**
