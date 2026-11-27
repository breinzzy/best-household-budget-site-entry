// Hearth's shell: hash routing, the household's own changes kept in localStorage,
// and every control on every page. The seed data never changes — the state holds
// only what the family did (added rows, deleted rows, adjusted limits, goal
// top-ups, paid bills, planner sliders), so Reset demo data restores the seed.
//
//   #/                Dashboard
//   #/transactions    the ledger, with the add form
//   #/budgets         monthly limits
//   #/goals           saving goals
//   #/bills           December's bills
//   #/reports          five months of reports
//   #/planner          what-if sliders
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { BILLS, CATEGORIES, GOALS, TREND } from './data.js';
import { drawDonut, drawGroupedBars, drawTrendBars } from './charts.js';
import {
  catById,
  goalSaved,
  round2,
  rowsFor,
  totalsFor,
  viewBills,
  viewBudgets,
  viewDashboard,
  viewGoals,
  viewPlanner,
  viewReports,
  viewTransactions,
} from './views.js';

const KEY = 'hearth-v3';

function defaultState() {
  return {
    month: '2026-11',
    added: [],
    deleted: [],
    limits: {},
    goals: {},
    paid: [],
    planner: { pay: 7240, extra: 0, dining: 260, groceries: 850 },
    ui: { search: '', filter: '', editingBudget: null },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    return { ...defaultState(), ...s, ui: { ...defaultState().ui, ...(s.ui || {}) }, planner: { ...defaultState().planner, ...(s.planner || {}) } };
  } catch {
    return defaultState();
  }
}

let state = loadState();
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode or a full store: the site still works for the session.
  }
}

const app = document.getElementById('app');
const billsBadge = document.getElementById('bills-badge');

function drawCharts() {
  const donut = document.getElementById('donut');
  if (donut) {
    const t = totalsFor(state, state.month);
    const segments = CATEGORIES.map((c) => ({ color: c.color, value: t.byCat[c.id] || 0 }));
    drawDonut(donut, segments, '$' + Math.floor(t.spent).toLocaleString('en-US'), 'spent');
  }
  const trend = document.getElementById('trend-bars');
  if (trend) {
    drawTrendBars(
      trend,
      TREND.map((m) => m.month.slice(0, 3)),
      TREND.map((m) => m.total),
      TREND.length - 1,
    );
  }
  const grouped = document.getElementById('grouped-bars');
  if (grouped) {
    drawGroupedBars(
      grouped,
      TREND.map((m) => m.month.replace(' 2026', '')),
      CATEGORIES,
      TREND.map((m) => CATEGORIES.map((c) => m.byCategory[c.id])),
    );
  }
}

const ROUTES = {
  '/': { title: 'Dashboard', view: viewDashboard },
  '/transactions': { title: 'Transactions', view: viewTransactions },
  '/budgets': { title: 'Budgets', view: viewBudgets },
  '/goals': { title: 'Goals', view: viewGoals },
  '/bills': { title: 'Bills', view: viewBills },
  '/reports': { title: 'Reports', view: viewReports },
  '/planner': { title: 'Planner', view: viewPlanner },
};

function render() {
  window.__shotReady = false;
  const path = location.hash.replace(/^#/, '') || '/';
  const route = ROUTES[path] || ROUTES['/'];
  document.title = `${route.title} | Hearth — Household Budget`;
  document.querySelectorAll('nav a').forEach((a) => {
    a.classList.toggle('on', a.getAttribute('href') === `#${path}`);
  });
  app.innerHTML = route.view(state);
  const due = BILLS.filter((b) => !state.paid.includes(b.id)).length;
  if (billsBadge) billsBadge.textContent = due ? `${due} due` : 'all paid';
  drawCharts();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function downloadCsv() {
  const rows = rowsFor(state, state.month).sort((a, b) => (a.date < b.date ? 1 : -1));
  const lines = ['date,merchant,note,category,amount'];
  for (const r of rows) {
    const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
    lines.push([r.date, q(r.merchant), q(r.note), catById(r.category).name, r.amount.toFixed(2)].join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `hearth-${state.month}-transactions.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function addTransaction(form) {
  const merchant = form.merchant.value.trim();
  const category = form.category.value;
  const amount = Number(form.amount.value);
  const date = form.date.value;
  if (!merchant || !category || !(amount > 0) || !date) return;
  state.added.push({
    id: `u-${Date.now()}`,
    month: state.month,
    date,
    merchant,
    note: 'Added by the family',
    category,
    amount: round2(amount),
  });
  save();
  render();
}

document.addEventListener('submit', (event) => {
  if (event.target.id === 'txn-form') {
    event.preventDefault();
    addTransaction(event.target);
  }
});

document.addEventListener('input', (event) => {
  const el = event.target;
  if (el.id === 'txn-search') {
    state.ui.search = el.value;
    const pos = el.selectionStart;
    render();
    const again = document.getElementById('txn-search');
    if (again) {
      again.focus();
      again.setSelectionRange(pos, pos);
    }
  }
  if (el.id === 'txn-filter') {
    state.ui.filter = el.value;
    render();
  }
  if (el.dataset && el.dataset.plan) {
    state.planner[el.dataset.plan] = Number(el.value);
    save();
    render();
  }
});

document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'switch-month') {
    state.month = el.dataset.month;
    save();
    render();
  } else if (action === 'delete-txn') {
    state.deleted.push(el.dataset.id);
    state.added = state.added.filter((r) => r.id !== el.dataset.id);
    save();
    render();
  } else if (action === 'export-csv') {
    downloadCsv();
  } else if (action === 'reset-demo') {
    localStorage.removeItem(KEY);
    state = defaultState();
    render();
  } else if (action === 'adjust-budget') {
    state.ui.editingBudget = el.dataset.cat;
    render();
    const input = document.getElementById('adjust-input');
    if (input) {
      input.focus();
      input.select();
    }
  } else if (action === 'cancel-budget') {
    state.ui.editingBudget = null;
    render();
  } else if (action === 'save-budget') {
    const input = document.getElementById('adjust-input');
    const value = Number(input?.value);
    if (value > 0) {
      state.limits[el.dataset.cat] = Math.round(value);
      save();
    }
    state.ui.editingBudget = null;
    render();
  } else if (action === 'goal-add') {
    const id = el.dataset.id;
    const amount = Number(el.dataset.amount);
    const goal = GOALS.find((g) => g.id === id);
    if (goal && amount > 0) {
      state.goals[id] = round2(goalSaved(state, goal) + amount);
      save();
      render();
    }
  } else if (action === 'pay-bill') {
    if (!state.paid.includes(el.dataset.id)) state.paid.push(el.dataset.id);
    save();
    render();
  } else if (action === 'unpay-bill') {
    state.paid = state.paid.filter((id) => id !== el.dataset.id);
    save();
    render();
  } else if (action === 'apply-plan') {
    state.limits.dining = state.planner.dining;
    state.limits.groceries = state.planner.groceries;
    save();
    location.hash = '#/budgets';
    render();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target.id === 'adjust-input') {
    event.preventDefault();
    document.querySelector('[data-action="save-budget"]')?.click();
  }
});

window.addEventListener('hashchange', render);
render();
