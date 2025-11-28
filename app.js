// ===============================================
// PAGE NAVIGATION & ROUTING
// ===============================================

class PageRouter {
  constructor() {
    this.currentPage = "home";
    this.init();
  }

  init() {
    this.setupNavigation();
    this.navigateTo("home");

    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.slice(1) || "home";
      this.navigateTo(hash);
    });

    this.setupHeaderScroll();
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll("[data-page]");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        this.navigateTo(page);
        window.location.hash = page;
      });
    });
  }

  navigateTo(page) {
    const pages = document.querySelectorAll(".page");
    pages.forEach((p) => p.classList.remove("active"));

    const selectedPage = document.getElementById(page);
    if (selectedPage) {
      selectedPage.classList.add("active");
      this.currentPage = page;

      window.scrollTo(0, 0);

      this.updateActiveNavLink(page);
    }
  }

  updateActiveNavLink(page) {
    const navLinks = document.querySelectorAll("[data-page]");
    navLinks.forEach((link) => {
      if (link.dataset.page === page) {
        link.style.borderBottomColor = "var(--wed-secondary)";
        link.style.color = "var(--wed-secondary)";
      } else {
        link.style.borderBottomColor = "transparent";
        link.style.color = "var(--wed-primary)";
      }
    });
  }

  setupHeaderScroll() {
    const header = document.getElementById("header");
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (window.scrollY > 0) {
              header.classList.add("is-fixed");
            } else {
              header.classList.remove("is-fixed");
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }
}

// ===============================================
// INTERACTIVE ELEMENTS
// ===============================================

class InteractiveElements {
  constructor() {
    this.init();
  }

  init() {
    this.setupButtons();
    this.setupHoverEffects();
  }

  setupButtons() {
    const ctaButtons = document.querySelectorAll(".cta-button");
    ctaButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        window.location.hash = "about";
      });
    });

    const loginBtn = document.querySelector(".login-btn");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        window.location.hash = "login";
      });
    }

    const addItemButtons = document.querySelectorAll(".add-item");
    addItemButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.addBudgetItem();
      });
    });
  }

  setupHoverEffects() {
    const interactiveElements = document.querySelectorAll(
      ".feature-card, .category-card, .theme-card, .feature-box"
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", function () {
        this.style.transition = "all 0.3s ease";
      });
    });
  }

  addBudgetItem() {
    const budgetItems = document.querySelector(".budget-items");
    const newItem = document.createElement("div");
    newItem.className = "budget-item";
    newItem.innerHTML = `
      <span class="item-name">New Item</span>
      <span class="item-amount">$0</span>
    `;

    const addItemBtn = budgetItems.querySelector(".add-item");
    addItemBtn.parentNode.insertBefore(newItem, addItemBtn);
  }
}

// ===============================================
// UTILITIES
// ===============================================

class Utilities {
  static formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
}

// ===============================================
// APP INITIALIZATION
// ===============================================

class WedEASEApp {
  constructor() {
    this.router = new PageRouter();
    this.interactive = new InteractiveElements();
    this.init();
  }

