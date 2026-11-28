// Hearth — main.js. The router, the store and every control.
// The store is a copy of the seed data kept in localStorage, so the site
// remembers what the family did with it; "Start over" restores the seed.

const STORE_KEY = "hearth-alvarez-v4";

function freshState() {
  return JSON.parse(JSON.stringify(HEARTH));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.categories && s.txNov && s.goals && s.bills) return s;
    }
  } catch (e) { /* a fresh start is always safe */ }
  return freshState();
}

function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(Store.state)); } catch (e) { /* private mode */ }
}

const Store = {
  state: loadState(),
  month: "Nov",
  selectedRoom: "groceries",
  ledgerQ: "",
  ledgerCat: "all",
  planner: { diningCap: 260, funCap: 320, saveGoal: 1200 }
};

const ROUTES = {
  "": viewHouse,
  "transactions": viewLedger,
  "budgets": viewBudgets,
  "goals": viewGoals,
  "bills": viewBills,
  "reports": viewReports,
  "planner": viewPlanner
};

const TITLES = {
  "": "The House",
  "transactions": "The Ledger",
  "budgets": "Envelopes",
  "goals": "Milestones",
  "bills": "The Calendar",
  "reports": "The Year So Far",
  "planner": "The Plan"
};

function route() {
  const hash = location.hash.replace(/^#\/?/, "").split("?")[0];
  return ROUTES[hash] ? hash : "";
}

function render() {
  const r = route();
  const view = ROUTES[r];
  document.getElementById("view").innerHTML = view(Store);
  document.querySelectorAll("nav a").forEach(function (a) {
    a.classList.toggle("active", a.getAttribute("href") === "#/" + r);
  });
  document.getElementById("month-label").textContent =
    Store.month === "Nov" ? "November 2026" : "October 2026";
  document.querySelectorAll(".month-btn").forEach(function (b) {
    b.classList.toggle("active", b.dataset.month === Store.month);
  });
  bindHousePlan();
}

function bindHousePlan() {
  document.querySelectorAll(".house .room").forEach(function (el) {
    el.addEventListener("click", function () {
      Store.selectedRoom = el.dataset.room;
      render();
      const d = document.getElementById("room-detail");
      if (d) d.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    el.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        Store.selectedRoom = el.dataset.room;
        render();
      }
    });
  });
}

function download(filename, text) {
  const blob = new Blob([text], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 200);
}

function exportCsv() {
  const month = Store.month;
  const rows = sortedTx(Store.state, month);
  let csv = "date,what,room,amount\n";
  rows.forEach(function (t) {
    const c = catById(Store.state, t.cat);
    csv += '"' + t.d + '","' + t.label.replace(/"/g, '""') + '","' + c.room + '",' + t.amount.toFixed(2) + "\n";
  });
  download("alvarez-" + month.toLowerCase() + "-2026.csv", csv);
}

function wire() {
  window.addEventListener("hashchange", render);

  // Month switch + reset, in the header.
  document.querySelectorAll(".month-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      Store.month = b.dataset.month;
      render();
    });
  });
  document.getElementById("reset-btn").addEventListener("click", function () {
    if (window.confirm("Start over? Every change — new lines, paid bills, moved money — goes back to how November began.")) {
      Store.state = freshState();
      Store.selectedRoom = "groceries";
      Store.ledgerQ = "";
      Store.ledgerCat = "all";
      saveState();
      render();
    }
  });

  // One delegated click handler for every button in the views.
  document.getElementById("view").addEventListener("click", function (ev) {
    const el = ev.target.closest("[data-action]");
    const roomBtn = ev.target.closest("[data-room].room-row");
    if (roomBtn) {
      Store.selectedRoom = roomBtn.dataset.room;
      render();
      return;
    }
    const ledgerLink = ev.target.closest("[data-ledger-cat]");
    if (ledgerLink) {
      Store.ledgerCat = ledgerLink.dataset.ledgerCat;
      return; // the hash change renders the ledger
    }
    if (!el) return;
    const action = el.dataset.action;
    if (action === "select-room") {
      Store.selectedRoom = el.dataset.room;
      render();
    } else if (action === "export-csv") {
      exportCsv();
    } else if (action === "del-txn") {
      const key = el.dataset;
      const list = txOfMonth(Store.state, Store.month);
      const i = list.findIndex(function (t) {
        return t.d === key.d && t.label === key.label && String(t.amount) === key.amount;
      });
      if (i !== -1 && window.confirm("Rub out “" + key.label + "” (" + money(parseFloat(key.amount)) + ")?")) {
        list.splice(i, 1);
        saveState();
        render();
      }
    } else if (action === "goal-add") {
      const g = Store.state.goals.find(function (x) { return x.id === el.dataset.goal; });
      if (g) {
        g.saved = Math.min(g.target, g.saved + parseFloat(el.dataset.amount));
        saveState();
        render();
      }
    } else if (action === "bill-paid") {
      const b = Store.state.bills.find(function (x) { return x.id === el.dataset.bill; });
      if (b) {
        b.paid = true;
        saveState();
        render();
      }
    }
  });

  // Ledger search + filter, and the add-a-line form (delegated: the view
  // re-renders, so listen on the container, not the inputs).
  document.getElementById("view").addEventListener("input", function (ev) {
    if (ev.target.id === "ledger-q") {
      Store.ledgerQ = ev.target.value;
      render();
      const q = document.getElementById("ledger-q");
      if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
    } else if (ev.target.id === "cap-dining") {
      Store.planner.diningCap = parseInt(ev.target.value, 10);
      render();
    } else if (ev.target.id === "cap-fun") {
      Store.planner.funCap = parseInt(ev.target.value, 10);
      render();
    } else if (ev.target.id === "save-goal") {
      Store.planner.saveGoal = parseInt(ev.target.value, 10);
      render();
    }
  });
  document.getElementById("view").addEventListener("change", function (ev) {
    if (ev.target.id === "ledger-cat") {
      Store.ledgerCat = ev.target.value;
      render();
    }
  });
  document.getElementById("view").addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (ev.target.id === "add-txn") {
      const day = parseInt(document.getElementById("add-day").value, 10);
      const label = document.getElementById("add-label").value.trim();
      const cat = document.getElementById("add-cat").value;
      const amount = parseFloat(document.getElementById("add-amount").value);
      if (!label || !(amount > 0) || day < 1 || day > 30) return;
      const mon = Store.month === "Oct" ? "Oct" : "Nov";
      txOfMonth(Store.state, Store.month).push({ d: mon + " " + day, cat: cat, label: label, amount: Math.round(amount * 100) / 100 });
      saveState();
      render();
    } else if (ev.target.classList.contains("adjust")) {
      const input = ev.target.querySelector("input");
      const value = parseFloat(input.value);
      const c = catById(Store.state, ev.target.dataset.cat);
      if (c && value >= 0) {
        c.budget = Math.round(value);
        saveState();
        render();
      }
    }
  });
}

wire();
render();
