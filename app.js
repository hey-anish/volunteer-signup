const APPS_SCRIPT_WEB_APP_URL =
"https://script.google.com/macros/s/AKfycbwOwUf7sFVVY54waAkfj0-8N_nI9Igdwkw_1Dl4mAig5Pq0MbW9kNvfLYOlzsBAPgN07w/exec";

let EVENTS = [];

const eventSelect = document.getElementById("eventId");
const judgeEventSelect = document.getElementById("judgeEventId");

const eventsList = document.getElementById("eventsList");
const form = document.getElementById("volunteerForm");
const statusDiv = document.getElementById("formStatus");

const totalParentsEl = document.getElementById("totalParents");
const totalKidsEl = document.getElementById("totalKids");
const totalJudgesEl = document.getElementById("totalJudges");
const eventsCoveredEl = document.getElementById("eventsCovered");
const summaryTableBody = document.getElementById("summaryTableBody");

const judgeTotalVolunteersEl = document.getElementById("judgeTotalVolunteers");
const judgeTotalKidsEl = document.getElementById("judgeTotalKids");
const judgeListTableBody = document.getElementById("judgeListTableBody");

const redlistTotalRowsEl = document.getElementById("redlistTotalRows");
const redlistZeroCountEl = document.getElementById("redlistZeroCount");
const redListTableBody = document.getElementById("redListTableBody");

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (!isNaN(dt.getTime())) {
    return dt.toLocaleDateString();
  }
  return d;
}

function loadEvents() {
  if (!eventSelect || !judgeEventSelect) return;

  eventSelect.innerHTML = "<option value=''>Select Event</option>";
  judgeEventSelect.innerHTML = "<option value=''>Select Event</option>";
  eventsList.innerHTML = "";

  const openEvents = EVENTS.filter(e =>
    String(e.status || "").trim().toUpperCase() === "OPEN"
  );

  openEvents.forEach(e => {
    const signupOpt = document.createElement("option");
    signupOpt.value = String(e.id);
    signupOpt.textContent = (e.name || "") + " - " + formatDate(e.date);
    signupOpt.dataset.name = e.name || "";
    signupOpt.dataset.date = e.date || "";
    signupOpt.dataset.location = e.location || "";
    eventSelect.appendChild(signupOpt);

    const div = document.createElement("div");
    div.className = "event-box";
    div.innerHTML =
      "<b>" + (e.name || "") + "</b><br>" +
      "Date: " + formatDate(e.date) + "<br>" +
      "Location: " + (e.location || "");
    eventsList.appendChild(div);
  });

  EVENTS.forEach(e => {
    const judgeOpt = document.createElement("option");
    judgeOpt.value = String(e.id);
    judgeOpt.textContent = (e.name || "") + " - " + formatDate(e.date);
    judgeOpt.dataset.name = e.name || "";
    judgeOpt.dataset.date = e.date || "";
    judgeOpt.dataset.location = e.location || "";
    judgeEventSelect.appendChild(judgeOpt);
  });
}

async function loadEventsFromBackend() {
  try {
    const r = await fetch(APPS_SCRIPT_WEB_APP_URL + "?action=getEvents");
    const data = await r.json();

    if (!data.success) {
      throw new Error(data.message || "Could not load events");
    }

    EVENTS = data.events || [];
    loadEvents();
  } catch (err) {
    console.error("Error loading events:", err);
    statusDiv.textContent = "Could not load events.";
  }
}

