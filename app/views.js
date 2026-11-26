// Hearth views — one job: turn state into HTML for each page.
// Every page is reachable from the sidebar; every number comes from the same
// state, so adding a transaction updates the dashboard, budgets and reports.
import { CATEGORIES, BUDGET_LIMITS, TREND, ACCOUNTS, TIPS } from './data.js';
import { money, money0, donut, bars } from './charts.js';

export const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export function totals(txns) {
  const t = { income: 0, spent: 0, saved: 0, byCat: {} };
  for (const x of txns) {
    if (x.kind === 'income') t.income += x.amount;
    else if (x.kind === 'savings') t.saved += x.amount;
    else { t.spent += x.amount; t.byCat[x.category] = (t.byCat[x.category] || 0) + x.amount; }
  }
  return t;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function budgetRows(state, limit = 99) {
  const t = totals(state.txns[state.month]);
  return CATEGORIES.map((c) => {
    const spent = t.byCat[c.id] || 0;
    const lim = state.limits[c.id] ?? BUDGET_LIMITS[c.id];
    return { ...c, spent, lim, pct: lim ? (spent / lim) * 100 : 0 };
  }).sort((a, b) => b.pct - a.pct).slice(0, limit);
}

function budgetBarRow(b) {
  const cls = b.pct > 100 ? 'over' : b.pct > 90 ? 'near' : '';
  const tag = b.pct > 100
    ? `<span class="pill over">${money0(b.spent - b.lim)} over</span>`
    : `<span class="pill ok">${Math.round(100 - b.pct)}% left</span>`;
  return `<div class="bar-row"><span><b>${b.label}</b></span>
    <span class="bar-track"><span class="bar-fill ${cls}" style="display:block;width:${Math.min(100, b.pct).toFixed(0)}%"></span></span>
    <span class="bar-num"><b>${money0(b.spent)}</b> <span class="muted">/ ${money0(b.lim)}</span></span></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin:-3px 0 4px">
    <span>${b.pct.toFixed(0)}% used</span>${tag}</div>`;
}

function txnRows(txns, limit = 99) {
  return [...txns].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit).map((x) => {
    const c = catById[x.category];
    const cls = x.kind === 'income' ? 'amt-in' : x.kind === 'savings' ? '' : 'amt-out';
    const sign = x.kind === 'income' ? '+' : '−';
    return `<tr><td>${x.date.slice(5)}<br><span class="muted">${x.date.slice(0, 4)}</span></td>
      <td><b>${esc(x.merchant)}</b><br><span class="muted">${esc(x.note || '')}</span></td>
      <td>${x.kind === 'income' ? '<span class="cat">Income</span>' : x.kind === 'savings' ? '<span class="cat">Savings</span>' : `<span class="cat">${c ? c.label : x.category}</span>`}</td>
      <td class="num ${cls}">${sign}${money(x.amount)}</td>
      <td class="num"><button class="btn small danger" data-action="delete-txn" data-id="${x.id}">Delete</button></td></tr>`;
  }).join('');
}

