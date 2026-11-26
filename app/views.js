// Hearth — the seven pages. Every number on every page is computed from the
// same live state, so adding a transaction on one page moves the totals,
// the budgets, the charts and the reports together.
import { money, money0, donut, bars } from './charts.js';

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// --- shared math -----------------------------------------------------------

export function totalsFor(state, seed, key) {
  const meta = seed.months[key];
  const month = state.months[key];
  const income = round2(month.income.reduce((a, r) => a + r.amount, 0));
  const spent = round2(month.spend.reduce((a, r) => a + r.amount, 0));
  const saved = seed.savingsPlan;
  const left = round2(income - spent - saved);
  return { ...meta, income, spent, saved, left, key };
}

export function categorySpent(state, key) {
  const out = {};
  for (const row of state.months[key].spend) {
    out[row.category] = round2((out[row.category] || 0) + row.amount);
  }
  return out;
}

export function budgetRows(state, seed, key) {
  const spent = categorySpent(state, key);
  return seed.categories.map((c) => {
    const used = spent[c.id] || 0;
    const limit = state.limits[c.id];
    const pct = limit ? (used / limit) * 100 : 0;
    return { ...c, used, limit, pct, diff: round2(limit - used) };
  });
}

// Newest first; same-day rows keep their entered order, latest entered first.
export function txnRows(state, key) {
  return state.months[key].spend
    .map((r, i) => ({ ...r, _i: i }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b._i - a._i));
}

function catName(seed, id) {
  const c = seed.categories.find((x) => x.id === id);
  return c ? c.name : id;
}

function catColor(seed, id) {
  const c = seed.categories.find((x) => x.id === id);
  return c ? c.color : '#78716c';
}

function monthSwitcher(state, seed) {
  return `<div class="switcher" role="group" aria-label="Choose month">
    ${Object.keys(seed.months)
      .map(
        (k) =>
          `<button type="button" data-action="switch-month" data-month="${k}" class="${state.month === k ? 'on' : ''}">${esc(seed.months[k].label)}</button>`,
      )
      .join('')}
  </div>`;
}

function bar(pct, color) {
  const w = Math.min(100, Math.max(0, pct));
  return `<div class="bar"><span style="width:${w.toFixed(1)}%;background:${color}"></span></div>`;
}

function tipCard(tip) {
  return `<div class="tip tip-${tip.tone}">
    <strong>${esc(tip.title)}</strong>
    <p>${esc(tip.body)}</p>
  </div>`;
}

// --- Dashboard -------------------------------------------------------------

