// Hearth — state, hash routing and every control on the site.
// The seed comes from data.js; the family's edits live in localStorage
// under hearth-state-v1, and every action saves and re-renders, so all
// seven pages always agree with each other.
import { SEED } from './data.js';
import {
  viewDashboard,
  viewTransactions,
  viewBudgets,
  viewGoals,
  viewBills,
  viewReports,
  viewPlanner,
} from './views.js';

const KEY = 'hearth-state-v1';

const ROUTES = {
  '': { fn: viewDashboard, title: 'Dashboard' },
  transactions: { fn: viewTransactions, title: 'Transactions' },
  budgets: { fn: viewBudgets, title: 'Budgets' },
  goals: { fn: viewGoals, title: 'Savings goals' },
  bills: { fn: viewBills, title: 'Bills' },
  reports: { fn: viewReports, title: 'Reports' },
  planner: { fn: viewPlanner, title: 'Budget planner' },
};

function freshState() {
  return {
    month: '2026-11',
    months: JSON.parse(JSON.stringify(SEED.months)),
    limits: Object.fromEntries(SEED.categories.map((c) => [c.id, c.limit])),
    bills: JSON.parse(JSON.stringify(SEED.bills)),
    goals: JSON.parse(JSON.stringify(SEED.goals)),
    planner: { pay: 7240, needs: 50, wants: 30 },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.months && parsed.months['2026-11'] && parsed.months['2026-10']) return parsed;
    }
  } catch (err) {
    // A damaged saved copy falls back to the seed rather than a blank page.
  }
  return freshState();
}

let state = loadState();

// Search and filter are session-only: they shape the ledger view, they are
// not part of the family's saved budget.
const ui = { search: '', filter: '' };
let keepSearchFocus = false;

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    // Private mode can refuse storage; the page still works for the visit.
  }
}