export function dashboardView(state) {
  const t = totals(state.txns[state.month]);
  const left = t.income - t.spent - t.saved;
  const month = state.monthLabel;
  const byCat = CATEGORIES.map((c) => ({ label: c.label, value: t.byCat[c.id] || 0, color: c.color }))
    .filter((p) => p.value > 0).sort((a, b) => b.value - a.value);
  const top = byCat.slice(0, 5);
  const recent = [...state.txns[state.month]].filter((x) => x.kind === 'spend')
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const dueBills = state.bills.filter((b) => !b.paid).slice(0, 4);
  const savingsRate = t.income ? Math.round((t.saved / t.income) * 1000) / 10 : 0;
  const over = budgetRows(state).filter((b) => b.pct > 100);
  const daysIn = (state.month === '2026-11' ? 30 : 31) - state.daysLeft;
  const shortMonth = state.month === '2026-11' ? 'Nov' : 'Oct';
  return `
  <div class="topbar"><div><h1>Good evening, Alvarez family</h1>
  <p>${month} · ${state.daysLeft} days left in the month · All figures update live as you add spending.</p></div>
  <div class="month-switch"><button data-action="month" data-month="2026-11" class="${state.month === '2026-11' ? 'on' : ''}">Nov 2026</button>
  <button data-action="month" data-month="2026-10" class="${state.month === '2026-10' ? 'on' : ''}">Oct 2026</button></div></div>
  <div class="kpis">
    <div class="kpi good"><div class="k-label">Income</div><div class="k-value">${money0(t.income)}</div><div class="k-sub">2 paychecks each · Nov 6 &amp; 20</div></div>
    <div class="kpi"><div class="k-label">Spent so far</div><div class="k-value">${money0(t.spent)}</div><div class="k-sub">${money0(t.spent / Math.max(1, daysIn))}/day avg · ${daysIn} days in</div></div>
    <div class="kpi good"><div class="k-label">Saved</div><div class="k-value">${money0(t.saved)}</div><div class="k-sub">${savingsRate}% of income · on autopilot</div></div>
    <div class="kpi ${left < 0 ? 'warn' : ''}"><div class="k-label">Left to spend</div><div class="k-value">${money0(left)}</div><div class="k-sub">${over.length ? `${over.map((b) => `${b.label} ${money0(b.spent - b.lim)} over`).join(', ')} — see budgets` : 'On track — no category blown'}</div></div>
  </div>
  <div class="grid">
    <section class="card"><h2>Where the money went <a class="right" href="#/budgets">All budgets →</a></h2>
      <p class="card-sub">Spending by category, ${month}.</p>
      <div class="donut-wrap">${donut(top, 168, t.spent, `spent in ${shortMonth}`)}
      <div class="legend">${top.map((p) => `<span class="li"><span class="sw" style="background:${p.color}"></span>${p.label}<span class="lv">${money0(p.value)}</span></span>`).join('')}
      <span class="li"><span class="sw" style="background:#f0eadf"></span>Everything else<span class="lv">${money0(t.spent - top.reduce((s, p) => s + p.value, 0))}</span></span></div></div>
    </section>
    <section class="card"><h2>Budgets at a glance <a class="right" href="#/budgets">Adjust →</a></h2>
      <p class="card-sub">Closest to the limit first. Dining is over — see the tip below.</p>
      ${budgetRows(state, 5).map(budgetBarRow).join('')}</section>
  </div>
  <div class="grid">
    <section class="card"><h2>Recent spending <a class="right" href="#/transactions">All transactions →</a></h2>
      <p class="card-sub">Latest outgoings, newest first.</p>
      <table><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
      <tbody>${txnRows(recent, 6)}</tbody></table></section>
    <section class="card"><h2>Coming up <a class="right" href="#/bills">All bills →</a></h2>
      <p class="card-sub">Bills due in December, before they hit.</p>
      ${dueBills.map((b) => `<div class="bill"><div><div class="b-name">${esc(b.name)}</div><div class="b-meta">Due ${b.due} · ${b.autopay ? 'Autopay on' : 'Pay manually'}</div></div><b>${money(b.amount)}</b></div>`).join('')}
      <p style="margin-top:10px;font-size:13.5px">Accounts: ${ACCOUNTS.map((a) => `<b>${esc(a.name)}</b> ${money(a.balance)}`).join(' · ')}</p>
      <div style="margin-top:10px">${TIPS.slice(0, 1).map((tip) => `<div class="tip warn"><b>${esc(tip.title)}</b>${esc(tip.body)}</div>`).join('')}</div>
    </section>
  </div>`;
}