export function viewDashboard(state, seed) {
  const t = totalsFor(state, seed, state.month);
  const rows = budgetRows(state, seed, state.month);
  const spentByCat = categorySpent(state, state.month);
  const avgDay = Math.round(t.spent / t.daysElapsed);
  const savedPct = ((t.saved / t.income) * 100).toFixed(1);
  const over = rows.filter((r) => r.pct > 100).sort((a, b) => b.pct - a.pct)[0];
  const leftNote = over
    ? `${over.name} ${money0(Math.abs(over.diff))} over — see budgets`
    : 'All budgets on track';

  const top = [...rows].sort((a, b) => b.used - a.used);
  const top5 = top.slice(0, 5);
  const rest = round2(t.spent - top5.reduce((a, r) => a + r.used, 0));
  const donutParts = top5.map((r) => ({ label: r.name, value: r.used, color: r.color }));
  if (rest > 0) donutParts.push({ label: 'Everything else', value: rest, color: '#d6d3d1' });

  const glance = [...rows].sort((a, b) => b.pct - a.pct).slice(0, 5);
  const recent = txnRows(state, state.month).slice(0, 6);
  const due = state.bills.filter((b) => !b.paid).slice(0, 4);
  const accountsTotal = seed.accounts.reduce((a, x) => a + x.balance, 0);

  return `
  <header class="page-head">
    <div>
      <h1>Good evening, Alvarez family</h1>
      <p class="lede">${esc(t.label)} · ${t.daysLeft} days left in the month · All figures update live as you add spending.</p>
    </div>
    ${monthSwitcher(state, seed)}
  </header>

  <section class="kpis" aria-label="Month at a glance">
    <article class="kpi"><span class="kpi-label">Income</span><strong>${money0(t.income)}</strong><span class="kpi-sub">2 paychecks each · ${esc(t.paydays)}</span></article>
    <article class="kpi"><span class="kpi-label">Spent so far</span><strong>${money0(t.spent)}</strong><span class="kpi-sub">${money0(avgDay)}/day avg · ${t.daysElapsed} days in</span></article>
    <article class="kpi"><span class="kpi-label">Saved</span><strong>${money0(t.saved)}</strong><span class="kpi-sub">${savedPct}% of income · on autopilot</span></article>
    <article class="kpi"><span class="kpi-label">Left to spend</span><strong>${money0(t.left)}</strong><span class="kpi-sub">${esc(leftNote)}</span></article>
  </section>

  <section class="grid-2">
    <article class="card">
      <h2>Where the money went</h2>
      <div class="donut-wrap">
        ${donut(donutParts, 190, t.spent, 'spent')}
        <ul class="legend">
          ${donutParts.map((p) => `<li><span class="dot" style="background:${p.color}"></span>${esc(p.label)} <b>${money0(p.value)}</b></li>`).join('')}
        </ul>
      </div>
    </article>

    <article class="card">
      <h2>Budgets at a glance</h2>
      <ul class="glance">
        ${glance
          .map(
            (r) => `<li>
              <div class="glance-top"><span>${esc(r.name)}</span><span>${money0(r.used)} / ${money0(r.limit)}</span></div>
              ${bar(r.pct, r.color)}
              <div class="glance-bot"><span>${Math.round(r.pct)}% used</span><span class="${r.pct > 100 ? 'over' : 'left'}">${r.pct > 100 ? money0(Math.abs(r.diff)) + ' over' : money0(r.diff) + ' left'}</span></div>
            </li>`,
          )
          .join('')}
      </ul>
      <p class="card-link"><a href="#/budgets">See all budgets →</a></p>
    </article>
  </section>

  <section class="grid-2">
    <article class="card">
      <h2>Recent spending</h2>
      <ul class="txn-list">
        ${recent
          .map(
            (r) => `<li>
              <span class="dot" style="background:${catColor(seed, r.category)}"></span>
              <span class="txn-main"><b>${esc(r.merchant)}</b><small>${esc(r.note)} · ${esc(catName(seed, r.category))} · ${esc(r.date.slice(5))}</small></span>
              <b>${money(r.amount)}</b>
              <button type="button" class="mini danger" data-action="delete-txn" data-id="${esc(r.id)}" aria-label="Delete ${esc(r.merchant)}">Delete</button>
            </li>`,
          )
          .join('')}
      </ul>
      <p class="card-link"><a href="#/transactions">All transactions →</a></p>
    </article>

    <article class="card">
      <h2>Coming up</h2>
      <ul class="bills-mini">
        ${due.map((b) => `<li><span>${esc(b.name)}</span><b>${money(b.amount)}</b><small>due ${esc(b.due)}</small></li>`).join('')}
      </ul>
      <p class="accounts-line">Across the accounts: <b>${money(accountsTotal)}</b> — ${seed.accounts.map((a) => `${esc(a.name)} ${money(a.balance)}`).join(' · ')}</p>
      ${tipCard(seed.tips[0])}
    </article>
  </section>`;
}

// --- Transactions ----------------------------------------------------------

