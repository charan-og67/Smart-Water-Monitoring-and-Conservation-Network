// Experiment 3: Comprehensive client-side validation
// HTML5 validation is supplemented with JavaScript checks before submission.

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const namePattern = /^[A-Za-z][A-Za-z .'-]{2,49}$/;
const stationIdPattern = /^ST-\d{3}$/;

function showMessage(id, type, message) {
  const box = document.getElementById(id);
  if (box) box.innerHTML = `<div class="alert alert-${type} mb-0">${message}</div>`;
}

function clean(value) {
  return value.trim().replace(/\s+/g, " ");
}

function markInvalid(input, message) {
  input.classList.add("is-invalid");
  input.classList.remove("is-valid");
  let feedback = input.parentElement.querySelector(".js-feedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.className = "invalid-feedback js-feedback";
    input.parentElement.appendChild(feedback);
  }
  feedback.textContent = message;
  return false;
}

function markValid(input) {
  input.classList.remove("is-invalid");
  input.classList.add("is-valid");
  const feedback = input.parentElement.querySelector(".js-feedback");
  if (feedback) feedback.remove();
  return true;
}

function requiredText(input, label, min, max) {
  const value = clean(input.value);
  input.value = value;
  if (!value) return markInvalid(input, `${label} is required.`);
  if (value.length < min) return markInvalid(input, `${label} must contain at least ${min} characters.`);
  if (value.length > max) return markInvalid(input, `${label} must not exceed ${max} characters.`);
  return markValid(input);
}

function validateEmail(input) {
  const value = clean(input.value);
  input.value = value;
  if (!value) return markInvalid(input, "Email is required.");
  if (value.length > 100 || !emailPattern.test(value)) {
    return markInvalid(input, "Enter a valid email address.");
  }
  return markValid(input);
}

function validatePassword(input) {
  const value = input.value;
  if (!value) return markInvalid(input, "Password is required.");
  if (value.length < 8) return markInvalid(input, "Password must contain at least 8 characters.");
  if (value.length > 30) return markInvalid(input, "Password must not exceed 30 characters.");
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value)) {
    return markInvalid(input, "Use at least one uppercase letter, one lowercase letter, and one number.");
  }
  return markValid(input);
}

function validateSelect(input, label) {
  if (!input.value) return markInvalid(input, `Please select ${label}.`);
  return markValid(input);
}

function validateNumber(input, label, min, max) {
  const value = Number(input.value);
  if (input.value === "" || !Number.isFinite(value)) {
    return markInvalid(input, `${label} is required and must be a number.`);
  }
  if (value < min || value > max) {
    return markInvalid(input, `${label} must be between ${min} and ${max}.`);
  }
  return markValid(input);
}

// Registration validation
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const role = document.getElementById("role");
    const password = document.getElementById("password");
    const confirm = document.getElementById("confirmPassword");
    const terms = document.getElementById("terms");

    let valid = requiredText(name, "Full name", 3, 50);
    if (!namePattern.test(name.value)) valid = markInvalid(name, "Use letters, spaces, apostrophes, periods, or hyphens only.") && valid;

    valid = validateEmail(email) && valid;
    valid = validateSelect(role, "a role") && valid;
    valid = validatePassword(password) && valid;

    if (confirm.value !== password.value) {
      valid = markInvalid(confirm, "Passwords do not match.") && valid;
    } else {
      valid = markValid(confirm) && valid;
    }

    if (!terms.checked) {
      terms.classList.add("is-invalid");
      valid = false;
    } else {
      terms.classList.remove("is-invalid");
    }

    if (!valid) {
      showMessage("msg", "danger", "Please correct the highlighted fields before submitting.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("smartWaterUsers") || "[]");
    const normalizedEmail = email.value.toLowerCase();
    if (users.some(user => user.email === normalizedEmail)) {
      showMessage("msg", "danger", "An account with this email already exists. Please login.");
      return;
    }
    users.push({ name: name.value, email: normalizedEmail, role: role.value, password: password.value });
    localStorage.setItem("smartWaterUsers", JSON.stringify(users));
    showMessage("msg", "success", "Registration successful! Redirecting to login...");
    registerForm.reset();
    document.querySelectorAll("#registerForm .is-valid").forEach(x => x.classList.remove("is-valid"));
    setTimeout(() => { window.location.href = "login.html"; }, 800);
  });
}

// Login validation
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");

    const validEmail = validateEmail(email);
    const validPassword = validatePassword(password);

    if (!validEmail || !validPassword) {
      showMessage("loginMsg", "danger", "Please enter valid login details.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("smartWaterUsers") || "[]");
    const user = users.find(u => u.email === email.value.toLowerCase() && u.password === password.value);
    if (!user) {
      showMessage("loginMsg", "danger", "Invalid email or password. Please register first or check your details.");
      return;
    }
    sessionStorage.setItem("smartWaterCurrentUser", JSON.stringify({ name: user.name, email: user.email, role: user.role, loggedInAt: new Date().toISOString() }));
    showMessage("loginMsg", "success", `Welcome, ${user.name}! Login successful. Redirecting...`);
    setTimeout(() => { window.location.href = "index.html"; }, 800);
  });
}