async function loadDashboard() {
  try {
    const r = await fetch(APPS_SCRIPT_WEB_APP_URL + "?action=getSummary");
    const data = await r.json();

    totalParentsEl.textContent = data.totalParents || 0;
    totalKidsEl.textContent = data.totalKids || 0;
    totalJudgesEl.textContent = data.totalJudges || 0;
    eventsCoveredEl.textContent = data.eventsCovered || 0;

    summaryTableBody.innerHTML = "";

    const rows = data.events || [];
    if (!rows.length) {
      summaryTableBody.innerHTML =
        "<tr><td colspan='5'>No volunteer data yet.</td></tr>";
      return;
    }

    rows.forEach(e => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + (e.eventName || "") + "</td>" +
        "<td>" + formatDate(e.eventDate) + "</td>" +
        "<td>" + (e.parentCount || 0) + "</td>" +
        "<td>" + (e.kidCount || 0) + "</td>" +
        "<td>" + (e.judgeCount || 0) + "</td>";
      summaryTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
  }
}

async function loadJudgeList(eventId) {
  try {
    if (!eventId) {
      judgeTotalVolunteersEl.textContent = "0";
      judgeTotalKidsEl.textContent = "0";
      judgeListTableBody.innerHTML =
        "<tr><td colspan='5'>Select an event to view volunteers.</td></tr>";
      return;
    }

    const r = await fetch(
      APPS_SCRIPT_WEB_APP_URL +
      "?action=getJudgeList&eventId=" +
      encodeURIComponent(eventId)
    );

    const data = await r.json();

    judgeTotalVolunteersEl.textContent = data.totalVolunteers || 0;
    judgeTotalKidsEl.textContent = data.totalKids || 0;
    judgeListTableBody.innerHTML = "";

    const rows = data.rows || [];
    if (!rows.length) {
      judgeListTableBody.innerHTML =
        "<tr><td colspan='5'>No volunteers found for this event.</td></tr>";
      return;
    }

    rows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + (row.parentName || "") + "</td>" +
        "<td>" + (row.kidName || "") + "</td>" +
        "<td>" + (row.volunteerRole || "") + "</td>" +
        "<td>" + (row.email || "") + "</td>" +
        "<td>" + (row.phone || "") + "</td>";
      judgeListTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading judge list:", err);
    judgeListTableBody.innerHTML =
      "<tr><td colspan='5'>Could not load judge list.</td></tr>";
  }
}

async function loadRedList() {
  try {
    const r = await fetch(APPS_SCRIPT_WEB_APP_URL + "?action=getRedList");
    const data = await r.json();

    redlistTotalRowsEl.textContent = data.totalRows || 0;
    redlistZeroCountEl.textContent = data.zeroEventCount || 0;
    redListTableBody.innerHTML = "";

    const rows = data.rows || [];
    if (!rows.length) {
      redListTableBody.innerHTML =
        "<tr><td colspan='3'>No rows found in allvolunteers sheet.</td></tr>";
      return;
    }

    rows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + (row.parentName || "") + "</td>" +
        "<td>" + (row.kidName || "") + "</td>" +
        "<td>" + (row.eventsJudged || 0) + "</td>";
      redListTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading redlist:", err);
    redListTableBody.innerHTML =
      "<tr><td colspan='3'>Could not load redlist.</td></tr>";
  }
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const selectedIndex = eventSelect.selectedIndex;
  const opt = eventSelect.options[selectedIndex];

  if (!eventSelect.value || !opt) {
    statusDiv.textContent = "Please select an event.";
    return;
  }

  const payload = {
    eventId: eventSelect.value,
    eventName: opt.dataset.name || "",
    eventDate: opt.dataset.date || "",
    parentName: document.getElementById("parentName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    kidName: document.getElementById("kidName").value.trim(),
    volunteerRole: document.getElementById("volunteerRole").value,
    notes: document.getElementById("notes").value.trim()
  };

  if (!payload.parentName || !payload.email || !payload.phone) {
    statusDiv.textContent = "Please fill all required fields.";
    return;
  }

  try {
    statusDiv.textContent = "Submitting...";

    const r = await fetch(APPS_SCRIPT_WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });

    const res = await r.json();

    if (res.success) {
      statusDiv.textContent = "Signup successful";
      form.reset();
      loadDashboard();
      loadRedList();

      if (judgeEventSelect.value) {
        loadJudgeList(judgeEventSelect.value);
      }
    } else {
      statusDiv.textContent = "Submission failed";
    }
  } catch (err) {
    console.error("Submit error:", err);
    statusDiv.textContent = "Submission failed";
  }
});

judgeEventSelect.addEventListener("change", () => {
  loadJudgeList(judgeEventSelect.value);
});

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");

    if (btn.dataset.tab === "judgeList" && !judgeEventSelect.value) {
      judgeListTableBody.innerHTML =
        "<tr><td colspan='5'>Select an event to view volunteers.</td></tr>";
    }

    if (btn.dataset.tab === "redList") {
      loadRedList();
    }
  };
});

loadEventsFromBackend();
loadDashboard();
loadJudgeList("");
loadRedList();