export function transactionsView(state) {
  const f = state.filter;
  let list = state.txns[state.month].filter((x) => x.kind !== 'savings');
  if (f.cat !== 'all') list = list.filter((x) => x.category === f.cat || (f.cat === 'income' && x.kind === 'income'));
  if (f.q) { const q = f.q.toLowerCase(); list = list.filter((x) => (x.merchant + ' ' + (x.note || '')).toLowerCase().includes(q)); }
  const t = totals(list.filter((x) => x.kind === 'spend'));
  return `
  <div class="topbar"><div><h1>Transactions</h1><p>${state.monthLabel} · ${list.length} shown · ${money0(t.spent)} spent in this view.</p></div>
  <div class="month-switch"><button data-action="month" data-month="2026-11" class="${state.month === '2026-11' ? 'on' : ''}">Nov 2026</button>
  <button data-action="month" data-month="2026-10" class="${state.month === '2026-10' ? 'on' : ''}">Oct 2026</button></div></div>
  <section class="card"><h2>Add a transaction</h2><p class="card-sub">It updates the dashboard, budgets and reports at once.</p>
  <form class="form" data-form="add-txn">
    <div><label>What / merchant</label><input name="merchant" required maxlength="60" placeholder="e.g. H-E-B Grocery"></div>
    <div><label>Category</label><select name="category">${CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}</select></div>
    <div><label>Amount ($)</label><input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00"></div>
    <div><label>Date</label><input name="date" type="date" value="2026-11-26" required></div>
    <div><button class="btn" type="submit">Add spending</button></div>
  </form></section>
  <section class="card"><h2>All transactions</h2>
  <div class="toolbar">
    <input data-input="search" type="search" placeholder="Search merchant or note…” value="${esc(f.q)}">
    <select data-input="cat-filter">${['all', 'income', ...CATEGORIES.map((c) => c.id)].map((id) => `<option value="${id}" ${f.cat === id ? 'selected' : ''}>${id === 'all' ? 'All categories' : id === 'income' ? 'Income' : catById[id].label}</option>`).join('')}</select>
    <button class="btn ghost" data-action="export-csv">Download CSV</button>
    <button class="btn ghost" data-action="reset-demo">Reset demo data</button>
  </div>
  ${list.length ? `<table><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead><tbody>${txnRows(list)}</tbody></table>` : '<p class="empty">Nothing matches that search. Clear the filter to see everything again.</p>'}
  </section>`;
}

export function budgetsView(state) {
  const t = totals(state.txns[state.month]);
  const planned = Object.values(state.limits).reduce((s, v) => s + v, 0);
  return `
  <div class="topbar"><div><h1>Budgets — ${state.monthLabel}</h1><p>Planned ${money0(planned)} of ${money0(t.income)} income · Spent ${money0(t.spent)} · Savings plan ${money0(1200)} on top.</p></div></div>
  <section class="card"><h2>Every category</h2><p class="card-sub">Click Adjust to change a limit — the bars and the dashboard update immediately.</p>
  ${budgetRows(state).map((b) => `<div style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:start">
    <div>${budgetBarRow(b)}</div>
    <div style="padding-top:6px"><button class="btn small ghost" data-action="adjust-budget" data-cat="${b.id}">Adjust</button></div></div>`).join('')}
  </section>
  <section class="card"><h2>How the plan is built</h2><p class="card-sub">The 50 / 30 / 20 rule, checked against this month's real spending.</p>
  <div class="plan-out">Needs (housing, groceries, transport, utilities, health, kids): <b>${money0(['housing', 'groceries', 'transport', 'utilities', 'health', 'kids'].reduce((s, id) => s + (t.byCat[id] || 0), 0))}</b> · Wants (dining, entertainment, shopping, personal): <b>${money0(['dining', 'entertainment', 'shopping', 'personal'].reduce((s, id) => s + (t.byCat[id] || 0), 0))}</b> · Saved: <b>${money0(t.saved)}</b> + <b>${money0(t.income - t.spent - t.saved)}</b> still unspent. <a href="#/planner">Open the planner →</a></div></section>`;
}

