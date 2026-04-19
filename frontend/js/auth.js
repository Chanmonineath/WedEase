// Password strength check: 8+ chars, upper, lower, number
function isStrongPassword(pw) {
  return (
    typeof pw === "string" &&
    pw.length >= 8 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /[0-9]/.test(pw)
  );
}
// =====================================
// WedEASE AUTH (Facebook-style validation)
// =====================================

const API_BASE = "http://localhost:5000/api/auth";

// ----------------------
// STATUS MESSAGE
// ----------------------
function showAuthStatus(message, isError = false) {
  const statusDiv = document.getElementById("auth-status");
  if (!statusDiv) return;

  statusDiv.textContent = message;
  statusDiv.classList.remove("success", "error", "visible");

  if (message) statusDiv.classList.add("visible");
  if (isError) statusDiv.classList.add("error");
  else if (message) statusDiv.classList.add("success");
}

// ----------------------
// FIELD ERROR (FACEBOOK STYLE)
// ----------------------
function showFieldError(input, msg, msgElem) {
  if (!input) return;

  input.classList.add("input-error");

  // shake wrapper (facebook style)
  const wrapper = input.closest(".password-wrapper") || input;
  wrapper.classList.remove("shake");
  void wrapper.offsetWidth; // restart animation
  wrapper.classList.add("shake");

  if (msgElem) {
    msgElem.innerHTML = msg;
    msgElem.classList.add("active");
  }

  setTimeout(() => input.classList.remove("input-error"), 600);
}

// ----------------------
function clearFieldError(input, msgElem) {
  if (!input) return;

  input.classList.remove("input-error");

  const wrapper = input.closest(".password-wrapper") || input;
  wrapper.classList.remove("shake");

  if (msgElem) {
    msgElem.innerHTML = "";
    msgElem.classList.remove("active");
  }
}

// ----------------------
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ======================
// LOGIN
// ======================
async function handleLogin(e) {
  if (e) e.preventDefault();

  const emailInput = document.getElementById("signin-email");
  const passwordInput = document.getElementById("signin-password");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  let emailMsg = document.getElementById("signin-email-msg");
  let passwordMsg = document.getElementById("signin-password-msg");

  let valid = true;

  clearFieldError(emailInput, emailMsg);
  clearFieldError(passwordInput, passwordMsg);

  if (!email) {
    showFieldError(emailInput, "Email is required", emailMsg);
    valid = false;
  } else if (!isValidEmail(email)) {
    showFieldError(emailInput, "Enter a valid email", emailMsg);
    valid = false;
  }

  if (!password) {
    showFieldError(passwordInput, "Password is required", passwordMsg);
    valid = false;
  }

  if (!valid) return;

  showAuthStatus("Signing in...");

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showAuthStatus("Login successful!");
      setTimeout(() => {
        window.location.href = "../../index.html";
      }, 1000);
    } else {
      showAuthStatus(data.message || "Login failed", true);
    }
  } catch {
    showAuthStatus("Network error", true);
  }
}

// ======================
// REGISTER
// ======================
async function handleRegister(e) {
  if (e) e.preventDefault();

  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");
  const password2Input = document.getElementById("signup-password2");

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const password2 = password2Input.value;

  let emailMsg = document.getElementById("signup-email-msg");
  let passwordMsg = document.getElementById("signup-password-msg");
  let password2Msg = document.getElementById("signup-password2-msg");

  let valid = true;

  clearFieldError(emailInput, emailMsg);
  clearFieldError(passwordInput, passwordMsg);
  clearFieldError(password2Input, password2Msg);

  if (!email) {
    showFieldError(emailInput, "Email is required", emailMsg);
    valid = false;
  } else if (!isValidEmail(email)) {
    showFieldError(emailInput, "Enter a valid email", emailMsg);
    valid = false;
  }

  if (!password) {
    showFieldError(passwordInput, "Password is required", passwordMsg);
    valid = false;
  } else if (!isStrongPassword(password)) {
    showFieldError(
      passwordInput,
      "Password must be at least 8 characters, include uppercase, lowercase, and a number.",
      passwordMsg,
    );
    valid = false;
  }

  if (!password2) {
    showFieldError(password2Input, "Confirm your password", password2Msg);
    valid = false;
  }

  if (password && password2 && password !== password2) {
    showFieldError(password2Input, "Passwords do not match.", password2Msg);
    valid = false;
  }

  if (!valid) return;

  showAuthStatus("Creating account...");

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, name: email.split("@")[0] }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showAuthStatus("Account created!");
      document.getElementById("show-signin").click();
    } else {
      showAuthStatus(data.message || "Registration failed", true);
    }
  } catch {
    showAuthStatus("Network error", true);
  }
}

// ======================
// INIT
// ======================
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("signin-btn")?.addEventListener("click", handleLogin);
  document
    .getElementById("signup-btn")
    ?.addEventListener("click", handleRegister);

  // Toggle between sign-in and sign-up
  const signinCard = document.getElementById("signin-card");
  const signupCard = document.getElementById("signup-card");
  const signinTitle = document.getElementById("signin-title");
  const signinSubtitle = document.getElementById("signin-subtitle");
  document.getElementById("show-signup")?.addEventListener("click", () => {
    signinCard?.classList.add("hidden");
    signupCard?.classList.remove("hidden");
    if (signinTitle) signinTitle.style.display = "none";
    if (signinSubtitle) signinSubtitle.style.display = "none";
    showAuthStatus("");
  });
  document.getElementById("show-signin")?.addEventListener("click", () => {
    signupCard?.classList.add("hidden");
    signinCard?.classList.remove("hidden");
    if (signinTitle) signinTitle.style.display = "";
    if (signinSubtitle) signinSubtitle.style.display = "";
    showAuthStatus("");
  });

  // clear error on typing
  [
    ["signin-email", "signin-email-msg"],
    ["signin-password", "signin-password-msg"],
    ["signup-email", "signup-email-msg"],
    ["signup-password", "signup-password-msg"],
    ["signup-password2", "signup-password2-msg"],
  ].forEach(([inputId, msgId]) => {
    const input = document.getElementById(inputId);
    const msg = document.getElementById(msgId);
    if (input && msg) {
      input.addEventListener("input", () => {
        clearFieldError(input, msg);
        // If editing either password field, also clear confirm password error
        if (inputId === "signup-password" || inputId === "signup-password2") {
          const confirmInput = document.getElementById("signup-password2");
          const confirmMsg = document.getElementById("signup-password2-msg");
          if (confirmInput && confirmMsg) {
            clearFieldError(confirmInput, confirmMsg);
          }
        }
      });
    }
  });

  // Toggle password visibility for all toggle-password buttons
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", function () {
      const wrapper = btn.closest(".password-wrapper");
      const input = wrapper
        ? wrapper.querySelector('input[type="password"], input[type="text"]')
        : null;
      if (!input) return;
      const eyeOpen = btn.querySelector(".eye-open");
      const eyeClosed = btn.querySelector(".eye-closed");
      if (input.type === "password") {
        input.type = "text";
        btn.classList.add("visible");
        if (eyeOpen && eyeClosed) {
          eyeOpen.style.display = "none";
          eyeClosed.style.display = "inline";
        }
      } else {
        input.type = "password";
        btn.classList.remove("visible");
        if (eyeOpen && eyeClosed) {
          eyeOpen.style.display = "inline";
          eyeClosed.style.display = "none";
        }
      }
    });
  });
});