  init() {
    console.log("WedEASE App initialized");

    document.addEventListener("click", (e) => {
      const target = e.target.closest("[data-page]");
      if (target) {
        e.preventDefault();
        const page = target.dataset.page;
        this.router.navigateTo(page);
        window.location.hash = page;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new WedEASEApp();
});

window.WedEASEUtils = Utilities;

// ===============================================
// BUDGET PAGE — CRUD LOGIC
// ===============================================

document.addEventListener("DOMContentLoaded", () => {
  const budgetList = document.getElementById("budget-list");
  const addItemBtn = document.getElementById("addItemBtn");
  const budgetForm = document.getElementById("budgetForm");
  const saveItemBtn = document.getElementById("saveItemBtn");
  const cancelItemBtn = document.getElementById("cancelItemBtn");
  const totalAmountDisplay = document.getElementById("totalAmount");

  const nameInput = document.getElementById("itemName");
  const amountInput = document.getElementById("itemAmount");

  let budgetItems = [
    { name: "Makeup Artist", amount: 7000 },
    { name: "Venue Rental", amount: 15000 },
    { name: "Catering", amount: 12000 },
  ];

  let editIndex = null;

  function renderBudget() {
    budgetList.innerHTML = "";
    let total = 0;

    budgetItems.forEach((item, index) => {
      total += item.amount;

      const div = document.createElement("div");
      div.classList.add("budget-item");

      div.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-amount">
          $${item.amount.toLocaleString()}
          <span class="actions">
            <button onclick="editBudgetItem(${index})">Edit</button>
            <button onclick="deleteBudgetItem(${index})">Delete</button>
          </span>
        </span>
      `;

      budgetList.appendChild(div);
    });

    totalAmountDisplay.textContent = "$" + total.toLocaleString();
  }

  addItemBtn.addEventListener("click", () => {
    editIndex = null;
    nameInput.value = "";
    amountInput.value = "";
    budgetForm.classList.remove("hidden");
  });

  cancelItemBtn.addEventListener("click", () => {
    budgetForm.classList.add("hidden");
  });

  saveItemBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!name || isNaN(amount)) {
      alert("Enter valid name & amount");
      return;
    }

    if (editIndex !== null) {
      budgetItems[editIndex] = { name, amount };
    } else {
      budgetItems.push({ name, amount });
    }

    budgetForm.classList.add("hidden");
    renderBudget();
  });

  window.editBudgetItem = function (index) {
    editIndex = index;
    nameInput.value = budgetItems[index].name;
    amountInput.value = budgetItems[index].amount;
    budgetForm.classList.remove("hidden");
  };

  window.deleteBudgetItem = function (index) {
    budgetItems.splice(index, 1);
    renderBudget();
  };

  renderBudget();
});

// ===============================================
// LOGIN / SIGNUP LOGIC
// ===============================================

(async function attachAuthHandlers() {
  function encode(str) {
    return new TextEncoder().encode(str);
  }

  async function hashPassword(password) {
    const buf = await crypto.subtle.digest("SHA-256", encode(password));
    return [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function getUsers() {
    return JSON.parse(localStorage.getItem("wedease_users") || "{}");
  }

  function setUsers(obj) {
    localStorage.setItem("wedease_users", JSON.stringify(obj));
  }

  function setCurrentUser(email) {
    localStorage.setItem("wedease_current", email);
    updateHeaderUser(email);
  }

  function clearCurrentUser() {
    localStorage.removeItem("wedease_current");
    updateHeaderUser(null);
  }

  function updateHeaderUser(email) {
    const headerRight = document.querySelector(".header-right");

    const existing = document.getElementById("user-label");
    if (existing) existing.remove();

    if (email) {
      const btn = document.createElement("button");
      btn.id = "user-label";
      btn.className = "login-btn";
      btn.textContent = email.split("@")[0];
      btn.addEventListener("click", () => {
        if (confirm("Sign out?")) {
          clearCurrentUser();
        }
      });
      headerRight.appendChild(btn);
    }
  }

  function showStatus(msg, color) {
    const el = document.getElementById("auth-status");
    if (!el) return;
    el.textContent = msg;
    el.style.color = color || "var(--wed-secondary)";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const signinBtn = document.getElementById("signin-btn");
    const signupBtn = document.getElementById("signup-btn");
    const showSignup = document.getElementById("show-signup");
    const showSignin = document.getElementById("show-signin");

    if (showSignup)
      showSignup.addEventListener("click", () => {
        document.getElementById("signin-card").classList.add("hidden");
        document.getElementById("signup-card").classList.remove("hidden");
      });

    if (showSignin)
      showSignin.addEventListener("click", () => {
        document.getElementById("signup-card").classList.add("hidden");
        document.getElementById("signin-card").classList.remove("hidden");
      });

    if (signupBtn)
      signupBtn.addEventListener("click", async () => {
        const email = document
          .getElementById("signup-email")
          .value.trim()
          .toLowerCase();
        const pw = document.getElementById("signup-password").value;
        const pw2 = document.getElementById("signup-password2").value;

        if (!email.includes("@")) {
          showStatus("Invalid email", "crimson");
          return;
        }
        if (pw.length < 8) {
          showStatus("Password too short", "crimson");
          return;
        }
        if (pw !== pw2) {
          showStatus("Passwords do not match", "crimson");
          return;
        }

        const users = getUsers();
        if (users[email]) {
          showStatus("Account already exists", "crimson");
          return;
        }

        users[email] = { hash: await hashPassword(pw), created: Date.now() };
        setUsers(users);
        setCurrentUser(email);
        showStatus("Account created!", "green");

        window.location.hash = "home";
      });

    if (signinBtn)
      signinBtn.addEventListener("click", async () => {
        const email = document
          .getElementById("signin-email")
          .value.trim()
          .toLowerCase();
        const pw = document.getElementById("signin-password").value;

        const users = getUsers();
        if (!users[email]) {
          showStatus("Account not found", "crimson");
          return;
        }

        const hashed = await hashPassword(pw);
        if (hashed !== users[email].hash) {
          showStatus("Incorrect password", "crimson");
          return;
        }

        setCurrentUser(email);
        showStatus("Login successful!", "green");

        window.location.hash = "home";
      });

    const current = localStorage.getItem("wedease_current");
    if (current) updateHeaderUser(current);
  });
})();