export function goalsView(state) {
  return `
  <div class="topbar"><div><h1>Savings goals</h1><p>${money0(state.goals.reduce((s, g) => s + g.saved, 0))} saved across ${state.goals.length} goals · Every dollar is in the Chase Savings account.</p></div></div>
  <div class="grid">${state.goals.map((g) => {
    const pct = Math.round((g.saved / g.target) * 100);
    return `<section class="card"><div class="goal-head"><b>${esc(g.name)}</b><span><b>${money0(g.saved)}</b> <span class="muted">of ${money0(g.target)}</span></span></div>
    <p class="goal-note">${esc(g.note)}</p>
    <div class="bar-track"><span class="bar-fill" style="display:block;width:${Math.min(100, pct)}%"></span></div>
    <p style="font-size:13px;margin-top:6px">${pct}% there · <b>${money0(g.target - g.saved)}</b> to go</p>
    <div class="goal-actions">
      <button class="btn small" data-action="goal-add" data-id="${g.id}" data-amt="50">+ $50</button>
      <button class="btn small" data-action="goal-add" data-id="${g.id}" data-amt="100">+ $100</button>
      <button class="btn small ghost" data-action="goal-add" data-id="${g.id}" data-amt="250">+ $250</button>
    </div></section>`;
  }).join('')}</div>
  <section class="card"><h2>Why goals first</h2><p class="card-sub">The $1,200 payday transfer moves before any spending happens — that is why the emergency fund is at 79% while dining still ran over. Pay yourself first, then budget what is left.</p></section>`;
}

export function billsView(state) {
  const due = state.bills.filter((b) => !b.paid);
  const paid = state.bills.filter((b) => b.paid);
  const dueTotal = due.reduce((s, b) => s + b.amount, 0);
  return `
  <div class="topbar"><div><h1>Bills &amp; recurring</h1><p>${due.length} bills due in December · ${money0(dueTotal)} coming up · ${paid.length} already marked paid.</p></div></div>
  <section class="card"><h2>Due in December</h2><p class="card-sub">Mark a bill paid when it clears — it moves to the paid list and off the dashboard.</p>
  ${due.map((b) => `<div class="bill"><div><div class="b-name">${esc(b.name)}</div><div class="b-meta">Due ${b.due} · ${catById[b.category].label} · ${b.autopay ? 'Autopay on' : 'Pay manually'}</div></div>
  <span style="display:flex;gap:8px;align-items:center"><b>${money(b.amount)}</b><button class="btn small" data-action="pay-bill" data-id="${b.id}">Mark paid</button></span></div>`).join('') || '<p class="empty">All bills are paid. Nice work.</p>'}</section>
  ${paid.length ? `<section class="card"><h2>Paid</h2>${paid.map((b) => `<div class="bill"><div><div class="b-name">${esc(b.name)}</div><div class="b-meta">Paid · ${catById[b.category].label}</div></div><b>${money(b.amount)}</b></div>`).join('')}</section>` : ''}
  <section class="card"><h2>Recurring, every month</h2><p class="card-sub">Rent, energy, internet, phone and insurance never surprise this household: each has a due date, an amount and an autopay setting above. Subscriptions (Spotify $11.99, Netflix $15.49 from December) sit inside Entertainment so they are judged with the fun money, not hidden.</p></section>`;
}

