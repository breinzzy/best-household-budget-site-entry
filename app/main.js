// Hearth main — one job: state, routing and wiring the controls.
// State lives in localStorage (seeded from data.js); every action saves and
// re-renders, so the dashboard, budgets, goals, bills and reports always agree.
import { FAMILY, MONTHS, MONTH_ORDER, BILLS, GOALS, BUDGET_LIMITS } from './data.js';
import { dashboardView, transactionsView, budgetsView, goalsView, billsView, reportsView, plannerView } from './views.js';
import { money } from './charts.js';

const KEY = 'hearth-state-v1';
const ROUTES = {
  '/': dashboardView, '/transactions': transactionsView, '/budgets': budgetsView,
  '/goals': goalsView, '/bills': billsView, '/reports': reportsView, '/planner': plannerView,
};
const NAV = [
  ['/', 'Dashboard'], ['/transactions', 'Transactions'], ['/budgets', 'Budgets'],
  ['/goals', 'Goals'], ['/bills', 'Bills'], ['/reports', 'Reports'], ['/planner', 'Planner'],
];

function seed() {
  const txns = {};
  for (const m of MONTH_ORDER) txns[m] = MONTHS[m].txns.map((x) => ({ ...x }));
  return {
    month: '2026-11', txns,
    bills: BILLS.map((b) => ({ ...b })),
    goals: GOALS.map((g) => ({ ...g })),
    limits: { ...BUDGET_LIMITS },
    planner: { income: 7240, needs: 50, wants: 30 },
    filter: { cat: 'all', q: '' },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const s = JSON.parse(raw);
    if (!s.txns || !s.txns['2026-11']) return seed();
    return { ...seed(), ...s, filter: { cat: 'all', q: '' } };
  } catch { return seed(); }
}

let state = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } }
function monthLabel() { return MONTHS[state.month].label; }
function viewState() {
  return { ...state, monthLabel: monthLabel(), daysLeft: MONTHS[state.month].daysLeft };
}

let flash = '';
function render() {
  const hash = location.hash || '#/';
  const path = hash.slice(1).split('?')[0] || '/';
  const view = ROUTES[path] || dashboardView;
  const active = ROUTES[path] ? path : '/';
  const dueCount = state.bills.filter((b) => !b.paid).length;
  document.querySelector('#nav').innerHTML = NAV.map(([p, label]) =>
    `<a href="#${p}" class="${p === active ? 'active' : ''}">${label}${p === '/bills' ? ` <span class="n-badge">${dueCount} due</span>` : ''}</a>`).join('');
  document.querySelector('#view').innerHTML = (flash ? `<div class="flash">${flash}</div>` : '') + view(viewState());
  flash = '';
  document.title = `Hearth — ${FAMILY.name} · ${NAV.find(([p]) => p === active)?.[1] || 'Dashboard'}`;
}

function rerender(msg) { if (msg) flash = msg; save(); render(); }

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const a = el.dataset.action;
  if (a === 'month') { state.month = el.dataset.month; rerender(); }
  if (a === 'delete-txn') {
    const id = el.dataset.id;
    state.txns[state.month] = state.txns[state.month].filter((x) => x.id !== id);
    rerender('Transaction deleted — totals updated everywhere.');
  }
  if (a === 'adjust-budget') {
    const cat = el.dataset.cat;
    const cur = state.limits[cat];
    const next = window.prompt(`Monthly limit for this category (current $${cur}):`, String(cur));
    if (next !== null) {
      const v = Math.max(0, Math.round(Number(next) || 0));
      if (v > 0) { state.limits[cat] = v; rerender(`Budget updated to $${v.toLocaleString('en-US')} a month.`); }
    }
  }
  if (a === 'goal-add') {
    const g = state.goals.find((x) => x.id === el.dataset.id);
    if (g) { g.saved += Number(el.dataset.amt); rerender(`Added $${el.dataset.amt} to “${g.name}” — now at ${money(g.saved)}.`); }
  }
  if (a === 'pay-bill') {
    const b = state.bills.find((x) => x.id === el.dataset.id);
    if (b) { b.paid = true; rerender(`“${b.name}” marked paid.`); }
  }
  if (a === 'export-csv') {
    const rows = [['date', 'merchant', 'category', 'kind', 'amount', 'note'],
      ...state.txns[state.month].map((x) => [x.date, x.merchant, x.category, x.kind, x.amount.toFixed(2), x.note || ''])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url; link.download = `hearth-transactions-${state.month}.csv`; link.click();
    URL.revokeObjectURL(url);
    flash = 'CSV downloaded.';
    render();
  }
  if (a === 'reset-demo') {
    if (window.confirm('Reset everything to the original November demo data?')) {
      const keep = state.month; state = seed(); state.month = keep; rerender('Demo data reset.');
    }
  }
});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-input]');
  if (!el) return;
  const k = el.dataset.input;
  if (k === 'search') { state.filter.q = el.value; }
  if (k === 'cat-filter') { state.filter.cat = el.value; rerender(); return; }
  if (k === 'plan-income') { state.planner.income = Math.max(0, Number(el.value) || 0); save(); render(); return; }
  if (k === 'plan-needs') {
    state.planner.needs = Number(el.value);
    if (state.planner.needs + state.planner.wants > 95) state.planner.wants = 95 - state.planner.needs;
    save(); render(); return;
  }
  if (k === 'plan-wants') {
    state.planner.wants = Number(el.value);
    if (state.planner.needs + state.planner.wants > 95) state.planner.needs = 95 - state.planner.wants;
    save(); render(); return;
  }
  if (k === 'search') {
    // Live search without losing focus: re-render only the table body is complex,
    // so re-render and restore focus to the search box.
    const pos = el.selectionStart;
    save(); render();
    const box = document.querySelector('[data-input="search"]');
    if (box) { box.focus(); box.setSelectionRange(pos, pos); }
  }
});

document.addEventListener('submit', (e) => {
  const form = e.target.closest('[data-form="add-txn"]');
  if (!form) return;
  e.preventDefault();
  const data = new FormData(form);
  const amount = Number(data.get('amount'));
  if (!amount || amount <= 0) return;
  const merchant = String(data.get('merchant') || '').trim();
  if (!merchant) return;
  state.txns[state.month].push({
    id: `user-${Date.now()}`, date: String(data.get('date') || '2026-11-26'),
    merchant, category: String(data.get('category')), amount, note: 'Added by you', kind: 'spend',
  });
  rerender(`Added “${merchant}” — ${money(amount)}. Dashboard, budgets and reports updated.`);
});

window.addEventListener('hashchange', render);
render();