function route() {
  const hash = location.hash.replace(/^#\/?/, '').split('?')[0];
  return ROUTES[hash] ? hash : '';
}

function render() {
  const key = route();
  const page = ROUTES[key];
  const view = document.querySelector('#view');
  view.innerHTML = page.fn(state, SEED, ui);
  document.title = `Hearth — ${page.title} · The Alvarez Family Budget`;
  document.querySelectorAll('.nav a').forEach((a) => {
    const href = a.getAttribute('href');
    a.classList.toggle('on', href === `#/${key}` || (key === '' && href === '#/'));
    a.removeAttribute('aria-current');
    if (a.classList.contains('on')) a.setAttribute('aria-current', 'page');
  });
  const badge = document.querySelector('#bills-badge');
  if (badge) {
    const due = state.bills.filter((b) => !b.paid).length;
    badge.textContent = `${due} due`;
    badge.hidden = due === 0;
  }
  if (keepSearchFocus) {
    const box = document.querySelector('#txn-search');
    if (box) {
      box.focus();
      box.setSelectionRange(box.value.length, box.value.length);
    }
  }
}

function catName(id) {
  const c = SEED.categories.find((x) => x.id === id);
  return c ? c.name : id;
}

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv() {
  const rows = [...state.months[state.month].spend].sort((a, b) => (a.date < b.date ? -1 : 1));
  const lines = [['Date', 'Merchant', 'Note', 'Category', 'Amount']];
  for (const r of rows) lines.push([r.date, r.merchant, r.note, catName(r.category), r.amount.toFixed(2)]);
  const blob = new Blob([lines.map((l) => l.map(csvCell).join(',')).join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hearth-transactions-${state.month}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// The planner updates its numbers in place while a slider is dragged, so
// the slider under the finger is never rebuilt mid-drag.
function refreshPlannerDom() {
  const p = state.planner;
  const savePct = Math.max(0, 100 - p.needs - p.wants);
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const needsLabel = document.querySelector('#needs-label');
  if (needsLabel) needsLabel.textContent = `Needs — ${p.needs}% · ${fmt((p.pay * p.needs) / 100)} a month`;
  const wantsLabel = document.querySelector('#wants-label');
  if (wantsLabel) wantsLabel.textContent = `Wants — ${p.wants}% · ${fmt((p.pay * p.wants) / 100)} a month`;
  const result = document.querySelector('.plan-result');
  if (result) {
    result.innerHTML = `<p><strong>Save — ${savePct}% · ${fmt((p.pay * savePct) / 100)} a month</strong></p>
      <p>Needs and wants together are capped at 95%, so saving never drops below 5%.</p>
      <p class="yearly">At this rate the household saves <b>${fmt(Math.round((p.pay * savePct) / 100) * 12)} a year</b> — ${fmt(Math.round((p.pay * savePct) / 100))} every month, on autopilot.</p>`;
  }
}

function clampPlanner(changed) {
  const p = state.planner;
  if (p.needs + p.wants > 95) {
    if (changed === 'needs') p.wants = 95 - p.needs;
    else p.needs = 95 - p.wants;
  }
  if (p.needs < 0) p.needs = 0;
  if (p.wants < 0) p.wants = 0;
  if (p.needs > 95) p.needs = 95;
  if (p.wants > 95) p.wants = 95;
}

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'switch-month') {
    state.month = el.dataset.month;
    save();
    render();
  }

  if (action === 'delete-txn') {
    const month = state.months[state.month];
    month.spend = month.spend.filter((r) => r.id !== el.dataset.id);
    save();
    render();
  }

  if (action === 'adjust-budget') {
    const cat = SEED.categories.find((c) => c.id === el.dataset.cat);
    if (!cat) return;
    const answer = window.prompt(`New monthly limit for ${cat.name}?`, String(state.limits[cat.id]));
    if (answer === null) return;
    const next = Math.round(Number(answer) * 100) / 100;
    if (Number.isFinite(next) && next > 0) {
      state.limits[cat.id] = next;
      save();
      render();
    }
  }

  if (action === 'goal-add') {
    const goal = state.goals.find((g) => g.id === el.dataset.id);
    if (!goal) return;
    goal.saved = Math.round((goal.saved + Number(el.dataset.amount)) * 100) / 100;
    save();
    render();
  }

  if (action === 'pay-bill' || action === 'unpay-bill') {
    const bill = state.bills.find((b) => b.id === el.dataset.id);
    if (!bill) return;
    bill.paid = action === 'pay-bill';
    save();
    render();
  }

  if (action === 'export-csv') downloadCsv();

  if (action === 'reset-demo') {
    if (window.confirm('Reset everything to the demo data? Your added transactions, budget changes, goal top-ups and paid bills will be replaced.')) {
      state = freshState();
      ui.search = '';
      ui.filter = '';
      save();
      render();
    }
  }
});

document.addEventListener('input', (ev) => {
  const el = ev.target;
  if (el.id === 'txn-search') {
    ui.search = el.value;
    keepSearchFocus = true;
    render();
    return;
  }
  if (el.id === 'planner-pay') {
    const v = Number(el.value);
    if (Number.isFinite(v) && v >= 0) {
      state.planner.pay = Math.round(v);
      save();
      refreshPlannerDom();
    }
    return;
  }
  if (el.id === 'planner-needs') {
    state.planner.needs = Number(el.value);
    clampPlanner('needs');
    const other = document.querySelector('#planner-wants');
    if (other) other.value = String(state.planner.wants);
    save();
    refreshPlannerDom();
    return;
  }
  if (el.id === 'planner-wants') {
    state.planner.wants = Number(el.value);
    clampPlanner('wants');
    const other = document.querySelector('#planner-needs');
    if (other) other.value = String(state.planner.needs);
    save();
    refreshPlannerDom();
  }
});

document.addEventListener('change', (ev) => {
  const el = ev.target;
  if (el.id === 'txn-filter') {
    ui.filter = el.value;
    render();
  }
});

document.addEventListener('submit', (ev) => {
  const form = ev.target;
  if (form.id === 'txn-form') {
    ev.preventDefault();
    const merchant = document.querySelector('#txn-merchant').value.trim();
    const category = document.querySelector('#txn-category').value;
    const amount = Math.round(Number(document.querySelector('#txn-amount').value) * 100) / 100;
    const date = document.querySelector('#txn-date').value;
    if (!merchant || !Number.isFinite(amount) || amount <= 0 || !date) return;
    const key = date.slice(0, 7);
    const row = {
      id: `u${Date.now()}`,
      date,
      merchant,
      note: 'Added by the family',
      category,
      amount,
    };
    if (state.months[key]) {
      state.months[key].spend.push(row);
      state.month = key;
    } else {
      state.months[state.month].spend.push(row);
    }
    save();
    render();
    const note = document.querySelector('.txn-form .hint');
    if (note) note.textContent = `${merchant} — $${amount.toFixed(2)} added. Dashboard, budgets and reports already include it.`;
  }
  if (form.id === 'planner-form') ev.preventDefault();
});

window.addEventListener('hashchange', () => {
  keepSearchFocus = false;
  render();
});

render();