// Monitoring station catalog: validate, save, and display newly added stations.
const stationForm = document.getElementById("stationForm");
if (stationForm) {
  const stationList = document.getElementById("stationList");
  const savedStationsKey = "smartWaterStations";

  function getSavedStations() {
    try { return JSON.parse(localStorage.getItem(savedStationsKey) || "[]"); }
    catch (_) { return []; }
  }

  function renderStation(station) {
    if (!stationList || document.getElementById(`station-card-${station.id}`)) return;
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-xl-4";
    col.id = `station-card-${station.id}`;

    const card = document.createElement("div");
    card.className = "card border-0 shadow-sm h-100";
    const body = document.createElement("div");
    body.className = "card-body p-4";

    const badge = document.createElement("span");
    const isActive = station.status === "ACTIVE";
    badge.className = `badge ${isActive ? "text-bg-success" : "text-bg-secondary"} mb-3`;
    badge.textContent = station.status;

    const heading = document.createElement("h2");
    heading.className = "h4";
    heading.textContent = `${station.id} — ${station.name}`;

    const location = document.createElement("p");
    location.className = "text-secondary";
    location.textContent = `📍 ${station.name}`;

    const readings = document.createElement("div");
    readings.className = "row g-2 mt-3";
    [
      ["pH", station.ph],
      ["TDS", station.tds],
      ["Temp", `${station.temperature}°C`]
    ].forEach(([label, value]) => {
      const cell = document.createElement("div");
      cell.className = "col-4";
      const reading = document.createElement("div");
      reading.className = "reading";
      reading.append(document.createTextNode(`${label} `));
      const strong = document.createElement("strong");
      strong.textContent = value;
      reading.appendChild(strong);
      cell.appendChild(reading);
      readings.appendChild(cell);
    });

    body.append(badge, heading, location, readings);
    card.appendChild(body);
    col.appendChild(card);
    stationList.appendChild(col);
  }

  // Show stations previously saved in this browser.
  getSavedStations().forEach(renderStation);

  stationForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("stationId");
    const name = document.getElementById("stationName");
    const ph = document.getElementById("ph");
    const tds = document.getElementById("tds");
    const temp = document.getElementById("temperature");
    const status = document.getElementById("stationStatus");

    let valid = stationIdPattern.test(id.value.trim());
    if (!valid) markInvalid(id, "Station ID must use the format ST-001.");
    else markValid(id);

    valid = requiredText(name, "Station name", 3, 60) && valid;
    valid = validateNumber(ph, "pH", 0, 14) && valid;
    valid = validateNumber(tds, "TDS", 0, 5000) && valid;
    valid = validateNumber(temp, "Temperature", -50, 100) && valid;
    valid = validateSelect(status, "a station status") && valid;

    if (!valid) {
      showMessage("stationMsg", "danger", "Station data is invalid. Please correct the highlighted fields.");
      return;
    }

    const station = {
      id: id.value.trim().toUpperCase(),
      name: clean(name.value),
      ph: Number(ph.value),
      tds: Number(tds.value),
      temperature: Number(temp.value),
      status: status.value
    };

    const saved = getSavedStations();
    const duplicate = saved.some(item => item.id.toUpperCase() === station.id) ||
      Array.from(stationList.querySelectorAll("h2")).some(h => h.textContent.trim().startsWith(`${station.id} —`));
    if (duplicate) {
      markInvalid(id, "This station ID already exists. Please use a different ID.");
      showMessage("stationMsg", "danger", "A station with this ID already exists.");
      return;
    }

    saved.push(station);
    localStorage.setItem(savedStationsKey, JSON.stringify(saved));
    renderStation(station);
    showMessage("stationMsg", "success", `Station ${station.id} added and displayed successfully.`);
    stationForm.reset();
    stationForm.querySelectorAll(".is-valid, .is-invalid").forEach(input => input.classList.remove("is-valid", "is-invalid"));
  });
}

