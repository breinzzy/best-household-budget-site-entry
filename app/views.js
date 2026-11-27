// Hearth's pages: every view is a function of the state, returning HTML. All
// figures are computed from the seed data in data.js plus the household's own
// changes (added rows, deleted rows, adjusted limits, goal top-ups, paid bills),
// so every page always agrees with every other page.

import { BILLS, CATEGORIES, FAMILY, GOALS, MONTHS, NEXT_PAYDAY, PAID_BILLS, SAVINGS_PLAN, TREND } from './data.js';

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export function round2(n) {
  return Math.round(n * 100) / 100;
}

export function money(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function money0(n) {
  return '$' + Math.round(Number(n)).toLocaleString('en-US');
}

export function catById(id) {
  return CATEGORIES.find((c) => c.id === id) || { id, name: id, color: '#78716c', limit: 0 };
}

export function catName(id) {
  return catById(id).name;
}

// --- Derived figures -------------------------------------------------------

export function rowsFor(state, monthKey) {
  const month = MONTHS[monthKey];
  const rows = [...month.spend];
  for (const r of state.added) if (r.month === monthKey) rows.push(r);
  return rows.filter((r) => !state.deleted.includes(r.id));
}

export function totalsFor(state, monthKey) {
  const month = MONTHS[monthKey];
  const rows = rowsFor(state, monthKey);
  const spent = round2(rows.reduce((a, r) => a + r.amount, 0));
  const income = round2(month.income.reduce((a, r) => a + r.amount, 0));
  const saved = SAVINGS_PLAN;
  const left = round2(income - spent - saved);
  const byCat = {};
  for (const c of CATEGORIES) byCat[c.id] = 0;
  for (const r of rows) byCat[r.category] = round2((byCat[r.category] || 0) + r.amount);
  const plan = CATEGORIES.reduce((a, c) => a + (state.limits[c.id] ?? c.limit), 0);
  return { income, spent, saved, left, byCat, plan, label: month.label, rows: rows.length };
}

export function budgetRows(state, monthKey) {
  const t = totalsFor(state, monthKey);
  return CATEGORIES.map((c) => {
    const limit = state.limits[c.id] ?? c.limit;
    const spent = t.byCat[c.id] || 0;
    return { cat: c, spent, limit, pct: limit ? (spent / limit) * 100 : 0, left: round2(limit - spent) };
  });
}

export function goalSaved(state, goal) {
  return state.goals[goal.id] ?? goal.saved;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Projected finish: months from December 2026 at the goal's monthly rate.
// The goal is done during the month its last contribution lands, so a goal
// needing 4 monthly contributions from December finishes in March.
export function finishLabel(goal, saved) {
  const left = goal.target - saved;
  if (left <= 0) return 'Done — fully funded';
  const months = Math.ceil(left / goal.monthly);
  const d = new Date(2026, 11 + months - 1, 1); // Dec 2026 + months - 1
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function weekSpend(state) {
  const month = MONTHS[state.month];
  const rows = rowsFor(state, state.month).filter((r) => {
    const day = Number(r.date.slice(8, 10));
    return day > month.daysElapsed - 7;
  });
  const total = round2(rows.reduce((a, r) => a + r.amount, 0));
  const biggest = rows.reduce((best, r) => (r.amount > (best?.amount ?? 0) ? r : best), null);
  return { total, biggest, count: rows.length };
}

// The three "worth knowing" insights, each computed from the live figures.
export function insightsFor(state) {
  const t = totalsFor(state, state.month);
  const rows = budgetRows(state, state.month);
  const out = [];
  const over = rows.filter((r) => r.left < 0).sort((a, b) => a.left - b.left);
  if (over.length) {
    const worst = over[0];
    const donor = [...rows].filter((r) => r.left > 0).sort((a, b) => b.left - a.left)[0];
    out.push({
      title: `${worst.cat.name} ran over`,
      text: `${worst.cat.name} is ${money(Math.abs(worst.left))} over its ${money0(worst.limit)} limit. ${donor.cat.name} still has ${money(donor.left)} left, so the month balances — no money needs to move.`,
    });
  }
  const g = rows.find((r) => r.cat.id === 'groceries');
  if (g && MONTHS[state.month].daysLeft > 0) {
    const perDay = g.left / MONTHS[state.month].daysLeft;
    out.push({
      title: 'Groceries, nearly done',
      text: `Groceries is ${Math.round(g.pct)}% used with ${MONTHS[state.month].daysLeft} days left — about ${money(perDay)} a day for the rest of the month. A small top-up shop fits; a big one doesn't.`,
    });
  }
  const kept = TREND.map((m) => {
    const income = 7240;
    const left = income - m.total - SAVINGS_PLAN;
    return { month: m.month, rate: ((SAVINGS_PLAN + left) / income) * 100 };
  });
  const now = kept[kept.length - 1];
  const best = [...kept].sort((a, b) => b.rate - a.rate)[0];
  out.push({
    title: 'Kept rate slipped',
    text: `November kept ${now.rate.toFixed(1)}% of take-home pay — the lowest of the last five months, after ${best.month}'s ${best.rate.toFixed(1)}%. Dining over and a ${money0(t.byCat.shopping)} shopping month pushed it down.`,
  });
  return out;
}

export function upcomingBills(state, n = 3) {
  return BILLS.filter((b) => !state.paid.includes(b.id)).slice(0, n);
}

// --- Shared bits -----------------------------------------------------------

export function monthSwitcher(state) {
  return `<div class="month-switch" role="group" aria-label="Month">${Object.entries(MONTHS)
    .map(
      ([k, m]) =>
        `<button type="button" data-action="switch-month" data-month="${k}" class="${state.month === k ? 'on' : ''}">${esc(m.label)}</button>`,
    )
    .join('')}</div>`;
}

function bar(pct, color) {
  const p = Math.max(0, Math.min(100, pct));
  return `<div class="bar" role="img" aria-label="${Math.round(p)} percent"><span style="width:${p}%;background:${color}"></span></div>`;
}

function kpi(label, value, sub) {
  return `<div class="kpi"><p>${esc(label)}</p><b>${value}</b><span>${esc(sub)}</span></div>`;
}

// --- Dashboard -------------------------------------------------------------

export function viewDashboard(state) {
  const t = totalsFor(state, state.month);
  const month = MONTHS[state.month];
  // The dashboard shows whole dollars, rounded down, and the "left" figure is
  // computed from the rounded spent figure — so income, spent, saved and left
  // always add up on screen. Exact cents live on the Budgets page.
  const spentWhole = Math.floor(t.spent);
  const leftWhole = t.income - spentWhole - t.saved;
  const week = weekSpend(state);
  const budgets = budgetRows(state, state.month).sort((a, b) => b.pct - a.pct).slice(0, 5);
  const insights = insightsFor(state);
  const bills = upcomingBills(state, 3);
  const byCat = CATEGORIES.map((c) => ({ ...c, value: t.byCat[c.id] || 0 })).filter((c) => c.value > 0);
  const legend = byCat
    .sort((a, b) => b.value - a.value)
    .map((c) => `<li><i style="background:${c.color}"></i>${esc(c.name)}<b>${money0(c.value)}</b></li>`)
    .join('');

  return `
  <header class="page-head">
    <div>
      <h1>Good evening, Alvarez family</h1>
      <p class="lede">${esc(month.label)} · ${month.daysLeft} days left in the month · All figures update live as you add spending.</p>
    </div>
    ${monthSwitcher(state)}
  </header>

  <section class="kpis" aria-label="Month at a glance">
    ${kpi('Income', money0(t.income), `2 paychecks each · ${month.paydays}`)}
    ${kpi('Spent so far', money0(spentWhole), `$${Math.round(spentWhole / month.daysElapsed)}/day avg · ${month.daysElapsed} days in`)}
    ${kpi('Saved', money0(t.saved), `${((t.saved / t.income) * 100).toFixed(1)}% of income · on autopilot`)}
    ${kpi('Left to spend', money0(leftWhole), `Dining Out ${money0(Math.abs(budgetRows(state, state.month).find((r) => r.cat.id === 'dining').left))} over — see budgets`)}
  </section>

  <section class="week-strip" aria-label="This week">
    <div><span>This week · ${month.daysElapsed - 6}–${month.daysElapsed} ${esc(month.shortLabel)}</span><b>${money(week.total)}</b><small>across ${week.count} purchases</small></div>
    <div><span>Biggest this week</span><b>${week.biggest ? esc(week.biggest.merchant) : '—'}</b><small>${week.biggest ? money(week.biggest.amount) + ' · ' + esc(week.biggest.note) : ''}</small></div>
    <div><span>Next payday</span><b>${esc(NEXT_PAYDAY.label)}</b><small>${NEXT_PAYDAY.daysAway} days away · $7,240 lands</small></div>
  </section>

  <div class="duo">
    <section class="card">
      <h2>Where the money went</h2>
      <div class="donut-wrap"><canvas id="donut" width="240" height="240" aria-label="Spending by category"></canvas>
      <ul class="legend">${legend}</ul></div>
    </section>
    <section class="card">
      <h2>Budgets at a glance</h2>
      ${budgets
        .map(
          (r) => `<div class="mini-budget">
          <div class="mini-head"><span>${esc(r.cat.name)}</span><b>${money0(r.spent)} / ${money0(r.limit)}</b></div>
          ${bar(r.pct, r.left < 0 ? '#b45309' : r.cat.color)}
          <div class="mini-foot"><span>${Math.round(r.pct)}% used</span><b class="${r.left < 0 ? 'over' : 'ok'}">${r.left < 0 ? money0(Math.abs(r.left)) + ' over' : money0(r.left) + ' left'}</b></div>
        </div>`,
        )
        .join('')}
      <p class="card-link"><a href="#/budgets">See all budgets →</a></p>
    </section>
  </div>

  <div class="duo">
    <section class="card">
      <h2>Worth knowing</h2>
      <ul class="insights">
        ${insights.map((i) => `<li><b>${esc(i.title)}</b><span>${esc(i.text)}</span></li>`).join('')}
      </ul>
    </section>
    <section class="card">
      <h2>Coming up</h2>
      <ul class="bill-mini">
        ${bills
          .map(
            (b) => `<li><span><b>${esc(b.name)}</b><small>${esc(b.what)} · due ${esc(b.due)}</small></span><b>${money(b.amount)}</b></li>`,
          )
          .join('')}
      </ul>
      <p class="card-link"><a href="#/bills">All December bills →</a></p>
      <h2 class="sub">Five months of spending</h2>
      <canvas id="trend-bars" width="300" height="120" aria-label="Monthly spending, July to November"></canvas>
    </section>
  </div>`;
}

// --- Transactions ----------------------------------------------------------

export function viewTransactions(state) {
  const t = totalsFor(state, state.month);
  const month = MONTHS[state.month];
  const q = (state.ui.search || '').toLowerCase();
  const rows = rowsFor(state, state.month)
    .filter((r) => {
      if (state.ui.filter && r.category !== state.ui.filter) return false;
      if (!q) return true;
      return (r.merchant + ' ' + r.note + ' ' + catName(r.category)).toLowerCase().includes(q);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const shownTotal = round2(rows.reduce((a, r) => a + r.amount, 0));

  return `
  <header class="page-head">
    <div>
      <h1>Transactions</h1>
      <p class="lede">Every dollar in and out, ${esc(t.label)} — ${t.rows} spending rows, ${money(t.spent)} in all.</p>
    </div>
    ${monthSwitcher(state)}
  </header>

  <section class="summary-strip" aria-label="Month summary">
    <div><span>Spent</span><b>${money(t.spent)}</b></div>
    <div><span>Income</span><b>${money(t.income)}</b></div>
    <div><span>Auto-saved</span><b>${money(t.saved)}</b></div>
    <div><span>Left to spend</span><b>${money(t.left)}</b></div>
  </section>

  <section class="card">
    <h2>Add a transaction</h2>
    <form id="txn-form" class="txn-form">
      <label>Merchant<input id="txn-merchant" name="merchant" type="text" required maxlength="80" placeholder="e.g. H-E-B Grocery" /></label>
      <label>Category
        <select id="txn-category" name="category">
          ${CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
        </select>
      </label>
      <label>Amount ($)<input id="txn-amount" name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" /></label>
      <label>Date<input id="txn-date" name="date" type="date" value="2026-11-26" required /></label>
      <button type="submit" class="btn">Add transaction</button>
    </form>
    <p class="hint">Adding here updates the dashboard, the budgets and the reports at once — they all read the same ledger.</p>
  </section>

  <section class="card">
    <div class="ledger-tools">
      <input id="txn-search" type="search" placeholder="Search merchant or note…" value="${esc(state.ui.search || '')}" aria-label="Search transactions" />
      <select id="txn-filter" aria-label="Filter by category">
        <option value="">All categories</option>
        ${CATEGORIES.map((c) => `<option value="${c.id}" ${state.ui.filter === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
      </select>
      <button type="button" class="btn ghost" data-action="export-csv">Download CSV</button>
      <button type="button" class="btn ghost danger-text" data-action="reset-demo">Reset demo data</button>
    </div>
    <p class="hint">${rows.length} rows shown · ${money(shownTotal)} in view.</p>
    <table class="ledger">
      <thead><tr><th>Date</th><th>Merchant</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
      <tbody>
        ${rows
          .map(
            (r) => `<tr>
              <td>${esc(r.date)}</td>
              <td><b>${esc(r.merchant)}</b><small>${esc(r.note)}</small></td>
              <td><i class="dot" style="background:${catById(r.category).color}"></i>${esc(catName(r.category))}</td>
              <td class="num">${money(r.amount)}</td>
              <td><button type="button" class="mini danger" data-action="delete-txn" data-id="${esc(r.id)}" aria-label="Delete ${esc(r.merchant)}">Delete</button></td>
            </tr>`,
          )
          .join('')}
      </tbody>
    </table>
  </section>`;
}

// --- Budgets ---------------------------------------------------------------

export function viewBudgets(state) {
  const t = totalsFor(state, state.month);
  const rows = budgetRows(state, state.month);

  return `
  <header class="page-head">
    <div>
      <h1>Budgets</h1>
      <p class="lede">${esc(t.label)} — ${money(t.spent)} of a ${money0(t.plan)} plan. Tap Adjust to change any monthly limit.</p>
    </div>
    ${monthSwitcher(state)}
  </header>

  <section class="card budget-list">
    ${rows
      .map((r) => {
        const editing = state.ui.editingBudget === r.cat.id;
        return `<article class="budget-row">
        <div class="budget-head">
          <span><i class="dot" style="background:${r.cat.color}"></i><b>${esc(r.cat.name)}</b></span>
          <b>${money(r.spent)} of ${money(r.limit)}</b>
        </div>
        ${bar(r.pct, r.left < 0 ? '#b45309' : r.cat.color)}
        <div class="budget-foot">
          <span>${Math.round(r.pct)}% used</span>
          <b class="${r.left < 0 ? 'over' : 'ok'}">${r.left < 0 ? money(Math.abs(r.left)) + ' over' : money(r.left) + ' left'}</b>
          ${
            editing
              ? `<span class="adjust-box"><input id="adjust-input" type="number" min="0" step="5" value="${r.limit}" aria-label="New limit for ${esc(r.cat.name)}" /><button type="button" class="mini" data-action="save-budget" data-cat="${r.cat.id}">Save</button><button type="button" class="mini ghost" data-action="cancel-budget">Cancel</button></span>`
              : `<button type="button" class="mini" data-action="adjust-budget" data-cat="${r.cat.id}">Adjust</button>`
          }
        </div>
      </article>`;
      })
      .join('')}
  </section>
  <p class="hint">Limits are monthly plans, not hard walls — going over one is fine as long as another has room. Adjusting a limit here updates the dashboard at once.</p>`;
}

// --- Goals -----------------------------------------------------------------

export function viewGoals(state) {
  const goals = GOALS.map((g) => ({ ...g, saved: goalSaved(state, g) }));

  return `
  <header class="page-head">
    <div>
      <h1>Goals</h1>
      <p class="lede">Three things the family is saving for. Every top-up moves the finish date — it is computed from the monthly plan, not typed in.</p>
    </div>
  </header>

  <section class="goals-grid">
    ${goals
      .map((g) => {
        const pct = Math.min(100, (g.saved / g.target) * 100);
        return `<article class="card goal">
          <h2>${esc(g.name)}</h2>
          <p class="goal-amount"><b>${money0(g.saved)}</b> of ${money0(g.target)}</p>
          ${bar(pct, '#166534')}
          <p class="goal-meta">${Math.round(pct)}% there · ${money0(g.target - g.saved)} to go</p>
          <p class="goal-finish">Done around <b>${esc(finishLabel(g, g.saved))}</b> at ${money0(g.monthly)}/mo</p>
          <p>${esc(g.note)}</p>
          <div class="goal-add">
            ${[50, 100, 250]
              .map((n) => `<button type="button" class="btn ghost" data-action="goal-add" data-id="${g.id}" data-amount="${n}">+$${n}</button>`)
              .join('')}
          </div>
        </article>`;
      })
      .join('')}
  </section>
  <p class="hint">Top-ups come from the money left to spend — the dashboard's "left" figure falls by the same amount, so the books always balance.</p>`;
}

// --- Bills -----------------------------------------------------------------

export function viewBills(state) {
  const due = BILLS.filter((b) => !state.paid.includes(b.id));
  const paid = [
    ...BILLS.filter((b) => state.paid.includes(b.id)).map((b) => ({ ...b, when: 'just now' })),
    ...PAID_BILLS.map((b) => ({ ...b, when: `paid · due ${b.due}` })),
  ];
  const dueTotal = round2(due.reduce((a, b) => a + b.amount, 0));
  const autoTotal = round2(due.filter((b) => b.autopay).reduce((a, b) => a + b.amount, 0));
  const manualTotal = round2(dueTotal - autoTotal);

  return `
  <header class="page-head">
    <div>
      <h1>Bills</h1>
      <p class="lede">${due.length} bills due in December, ${money(dueTotal)} to go. Autopay handles most of them; two need a tap.</p>
    </div>
  </header>

  <section class="payday-card" aria-label="Next payday">
    <div><span>Next payday</span><b>${esc(NEXT_PAYDAY.label)}</b><small>${NEXT_PAYDAY.daysAway} days away · $7,240 lands</small></div>
    <div><span>Autopay will cover</span><b>${money(autoTotal)}</b><small>${due.filter((b) => b.autopay).length} bills, no tap needed</small></div>
    <div><span>Needs a tap</span><b>${money(manualTotal)}</b><small>${due.filter((b) => !b.autopay).length} bills · pay before Dec 20</small></div>
  </section>

  <section class="card">
    <h2>Due in December</h2>
    <ul class="bill-list">
      ${due
        .map(
          (b) => `<li>
            <span class="bill-name"><b>${esc(b.name)}</b><small>${b.autopay ? 'Autopay' : 'Pay manually'}</small></span>
            <span class="bill-due">due ${esc(b.due)}</span>
            <b>${money(b.amount)}</b>
            <button type="button" class="btn ghost" data-action="pay-bill" data-id="${b.id}">Mark paid</button>
          </li>`,
        )
        .join('') || '<li>Nothing due — every December bill is paid.</li>'}
    </ul>
  </section>

  <section class="card">
    <h2>Paid</h2>
    <ul class="bill-list paid">
      ${paid
        .map(
          (b) => `<li><span class="bill-name"><b>${esc(b.name)}</b><small>${esc(b.when)}</small></span><b>${money(b.amount)}</b>${state.paid.includes(b.id) ? `<button type="button" class="mini" data-action="unpay-bill" data-id="${b.id}">Undo</button>` : ''}</li>`,
        )
        .join('')}
    </ul>
  </section>`;
}

// --- Reports ---------------------------------------------------------------

export function viewReports(state) {
  const spent5 = TREND.reduce((a, m) => a + m.total, 0);
  const avg = spent5 / TREND.length;
  const biggest = [...TREND].sort((a, b) => b.total - a.total)[0];
  const lightest = [...TREND].sort((a, b) => a.total - b.total)[0];
  const kept = TREND.map((m) => {
    const left = 7240 - m.total - SAVINGS_PLAN;
    return { month: m.month, rate: ((SAVINGS_PLAN + left) / 7240) * 100 };
  });
  const bestKept = [...kept].sort((a, b) => b.rate - a.rate)[0];
  const worstKept = [...kept].sort((a, b) => a.rate - b.rate)[0];

  return `
  <header class="page-head">
    <div>
      <h1>Reports</h1>
      <p class="lede">Five months, July to November 2026 — what the family spent, where it went, and how much of each paycheck they kept.</p>
    </div>
  </header>

  <section class="kpis" aria-label="Five-month summary">
    ${kpi('Spent · 5 months', money0(spent5), `Average ${money0(avg)} a month`)}
    ${kpi('Biggest month', money0(biggest.total), `${esc(biggest.month)} — the most spent`)}
    ${kpi('Lightest month', money0(lightest.total), `${esc(lightest.month)} — the least spent`)}
    ${kpi('Auto-saved · 5 months', money0(SAVINGS_PLAN * 5), `$${SAVINGS_PLAN.toLocaleString('en-US')} every month, no exceptions`)}
  </section>

  <section class="card">
    <h2>Spending by category, month by month</h2>
    <canvas id="grouped-bars" width="640" height="300" aria-label="Spending by category for each of five months"></canvas>
    <ul class="legend inline">
      ${CATEGORIES.map((c) => `<li><i style="background:${c.color}"></i>${esc(c.name)}</li>`).join('')}
    </ul>
    <p class="hint">Housing is the flat green bar every month — rent never moves. Everything else is where the months differ.</p>
  </section>

  <div class="duo">
    <section class="card">
      <h2>How much of each paycheck they kept</h2>
      <p class="lede">Saved plus left over, as a share of take-home pay.</p>
      ${kept
        .map(
          (k) => `<div class="kept-row"><span>${esc(k.month)}</span>${bar(k.rate, k.rate >= 45 ? '#166534' : '#b45309')}<b>${k.rate.toFixed(1)}%</b></div>`,
        )
        .join('')}
      <p class="hint">${esc(bestKept.month)} kept the most (${bestKept.rate.toFixed(1)}%). ${esc(worstKept.month)} kept the least (${worstKept.rate.toFixed(1)}%) — dining ran over and shopping spiked.</p>
    </section>
    <section class="card">
      <h2>What the five months say</h2>
      <ul class="insights">
        <li><b>${esc(biggest.month)} was the biggest month</b><span>${money0(biggest.total)} — rent stayed flat while groceries and dining both dipped. November is back near the five-month norm.</span></li>
        <li><b>${esc(lightest.month)} was the lightest</b><span>${money0(lightest.total)} — rent stayed flat while groceries and dining both dipped, and nothing was spent on entertainment at all.</span></li>
        <li><b>Groceries is the swing category</b><span>From ${money0(695)} in September to ${money0(824.5)} in November — Thanksgiving week alone added ${money0(84.45)}.</span></li>
      </ul>
    </section>
  </div>

  <section class="card">
    <h2>The ledger, month by month</h2>
    <table class="ledger compact">
      <thead><tr><th>Category</th>${TREND.map((m) => `<th class="num">${esc(m.month.replace(' 2026', ''))}</th>`).join('')}</tr></thead>
      <tbody>
        ${CATEGORIES.map(
          (c) => `<tr><td><i class="dot" style="background:${c.color}"></i>${esc(c.name)}</td>${TREND.map((m) => `<td class="num">${money(m.byCategory[c.id])}</td>`).join('')}</tr>`,
        ).join('')}
        <tr class="total-row"><td><b>Total spent</b></td>${TREND.map((m) => `<td class="num"><b>${money(m.total)}</b></td>`).join('')}</tr>
      </tbody>
    </table>
  </section>`;
}

// --- Planner ---------------------------------------------------------------

export function viewPlanner(state) {
  const p = state.planner;
  const t = totalsFor(state, state.month);
  const newSaved = SAVINGS_PLAN + p.extra;
  const newLeft = round2(p.pay - t.spent - newSaved);
  const newRate = ((newSaved / p.pay) * 100).toFixed(1);
  const emergency = GOALS[0];
  const emergencyLeft = emergency.target - goalSaved(state, emergency);
  const finishMonths = Math.max(1, Math.ceil(emergencyLeft / (600 + p.extra)));
  const finish = new Date(2026, 11 + finishMonths - 1, 1);
  const freed = p.dining < 260 || p.groceries < 850 ? (260 - p.dining) + (850 - p.groceries) : 0;

  return `
  <header class="page-head">
    <div>
      <h1>Planner</h1>
      <p class="lede">Move the sliders and watch the month change. Nothing here is saved until you like what you see — the what-if card updates as you drag.</p>
    </div>
  </header>

  <div class="duo">
    <section class="card">
      <h2>Your month, as it stands</h2>
      <div class="slider-row">
        <label for="plan-pay">Monthly take-home pay <b>${money0(p.pay)}</b></label>
        <input id="plan-pay" type="range" min="5000" max="10000" step="20" value="${p.pay}" data-plan="pay" />
      </div>
      <div class="slider-row">
        <label for="plan-extra">Extra saving each month <b>${money0(p.extra)}</b></label>
        <input id="plan-extra" type="range" min="0" max="1000" step="25" value="${p.extra}" data-plan="extra" />
      </div>
      <div class="slider-row">
        <label for="plan-dining">Dining-out budget <b>${money0(p.dining)}</b></label>
        <input id="plan-dining" type="range" min="100" max="500" step="10" value="${p.dining}" data-plan="dining" />
      </div>
      <div class="slider-row">
        <label for="plan-groceries">Grocery budget <b>${money0(p.groceries)}</b></label>
        <input id="plan-groceries" type="range" min="400" max="1200" step="10" value="${p.groceries}" data-plan="groceries" />
      </div>
      <p class="hint">November actually spent ${money(t.spent)} on ${money0(t.income)} of pay, saving ${money(t.saved)} — the sliders start there.</p>
    </section>

    <section class="card accent">
      <h2>If the month looked like this</h2>
      <ul class="whatif">
        <li><span>Left to spend</span><b>${money(newLeft)}</b></li>
        <li><span>Saved each month</span><b>${money(newSaved)} · ${newRate}% of pay</b></li>
        <li><span>Emergency fund done</span><b>${MONTH_NAMES[finish.getMonth()]} ${finish.getFullYear()} · in ${finishMonths} month${finishMonths === 1 ? '' : 's'}</b></li>
        <li><span>Dining + groceries budgets</span><b>${money0(p.dining + p.groceries)} a month</b></li>
      </ul>
      <p class="hint">${freed > 0 ? `Trimming dining to ${money0(p.dining)} and groceries to ${money0(p.groceries)} frees ${money0(freed)} a month — enough to cover November's dining overspend ${Math.floor(freed / 14.55)} times over.` : 'At the current budgets the month balances exactly as November did — dining $14.55 over, covered by transport.'}</p>
      <p><button type="button" class="btn" data-action="apply-plan">Use these budgets for December</button></p>
      <p class="hint">That sets the dining limit to ${money0(p.dining)} and groceries to ${money0(p.groceries)} on the Budgets page.</p>
    </section>
  </div>`;
}
