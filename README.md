# **WedEASE — Wedding Planning Made Easy**

A modern, elegant, single-page wedding planning platform designed to simplify the entire planning experience.
Built with **HTML, CSS, and JavaScript** (no frameworks), WedEASE focuses on smooth navigation, beautiful UI, and practical tools for brides, grooms, and coordinators.

---

## 🌸 **Features Overview**

### 🔗 **Navigation Workflow**

WedEASE contains five main pages:

* **Home**
* **About**
* **Budget**
* **Theme**
* **Track**

Clicking **Start Now** on the Home page takes users directly to the **About** page, which introduces the platform and leads them to detailed tools.

---

## 🕊️ **About Page Workflow**

The About page contains:

* **About WedEASE**
* **Our Mission**
* **Why Choose WedEASE?**

Under *Why Choose WedEASE*, users can navigate via CTAs:

* **Manage Budget** → Budget Page
* **Explore Theme** → Theme Page
* **Track Guests** → Track Page

---

# 💰 **Budget Page**

A complete budget management system that includes:

### **1. Budget Tracker (CRUD System)**

Users can:

* Add budget items
* Edit items
* Delete items
* Store details such as:

  * Category name
  * Estimated cost
  * Status
  * Notes

### **2. Budget Progress Estimator**

Users can input their **total budget**, and the system automatically:

* Calculates recommended spending per category
* Animates each category value using count-up effects
* Updates calculations dynamically when the user changes inputs
* Allows users to add additional custom categories

### **3. Multi-Currency Support**

* Convert budget between **USD ↔ KHR (Khmer RIEL)**
* Uses live **Currency API**
* Automatically updates all category estimates

### **4. Export to PDF**

Users can download their budget overview as a clean PDF.

---

# 🎨 **Theme Page**

Users can explore unlimited themes using a **public image API** (e.g., Pexels / Unsplash).

Features:

* Load wedding themes dynamically
* Display theme images, titles, and descriptions
* Allow browsing for inspiration
* Smooth loading & responsive grid layout

---

# 🪑 **Track Page — Guest Seating Generator**

A simple but powerful guest management system:

* Add guest names
* Create guest groups (Family, Friends, Office, etc.)
* System generates a **seating layout** automatically based on group size
* Visual seat mapping using a grid
* Users can reorganize guests anytime

---

# 🔐 **User Authentication (LocalStorage Based)**

WedEASE includes a lightweight login system:

* **Sign Up**

  * Email + password
  * Password securely hashed with SHA-256
* **Sign In**

  * LocalStorage-based credential validation
* **Logged-in header state**

  * Displays username
  * Click to sign out
* No backend required — 100% client-side

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

# 📂 **Project Structure**

```
/project
  ├── index.html
  ├── style.css
  ├── app.js
  ├── /assets (optional)
  └── README.md
```

---

# 🛠️ **Installation & Setup**

1. Clone the repository:

```bash
git clone https://github.com/<your-username>/WedEASE.git
```

2. Open the project folder:

```bash
cd WedEASE
```

3. Open `index.html` in your browser.
   No additional setup needed — everything runs client-side.

---

# 🚀 **Future Improvements**

* Add API for live wedding service pricing
* Add drag-and-drop seating arrangement
* Sync user data with cloud backend (Firebase or Supabase)
* Add dark mode
* Allow sharing budget PDF to email

---