// Alert management: create, display, persist, and resolve alerts in localStorage.
const alertForm = document.getElementById("alertForm");
if (alertForm) {
  const alertList = document.getElementById("alertList");
  const savedAlertsKey = "smartWaterAlerts";
  function getSavedAlerts() {
    try { const data = JSON.parse(localStorage.getItem(savedAlertsKey) || "[]"); return Array.isArray(data) ? data : []; }
    catch (_) { return []; }
  }
  function saveAlerts(items) { localStorage.setItem(savedAlertsKey, JSON.stringify(items)); }
  function alertCard(alert) {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-xl-4";
    col.dataset.alertId = alert.id;
    const article = document.createElement("article");
    article.className = `card border-0 shadow-sm h-100 alert-card ${String(alert.severity).toLowerCase()}`;
    const body = document.createElement("div"); body.className = "card-body p-4";
    const badge = document.createElement("span");
    badge.className = `badge status-label ${alert.resolved ? "text-bg-success" : alert.severity === "HIGH" ? "text-bg-danger" : alert.severity === "MEDIUM" ? "text-bg-warning" : "text-bg-info"}`;
    badge.textContent = `${alert.resolved ? "✓" : alert.severity === "HIGH" ? "🚨" : alert.severity === "MEDIUM" ? "⚠" : "ℹ"} ${alert.severity} — ${alert.resolved ? "RESOLVED" : "OPEN"}`;
    const title = document.createElement("h2"); title.className = "h4 mt-3"; title.textContent = alert.message.length > 55 ? alert.message.slice(0, 52) + "..." : alert.message;
    const station = document.createElement("p"); station.className = "fw-semibold mb-1"; station.textContent = `Station ${alert.stationId}`;
    const description = document.createElement("p"); description.className = "text-secondary"; description.textContent = alert.message;
    const button = document.createElement("button"); button.type = "button";
    button.className = alert.resolved ? "btn btn-success" : alert.severity === "HIGH" ? "btn btn-danger" : "btn btn-warning";
    button.textContent = alert.resolved ? "Resolved" : "Mark Resolved"; button.disabled = !!alert.resolved;
    button.addEventListener("click", () => resolveAlert(alert.id));
    body.append(badge, title, station, description, button); article.appendChild(body); col.appendChild(article); return col;
  }
  function renderSavedAlerts() {
    if (!alertList) return;
    alertList.querySelectorAll("[data-created-alert='true']").forEach(node => node.remove());
    getSavedAlerts().filter(alert => !String(alert.id).startsWith("sample-alert-")).forEach(alert => {
      const col = alertCard(alert); col.dataset.createdAlert = "true"; alertList.appendChild(col);
    });
  }
  function resolveAlert(id) {
    const items = getSavedAlerts(); const item = items.find(a => a.id === id);
    if (item) { item.resolved = true; saveAlerts(items); renderSavedAlerts(); }
  }
  // Give the three sample alerts stable IDs and persist their resolved state too.
  if (alertList) {
    const samples = Array.from(alertList.children).filter(el => !el.dataset.createdAlert);
    samples.forEach((col, index) => {
      const id = `sample-alert-${index + 1}`; col.dataset.alertId = id;
      const btn = col.querySelector("button");
      if (btn && !btn.dataset.persistenceBound) {
        btn.dataset.persistenceBound = "true";
        const saved = getSavedAlerts().find(a => a.id === id);
        if (saved && saved.resolved) {
          const badge = col.querySelector(".status-label");
          if (badge) { badge.className = "badge text-bg-success status-label"; badge.textContent = "✓ RESOLVED"; }
          btn.textContent = "Resolved"; btn.className = "btn btn-success"; btn.disabled = true;
        }
        btn.addEventListener("click", () => {
          const items = getSavedAlerts();
          const existing = items.find(a => a.id === id);
          if (existing) existing.resolved = true;
          else items.push({ id, stationId: "", severity: ["HIGH", "MEDIUM", "LOW"][index], message: col.querySelector("h2")?.textContent || "Sample alert", resolved: true });
          saveAlerts(items);
        });
      }
    });
  }
  renderSavedAlerts();
  alertForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const station = document.getElementById("alertStation");
    const severity = document.getElementById("severity");
    const message = document.getElementById("alertMessage");
    let valid = stationIdPattern.test(station.value.trim());
    if (!valid) markInvalid(station, "Station ID must use the format ST-001."); else markValid(station);
    valid = validateSelect(severity, "an alert severity") && valid;
    valid = requiredText(message, "Alert message", 10, 250) && valid;
    if (!valid) { showMessage("alertMsg", "danger", "Alert data is invalid. Please correct the highlighted fields."); return; }
    const alert = { id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, stationId: station.value.trim().toUpperCase(), severity: severity.value, message: clean(message.value), resolved: false, createdAt: new Date().toISOString() };
    const items = getSavedAlerts(); items.push(alert); saveAlerts(items);
    renderSavedAlerts();
    showMessage("alertMsg", "success", `Alert for ${alert.stationId} created and displayed successfully.`);
    alertForm.reset(); alertForm.querySelectorAll(".is-valid, .is-invalid").forEach(input => input.classList.remove("is-valid", "is-invalid"));
  });
}

// Keep compatibility with any existing inline resolve(this) buttons.
function resolve(button) {
  const card = button.closest("[data-alert-id]");
  if (card && card.dataset.alertId && typeof localStorage !== "undefined") {
    const id = card.dataset.alertId;
    try {
      const items = JSON.parse(localStorage.getItem("smartWaterAlerts") || "[]");
      const item = items.find(a => a.id === id);
      if (item) { item.resolved = true; localStorage.setItem("smartWaterAlerts", JSON.stringify(items)); }
    } catch (_) { /* Keep the visible resolve action usable if storage is unavailable. */ }
  }
  const label = button.closest(".card")?.querySelector(".status-label");
  if (label) { label.className = "badge text-bg-success status-label"; label.textContent = "✓ RESOLVED"; }
  button.textContent = "Resolved"; button.className = "btn btn-success"; button.disabled = true;
}
