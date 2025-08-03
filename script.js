
let currentUser = "";

function login() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();

  if (u === "admin" && p === "admin") {
    currentUser = "admin";
    document.getElementById("login-page").classList.add("hidden");
    document.getElementById("admin-panel").classList.remove("hidden");
    loadUserList();
  } else {
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (users[u] && users[u] === p) {
      currentUser = u;
      document.getElementById("login-page").classList.add("hidden");
      document.getElementById("user-panel").classList.remove("hidden");
    } else {
      alert("Invalid credentials");
    }
  }
}

function logout() {
  currentUser = "";
  document.getElementById("user-panel").classList.add("hidden");
  document.getElementById("admin-panel").classList.add("hidden");
  document.getElementById("login-page").classList.remove("hidden");
}

function addUser() {
  const user = document.getElementById("newUsername").value.trim();
  const pass = document.getElementById("newPassword").value.trim();
  if (!user || !pass) return alert("Enter username and password");
  const existing = JSON.parse(localStorage.getItem("users") || "{}");
  if (existing[user]) return alert("User already exists");
  existing[user] = pass;
  localStorage.setItem("users", JSON.stringify(existing));
  alert("User added");
  loadUserList();
}

function loadUserList() {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const select = document.getElementById("userSelect");
  select.innerHTML = "";
  Object.keys(users).forEach(user => {
    const opt = document.createElement("option");
    opt.value = user;
    opt.textContent = user;
    select.appendChild(opt);
  });
}

function markAttendance() {
  const today = new Date().toISOString().split("T")[0];
  const reports = JSON.parse(localStorage.getItem("reports") || "{}");
  if (!reports[currentUser]) reports[currentUser] = {};
  if (!reports[currentUser][today]) reports[currentUser][today] = {};
  reports[currentUser][today].present = true;
  localStorage.setItem("reports", JSON.stringify(reports));
  alert("Marked Present");
}

function submitReport() {
  const total = +document.getElementById("totalCalls").value;
  const connected = +document.getElementById("connectedCalls").value;
  const confirmed = +document.getElementById("confirmedCalls").value;
  const today = new Date().toISOString().split("T")[0];

  const reports = JSON.parse(localStorage.getItem("reports") || "{}");
  if (!reports[currentUser]) reports[currentUser] = {};
  if (reports[currentUser][today]?.submitted) {
    alert("Report already submitted.");
    return;
  }

  reports[currentUser][today] = {
    present: true,
    total,
    connected,
    confirmed,
    submitted: true
  };
  localStorage.setItem("reports", JSON.stringify(reports));
  alert("Report Submitted");
}

function viewReport() {
  const user = document.getElementById("userSelect").value;
  const date = document.getElementById("reportDate").value;
  const reports = JSON.parse(localStorage.getItem("reports") || "{}");
  const data = reports[user]?.[date];
  const table = document.getElementById("reportTable");
  if (!data) return table.innerHTML = "<tr><td>No data</td></tr>";
  table.innerHTML = `<tr><th>Date</th><th>Present</th><th>Total</th><th>Connected</th><th>Confirmed</th></tr>
    <tr><td>${date}</td><td>${data.present ? "Yes" : "No"}</td><td>${data.total}</td><td>${data.connected}</td><td>${data.confirmed}</td></tr>`;
}

function viewMonthlyReport() {
  const user = document.getElementById("userSelect").value;
  const reports = JSON.parse(localStorage.getItem("reports") || "{}");
  const data = reports[user] || {};
  const table = document.getElementById("reportTable");
  table.innerHTML = `<tr><th>Date</th><th>Present</th><th>Total</th><th>Connected</th><th>Confirmed</th></tr>`;
  Object.keys(data).forEach(date => {
    const r = data[date];
    table.innerHTML += `<tr><td>${date}</td><td>${r.present ? "Yes" : "No"}</td><td>${r.total || 0}</td><td>${r.connected || 0}</td><td>${r.confirmed || 0}</td></tr>`;
  });
}

function viewUserDaily() {
  const today = new Date().toISOString().split("T")[0];
  const reports = JSON.parse(localStorage.getItem("reports") || "{}");
  const data = reports[currentUser]?.[today];
  const table = document.getElementById("userReportTable");
  if (!data) return table.innerHTML = "<tr><td>No data</td></tr>";
  table.innerHTML = `<tr><th>Date</th><th>Present</th><th>Total</th><th>Connected</th><th>Confirmed</th></tr>
    <tr><td>${today}</td><td>${data.present ? "Yes" : "No"}</td><td>${data.total}</td><td>${data.connected}</td><td>${data.confirmed}</td></tr>`;
}

function viewUserMonthly() {
  const reports = JSON.parse(localStorage.getItem("reports") || "{}");
  const data = reports[currentUser] || {};
  const table = document.getElementById("userReportTable");
  table.innerHTML = `<tr><th>Date</th><th>Present</th><th>Total</th><th>Connected</th><th>Confirmed</th></tr>`;
  Object.keys(data).forEach(date => {
    const r = data[date];
    table.innerHTML += `<tr><td>${date}</td><td>${r.present ? "Yes" : "No"}</td><td>${r.total || 0}</td><td>${r.connected || 0}</td><td>${r.confirmed || 0}</td></tr>`;
  });
}

function exportCSV() {
  const user = document.getElementById("userSelect").value;
  const reports = JSON.parse(localStorage.getItem("reports") || "{}");
  const data = reports[user] || {};
  let csv = "Date,Present,Total Calls,Connected Calls,Confirmed Calls\n";
  Object.keys(data).forEach(date => {
    const r = data[date];
    csv += `${date},${r.present ? "Yes" : "No"},${r.total || 0},${r.connected || 0},${r.confirmed || 0}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = user + "_report.csv";
  link.click();
}