export function reportsView(state) {
  const t = totals(state.txns[state.month]);
  const needs = ['housing', 'groceries', 'transport', 'utilities', 'health', 'kids'].reduce((s, id) => s + (t.byCat[id] || 0), 0);
  const wants = ['dining', 'entertainment', 'shopping', 'personal'].reduce((s, id) => s + (t.byCat[id] || 0), 0);
  const byCat = CATEGORIES.map((c) => ({ label: c.label, value: t.byCat[c.id] || 0, color: c.color }))
    .filter((p) => p.value > 0).sort((a, b) => b.value - a.value);
  return `
  <div class="topbar"><div><h1>Reports — ${state.monthLabel}</h1><p>Five months of spending, the category split, and what to do about it.</p></div></div>
  <div class="grid">
    <section class="card"><h2>Spending trend</h2><p class="card-sub">Total outgoings, July to November. October was a quiet month — November is back to normal.</p>${bars(TREND)}</section>
    <section class="card"><h2>50 / 30 / 20 check</h2><p class="card-sub">Needs, wants and savings as a share of ${money0(t.income)} income.</p>
      <div class="plan-out">Needs <b>${money0(needs)}</b> — ${Math.round((needs / t.income) * 100)}% (target 50%)<br>
      Wants <b>${money0(wants)}</b> — ${Math.round((wants / t.income) * 100)}% (target 30%)<br>
      Saved + unspent <b>${money0(t.saved + (t.income - t.spent - t.saved))}</b> — ${Math.round(((t.saved + (t.income - t.spent - t.saved)) / t.income) * 100)}% (target 20%)</div>
      <p style="font-size:13.5px;margin-top:8px">Wants are far under target because the family cooks most nights. The spare room goes to the car fund, not to lifestyle creep.</p></section>
  </div>
  <section class="card"><h2>Category breakdown</h2><p class="card-sub">Every dollar of the ${money0(t.spent)} spent, ranked.</p>
    <div class="donut-wrap">${donut(byCat.slice(0, 6), 168, t.spent, `spent in ${state.month === '2026-11' ? 'Nov' : 'Oct'}`)}
    <div class="legend" style="flex:1">${byCat.map((p) => `<span class="li"><span class="sw" style="background:${p.color}"></span>${p.label}<span class="lv">${money0(p.value)} · ${Math.round((p.value / t.spent) * 100)}%</span></span>`).join('')}</div></div></section>
  <section class="card"><h2>What the numbers say</h2>
    ${TIPS.map((tip, i) => `<div class="tip ${i === 0 ? 'warn' : ''}"><b>${esc(tip.title)}</b>${esc(tip.body)}</div>`).join('')}</section>`;
}

export function plannerView(state) {
  const p = state.planner;
  const needs = Math.round((p.income * p.needs) / 100);
  const wants = Math.round((p.income * p.wants) / 100);
  const save = p.income - needs - wants;
  return `
  <div class="topbar"><div><h1>Paycheck planner</h1><p>Split any income with the 50 / 30 / 20 rule — drag the sliders and the plan updates.</p></div></div>
  <section class="card"><h2>Your split</h2><p class="card-sub">Start from the Alvarez income of $7,240, or type your own.</p>
  <div class="toolbar"><label style="font-weight:700;font-size:13px">Monthly take-home pay $ <input data-input="plan-income" type="number" min="500" step="10" value="${p.income}" style="width:120px"></label></div>
  <div class="slider-row"><b>Needs — ${p.needs}%</b><input data-input="plan-needs" type="range" min="30" max="70" value="${p.needs}"><b>${money0(needs)} / mo</b></div>
  <div class="slider-row"><b>Wants — ${p.wants}%</b><input data-input="plan-wants" type="range" min="10" max="50" value="${p.wants}"><b>${money0(wants)} / mo</b></div>
  <div class="slider-row"><b>Save — ${100 - p.needs - p.wants}%</b><span class="bar-track"><span class="bar-fill" style="display:block;width:${100 - p.needs - p.wants}%"></span></span><b>${money0(save)} / mo</b></div>
  <div class="plan-out" style="margin-top:10px">On <b>${money0(p.income)}</b> a month: <b>${money0(needs)}</b> for needs (rent, groceries, bills, transport), <b>${money0(wants)}</b> for wants (eating out, fun, clothes), <b>${money0(save)}</b> saved. Over a year that is <b>${money0(save * 12)}</b> in savings — enough to finish the emergency fund and start the car fund.</div></section>
  <section class="card"><h2>Make it stick</h2><p class="card-sub">Three rules the Alvarez family actually follows.</p>
  <div class="tip"><b>1 · Pay yourself first</b>The $1,200 transfer leaves on payday, before the money can be spent. Willpower never gets a vote.</div>
  <div class="tip"><b>2 · One fun budget, not ten</b>Dining, movies and music share one “wants” number. When it is gone, the month cooks at home.</div>
  <div class="tip"><b>3 · Review on the 1st, for ten minutes</b>Open this page, check the three numbers above, move any leftover to a goal. That is the whole meeting.</div></section>`;
}