export function viewTransactions(state, seed, ui) {
  const rows = txnRows(state, state.month);
  const q = (ui.search || '').toLowerCase();
  const shown = rows.filter((r) => {
    if (ui.filter && r.category !== ui.filter) return false;
    if (!q) return true;
    return (r.merchant + ' ' + r.note + ' ' + catName(seed, r.category)).toLowerCase().includes(q);
  });
  const total = round2(shown.reduce((a, r) => a + r.amount, 0));
  const t = totalsFor(state, seed, state.month);

  return `
  <header class="page-head">
    <div>
      <h1>Transactions</h1>
      <p class="lede">Every dollar in and out, ${esc(t.label)} — ${rows.length} spending rows, ${money(total)} shown.</p>
    </div>
    ${monthSwitcher(state, seed)}
  </header>

  <section class="card">
    <h2>Add a transaction</h2>
    <form id="txn-form" class="txn-form">
      <label>Merchant<input id="txn-merchant" name="merchant" type="text" required maxlength="80" placeholder="e.g. H-E-B Grocery" /></label>
      <label>Category
        <select id="txn-category" name="category">
          ${seed.categories.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
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
      <input id="txn-search" type="search" placeholder="Search merchant or note…" value="${esc(ui.search || '')}" aria-label="Search transactions" />
      <select id="txn-filter" aria-label="Filter by category">
        <option value="">All categories</option>
        ${seed.categories.map((c) => `<option value="${c.id}" ${ui.filter === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
      </select>
      <button type="button" class="btn ghost" data-action="export-csv">Download CSV</button>
      <button type="button" class="btn ghost danger-text" data-action="reset-demo">Reset demo data</button>
    </div>
    <div class="table-wrap">
      <table class="ledger">
        <thead><tr><th>Date</th><th>Merchant</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
        <tbody>
          ${shown
            .map(
              (r) => `<tr>
                <td>${esc(r.date)}</td>
                <td><b>${esc(r.merchant)}</b><small>${esc(r.note)}</small></td>
                <td><span class="dot" style="background:${catColor(seed, r.category)}"></span>${esc(catName(seed, r.category))}</td>
                <td class="num">${money(r.amount)}</td>
                <td><button type="button" class="mini danger" data-action="delete-txn" data-id="${esc(r.id)}">Delete</button></td>
              </tr>`,
            )
            .join('') || '<tr><td colspan="5">Nothing matches — clear the search or the filter.</td></tr>'}
        </tbody>
      </table>
    </div>
    <p class="hint">${shown.length} rows · ${money(total)} shown · income this month ${money(t.income)} across ${state.months[state.month].income.length} paychecks.</p>
  </section>`;
}

// --- Budgets ---------------------------------------------------------------

export function viewBudgets(state, seed) {
  const rows = budgetRows(state, seed, state.month);
  const t = totalsFor(state, seed, state.month);
  const totalLimit = seed.categories.reduce((a, c) => a + state.limits[c.id], 0);
  const needs = ['housing', 'groceries', 'transport', 'utilities', 'health', 'kids'];
  const wants = ['dining', 'entertainment', 'shopping', 'personal'];
  const needsSpent = rows.filter((r) => needs.includes(r.id)).reduce((a, r) => a + r.used, 0);
  const wantsSpent = rows.filter((r) => wants.includes(r.id)).reduce((a, r) => a + r.used, 0);

  return `
  <header class="page-head">
    <div>
      <h1>Budgets</h1>
      <p class="lede">${esc(t.label)} — ${money0(t.spent)} of a ${money0(totalLimit)} plan. Tap Adjust to change any monthly limit.</p>
    </div>
    ${monthSwitcher(state, seed)}
  </header>

  <section class="card">
    <ul class="budget-list">
      ${rows
        .map(
          (r) => `<li>
            <div class="budget-top">
              <span class="budget-name"><span class="dot" style="background:${r.color}"></span>${esc(r.name)}</span>
              <span><b>${money(r.used)}</b> of ${money(r.limit)}</span>
            </div>
            ${bar(r.pct, r.color)}
            <div class="budget-bot">
              <span>${Math.round(r.pct)}% used</span>
              <span class="pill ${r.pct > 100 ? 'over' : 'left'}">${r.pct > 100 ? money(Math.abs(r.diff)) + ' over' : money(r.diff) + ' left'}</span>
              <button type="button" class="mini" data-action="adjust-budget" data-cat="${r.id}">Adjust</button>
            </div>
          </li>`,
        )
        .join('')}
    </ul>
  </section>

  <section class="card">
    <h2>How the plan is built</h2>
    <p>The Alvarez plan follows the 50/30/20 rule: about half the pay for needs, a third for wants, a fifth saved. This month needs are running at ${money0(needsSpent)} (${Math.round((needsSpent / t.income) * 100)}% of income) and wants at ${money0(wantsSpent)} (${Math.round((wantsSpent / t.income) * 100)}%), with ${money0(t.saved)} saved on autopilot.</p>
    <p class="card-link"><a href="#/planner">Try the numbers in the planner →</a></p>
  </section>`;
}

// --- Goals -----------------------------------------------------------------

export function viewGoals(state, seed) {
  const totalSaved = state.goals.reduce((a, g) => a + g.saved, 0);
  const totalTarget = state.goals.reduce((a, g) => a + g.target, 0);
  return `
  <header class="page-head">
    <div>
      <h1>Savings goals</h1>
      <p class="lede">${money0(totalSaved)} saved toward ${money0(totalTarget)} across four goals. Every dollar added here lands in the same pot the dashboard counts.</p>
    </div>
  </header>

  <section class="goals-grid">
    ${state.goals
      .map((g) => {
        const pct = Math.min(100, (g.saved / g.target) * 100);
        return `<article class="card goal">
          <h2>${esc(g.name)}</h2>
          <p class="goal-amount"><b>${money0(g.saved)}</b> of ${money0(g.target)}</p>
          ${bar(pct, '#166534')}
          <p class="goal-meta">${Math.round(pct)}% there · ${money0(g.target - g.saved)} to go</p>
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

  <section class="card">
    <h2>Why goals first</h2>
    <p>The Alvarez family pays its future self before anything else: $600 leaves checking on each payday, before the grocery run or the movie night. That is why the emergency fund is 79% funded while the month is still running — the saving happens whether the month feels tight or not. A goal that only gets "whatever is left" never gets anything; a goal that gets paid first always does.</p>
  </section>`;
}

// --- Bills -----------------------------------------------------------------

export function viewBills(state, seed) {
  const due = state.bills.filter((b) => !b.paid);
  const paid = state.bills.filter((b) => b.paid);
  const dueTotal = round2(due.reduce((a, b) => a + b.amount, 0));
  return `
  <header class="page-head">
    <div>
      <h1>Bills</h1>
      <p class="lede">${due.length} bills due in December, ${money(dueTotal)} to go. Autopay handles most of them; two need a tap.</p>
    </div>
  </header>

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

  ${paid.length ? `<section class="card">
    <h2>Paid</h2>
    <ul class="bill-list paid">
      ${paid.map((b) => `<li><span class="bill-name"><b>${esc(b.name)}</b><small>paid · due ${esc(b.due)}</small></span><b>${money(b.amount)}</b><button type="button" class="mini" data-action="unpay-bill" data-id="${b.id}">Undo</button></li>`).join('')}
    </ul>
  </section>` : ''}

  <section class="card">
    <h2>Recurring, every month</h2>
    <p>Rent, power, water, internet, phones, insurance and the gym leave on fixed dates, most of them on autopay, so the family never has to remember them. The small ones count too: Spotify $11.99 and Netflix $15.49 renew from December inside Entertainment, and the gym's $29 keeps the Castle Hill membership warm. A bill is only a surprise the first time — after that it is a line in the plan.</p>
  </section>`;
}

// --- Reports ---------------------------------------------------------------

export function viewReports(state, seed) {
  const t = totalsFor(state, seed, state.month);
  const rows = budgetRows(state, seed, state.month);
  const ranked = [...rows].sort((a, b) => b.used - a.used);
  const needsIds = ['housing', 'groceries', 'transport', 'utilities', 'health', 'kids'];
  const wantsIds = ['dining', 'entertainment', 'shopping', 'personal'];
  const needs = round2(rows.filter((r) => needsIds.includes(r.id)).reduce((a, r) => a + r.used, 0));
  const wants = round2(rows.filter((r) => wantsIds.includes(r.id)).reduce((a, r) => a + r.used, 0));
  const pct = (n) => ((n / t.income) * 100).toFixed(1);
  const trendRows = seed.trend.map((m) => ({ label: m.label, value: m.total, highlight: m.label === 'Nov' }));

  return `
  <header class="page-head">
    <div>
      <h1>Reports</h1>
      <p class="lede">Five months of spending, the 50/30/20 check, and what the numbers are saying — all for ${esc(t.label)}.</p>
    </div>
    ${monthSwitcher(state, seed)}
  </header>

  <section class="card">
    <h2>Spending over five months</h2>
    ${bars(trendRows, 220)}
    <p class="hint">October was the lightest month of the five at ${money0(3491)} — rent stayed flat while groceries and dining both dipped. November is back near the five-month norm.</p>
  </section>

  <section class="grid-2">
    <article class="card">
      <h2>The 50/30/20 check</h2>
      <p>Measured against ${money0(t.income)} of income this month.</p>
      <ul class="split">
        <li><span>Needs — housing, groceries, transport, utilities, health, kids</span><b>${money(needs)} · ${pct(needs)}%</b><small>target 50% — ${needs / t.income > 0.5 ? 'a touch over' : 'inside the line'}</small></li>
        <li><span>Wants — dining out, entertainment, shopping, personal</span><b>${money(wants)} · ${pct(wants)}%</b><small>target 30% — well under, the month stayed home</small></li>
        <li><span>Saved — the two payday transfers</span><b>${money(t.saved)} · ${pct(t.saved)}%</b><small>target 20% — close, and above the family's 15% floor</small></li>
      </ul>
      <p class="hint">${money(t.left)} is still unspent with ${t.daysLeft} days to go; it lands in savings unless the family moves it.</p>
    </article>

    <article class="card">
      <h2>Where November went</h2>
      <div class="donut-wrap">
        ${donut(ranked.filter((r) => r.used > 0).map((r) => ({ label: r.name, value: r.used, color: r.color })), 190, t.spent, 'spent')}
        <ul class="legend">
          ${ranked.map((r) => `<li><span class="dot" style="background:${r.color}"></span>${esc(r.name)} <b>${money(r.used)}</b><small>${((r.used / t.spent) * 100).toFixed(1)}%</small></li>`).join('')}
        </ul>
      </div>
    </article>
  </section>

  <section class="card">
    <h2>What the numbers say</h2>
    <div class="tips">${seed.tips.map(tipCard).join('')}</div>
  </section>`;
}

// --- Planner ---------------------------------------------------------------

export function viewPlanner(state, seed) {
  const p = state.planner;
  const savePct = Math.max(0, 100 - p.needs - p.wants);
  const needsAmt = Math.round((p.pay * p.needs) / 100);
  const wantsAmt = Math.round((p.pay * p.wants) / 100);
  const saveAmt = Math.round((p.pay * savePct) / 100);
  const yearly = saveAmt * 12;

  return `
  <header class="page-head">
    <div>
      <h1>Budget planner</h1>
      <p class="lede">Slide the split until it fits your household, then live by it for a month and see.</p>
    </div>
  </header>

  <section class="card">
    <h2>Your monthly plan</h2>
    <form id="planner-form" class="planner-form">
      <label>Monthly take-home pay ($)
        <input id="planner-pay" type="number" min="0" step="1" value="${p.pay}" />
      </label>
      <label><span id="needs-label">Needs — ${p.needs}% · ${money0(needsAmt)} a month</span>
        <input id="planner-needs" type="range" min="0" max="95" step="1" value="${p.needs}" />
      </label>
      <label><span id="wants-label">Wants — ${p.wants}% · ${money0(wantsAmt)} a month</span>
        <input id="planner-wants" type="range" min="0" max="95" step="1" value="${p.wants}" />
      </label>
    </form>
    <div class="plan-result">
      <p><strong>Save — ${savePct}% · ${money0(saveAmt)} a month</strong></p>
      <p>Needs and wants together are capped at 95%, so saving never drops below 5%.</p>
      <p class="yearly">At this rate the household saves <b>${money0(yearly)} a year</b> — ${money0(saveAmt)} every month, on autopilot.</p>
    </div>
    <p class="hint">The Alvarez plan today: ${money0(7240)} take-home, 50% needs, 30% wants, 20% saved — ${money0(1200)} of it leaving on payday before it can be spent.</p>
  </section>

  <section class="card">
    <h2>Make it stick</h2>
    <ol class="rules">
      <li><b>Pay yourself first — $1,200.</b> The transfer leaves on payday, not at month's end. What never lands in checking never gets spent.</li>
      <li><b>One fun budget, not none.</b> Dining out and movie nights have a number of their own, so a treat never feels like a failure.</li>
      <li><b>Review on the 1st, for ten minutes.</b> Rent is due, the month resets, and the whole plan fits on one screen — check it before the month checks you.</li>
    </ol>
  </section>`;
}
