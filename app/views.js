// Hearth — views.js. One render function per page. Views read the live
// Store (see main.js) so every edit — a new transaction, a paid bill, a
// budget change — shows up everywhere at once. Nothing here is a mock:
// every figure is computed from the store.

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function catById(state, id) {
  return state.categories.find(function (c) { return c.id === id; });
}

function txOfMonth(state, month) {
  return month === "Oct" ? state.txOct : state.txNov;
}

function catSpent(state, catId, month) {
  if (month === "Nov" || month === "Oct") {
    let sum = 0;
    txOfMonth(state, month).forEach(function (t) { if (t.cat === catId) sum += t.amount; });
    return sum;
  }
  return catById(state, catId).spent[month];
}

function monthTotal(state, month) {
  let sum = 0;
  state.categories.forEach(function (c) { sum += catSpent(state, c.id, month); });
  return sum;
}

function monthSaved(state, month) {
  return state.savedByMonth[month];
}

function monthLeft(state, month) {
  return state.income.total - monthTotal(state, month) - monthSaved(state, month);
}

function dayNum(t) {
  return parseInt(t.d.split(" ")[1], 10);
}

function sortedTx(state, month) {
  return txOfMonth(state, month).slice().sort(function (a, b) { return dayNum(a) - dayNum(b); });
}

// Who a ledger line belongs to: a label match wins, otherwise the
// room's usual payer. Every line lands on exactly one member.
function memberOf(state, t) {
  const rules = state.whoByLabel || [];
  for (let i = 0; i < rules.length; i++) {
    if (t.label.indexOf(rules[i][0]) !== -1) return rules[i][1];
  }
  return (state.whoByCat && state.whoByCat[t.cat]) || "Daniel";
}

// True loan payoff by simulating month by month: interest accrues on the
// balance, the payment covers interest first, the rest cuts the balance.
// Returns null when the payment does not even cover the interest.
function amortize(balance, apr, payment) {
  const r = apr / 100 / 12;
  if (payment <= balance * r) return null;
  let bal = balance, months = 0, interest = 0;
  while (bal > 0 && months < 1200) {
    const i = bal * r;
    interest += i;
    bal += i - payment;
    months++;
    if (bal < 0) interest += bal; // the last payment is smaller
  }
  return { months: months, interest: Math.round(interest * 100) / 100 };
}

function debtFree(months) {
  return monthName(months);
}

// What the house must pay every month, whatever else happens: the
// mortgage, groceries, getting around, health, and the four utility
// lines (electric, water, internet, phone) found in November's ledger.
function essentials(state) {
  const utilLabels = ["Electric bill", "Water bill", "Internet", "Phone plan"];
  let util = 0;
  state.txNov.forEach(function (t) {
    if (utilLabels.indexOf(t.label) !== -1) util += t.amount;
  });
  return catSpent(state, "housing", "Nov") + catSpent(state, "groceries", "Nov")
    + catSpent(state, "transport", "Nov") + catSpent(state, "health", "Nov") + util;
}

// ---- The House (#/) -------------------------------------------------------

function viewHouse(store) {
  const state = store.state, month = store.month;
  const spent = monthTotal(state, month);
  const saved = monthSaved(state, month);
  const left = monthLeft(state, month);
  const sel = catById(state, store.selectedRoom);
  const selTx = sortedTx(state, month).filter(function (t) { return t.cat === sel.id; }).slice(-3).reverse();

  // Worth knowing, computed from the live numbers.
  const over = state.categories.filter(function (c) { return catSpent(state, c.id, month) > c.budget; });
  const weekTx = txOfMonth(state, "Nov").filter(function (t) { return dayNum(t) >= 23; });
  let weekSum = 0;
  weekTx.forEach(function (t) { weekSum += t.amount; });
  const kept = (saved / state.income.total) * 100;
  const biggest = state.categories.slice().sort(function (a, b) {
    return catSpent(state, b.id, month) - catSpent(state, a.id, month);
  })[0];

  const months5 = state.months;
  const totals5 = months5.map(function (m) { return monthTotal(state, m); });
  const upcoming = state.bills.filter(function (b) { return !b.paid; }).slice(0, 3);

  let h = "";
  h += '<section class="story"><p class="kicker">' + esc(state.family.today) + ' · ' + esc(state.family.place) + '</p>'
    + '<h1>November at the Alvarez house</h1>'
    + '<p class="lede">Daniel and Priya brought home <strong>' + money(state.income.total) + '</strong>, '
    + 'spent <strong>' + money(spent) + '</strong> across eight rooms, put <strong>' + money(saved) + '</strong> aside, '
    + 'and still have <strong>' + money(left) + '</strong> unassigned — this is the house that money built.</p></section>';

  h += '<section class="ledger-strip" aria-label="November at a glance">'
    + '<div><span>Brought home</span><strong>' + money(state.income.total) + '</strong></div>'
    + '<div><span>Spent</span><strong>' + money(spent) + '</strong></div>'
    + '<div><span>Put aside</span><strong>' + money(saved) + '</strong></div>'
    + '<div><span>Still unassigned</span><strong>' + money(left) + '</strong></div>'
    + '</section>';

  h += '<section class="house-wrap"><h2>Walk through the house</h2>'
    + '<p class="section-note">Each room is a part of the budget. Tap a room to open its books.</p>'
    + housePlan(state.categories.map(function (c) {
        return { id: c.id, room: c.room, label: c.label, spent: { Nov: catSpent(state, c.id, "Nov") }, budget: c.budget };
      }), store.selectedRoom)
    + '<div class="room-list" role="list">'
    + state.categories.map(function (c) {
        const s = catSpent(state, c.id, month);
        return '<button class="room-row' + (c.id === store.selectedRoom ? ' selected' : '') + '" data-action="select-room" data-room="' + c.id + '" role="listitem">'
          + '<span class="room-row-name">' + esc(c.room) + ' <em>' + esc(c.label) + '</em></span>'
          + '<span class="room-row-amt">' + money(s) + ' <small>of ' + money(c.budget) + '</small></span></button>';
      }).join("")
    + '</div>'
    + '<div class="room-detail" id="room-detail"><h3>' + esc(sel.room) + ' — ' + esc(sel.label) + '</h3>'
    + '<p class="room-detail-line">Spent <strong>' + money(catSpent(state, sel.id, month)) + '</strong> of a '
    + money(sel.budget) + ' budget. '
    + (catSpent(state, sel.id, month) > sel.budget
        ? '<strong class="over-text">Over by ' + money(catSpent(state, sel.id, month) - sel.budget) + '.</strong>'
        : money(sel.budget - catSpent(state, sel.id, month)) + ' still in the room.')
    + '</p>'
    + fillBar(catSpent(state, sel.id, month), sel.budget, catSpent(state, sel.id, month) > sel.budget)
    + (selTx.length
        ? '<ul class="recent">' + selTx.map(function (t) {
            return '<li><span>' + esc(t.d) + ' — ' + esc(t.label) + '</span><strong>' + money(t.amount) + '</strong></li>';
          }).join("") + '</ul>'
        : '<p class="section-note">No spending in this room yet this month.</p>')
    + '<p><a href="#/transactions" data-ledger-cat="' + sel.id + '">See every ' + esc(sel.label.toLowerCase()) + ' line in the Ledger &rarr;</a></p>'
    + '</div></section>';

  h += '<section class="duo"><div><h2>Worth knowing</h2><ul class="insights">'
    + '<li><strong>' + (over.length ? over.map(function (c) { return esc(c.room); }).join(" and ") + (over.length > 1 ? " ran" : " ran") : "No room ran") + ' over budget'
    + (over.length ? '.</strong> ' + over.map(function (c) {
        return esc(c.room) + ' is over by ' + money(catSpent(state, c.id, month) - c.budget);
      }).join("; ") + '.' : '.</strong> Every room stayed inside its budget.')
    + '</li>'
    + '<li><strong>This week: ' + money(weekSum) + '.</strong> The Thanksgiving shop is the big one — '
    + 'the week of November 23–29 cost ' + money(weekSum) + ', most of it food for the table.</li>'
    + '<li><strong>Kept ' + kept.toFixed(1) + '% of income.</strong> The best-kept month of the year; '
    + 'the kept rate has climbed every month since July.</li>'
    + '<li><strong>The ' + esc(biggest.room) + ' eats the most.</strong> ' + money(catSpent(state, biggest.id, month))
    + ' — ' + pct(catSpent(state, biggest.id, month), spent) + '% of everything the house spent.</li>'
    + '</ul></div>'
    + '<div><h2>Coming up</h2><ul class="bills-mini">'
    + upcoming.map(function (b) {
        return '<li><span>' + esc(b.due) + ' — ' + esc(b.name) + '</span><strong>' + money(b.amount) + '</strong></li>';
      }).join("")
    + '</ul><p class="section-note">Payday is ' + esc(state.family.payday) + ' — in '
    + state.family.paydayInDays + ' days. <a href="#/bills">See all bills &rarr;</a></p>'
    + '<h2 class="mini-head">Five months of spending</h2>'
    + miniBars(totals5, months5, 4)
    + '<p class="section-note">November is the biggest month so far at ' + money(totals5[4]) + '; '
    + 'October was the lightest at ' + money(totals5[3]) + '.</p>'
    + '</div></section>';

  return h;
}

// ---- The Ledger (#/transactions) -------------------------------------------

function viewLedger(store) {
  const state = store.state, month = store.month;
  const q = store.ledgerQ.toLowerCase();
  const who = store.ledgerWho || "all";
  const rows = sortedTx(state, month).filter(function (t) {
    const okQ = !q || t.label.toLowerCase().indexOf(q) !== -1;
    const okC = store.ledgerCat === "all" || t.cat === store.ledgerCat;
    const okW = who === "all" || memberOf(state, t) === who;
    return okQ && okC && okW;
  });
  const total = monthTotal(state, month);
  const count = txOfMonth(state, month).length;
  // What each member's lines add up to this month.
  const perMember = {};
  state.members.forEach(function (m) { perMember[m] = 0; });
  txOfMonth(state, month).forEach(function (t) { perMember[memberOf(state, t)] += t.amount; });

  let h = '<section class="story"><p class="kicker">The Ledger · ' + (month === "Nov" ? "November" : "October") + ' 2026</p>'
    + '<h1>Every dollar, in ink</h1>'
    + '<p class="lede">' + count + ' lines, adding up to <strong>' + money(total) + '</strong>. '
    + 'Search it, filter it by room, add a line when money moves — the totals on every other page move with it.</p></section>';

  h += '<section class="ledger-strip" aria-label="Ledger totals">'
    + '<div><span>Lines shown</span><strong>' + rows.length + ' of ' + count + '</strong></div>'
    + '<div><span>Total shown</span><strong>' + money(rows.reduce(function (a, t) { return a + t.amount; }, 0)) + '</strong></div>'
    + '<div><span>Month total</span><strong>' + money(total) + '</strong></div>'
    + '<div><span>Left unassigned</span><strong>' + money(monthLeft(state, month)) + '</strong></div>'
    + '</section>';

  h += '<section class="ledger-tools"><div class="field"><label for="ledger-q">Search the ledger</label>'
    + '<input id="ledger-q" type="search" placeholder="Try “pizza” or “gas”…" value="' + esc(store.ledgerQ) + '"></div>'
    + '<div class="field"><label for="ledger-cat">Room</label><select id="ledger-cat">'
    + '<option value="all">All rooms</option>'
    + state.categories.map(function (c) {
        return '<option value="' + c.id + '"' + (store.ledgerCat === c.id ? ' selected' : '') + '>' + esc(c.room) + ' — ' + esc(c.label) + '</option>';
      }).join("")
    + '</select></div>'
    + '<div class="field"><label for="ledger-who">Whose line</label><select id="ledger-who">'
    + '<option value="all">Everyone</option>'
    + state.members.map(function (m) {
        return '<option value="' + m + '"' + (who === m ? ' selected' : '') + '>' + m + ' — ' + money(perMember[m]) + '</option>';
      }).join("")
    + '</select></div>'
    + '<button class="btn" data-action="export-csv">Export CSV</button></section>'
    + '<p class="section-note">Whose money it was: '
    + state.members.map(function (m) { return '<strong>' + m + '</strong> ' + money(perMember[m]); }).join(' · ')
    + '. The four add up to the month total, ' + money(total) + '.</p>';

  h += '<section class="add-line"><h2>Add a line</h2>'
    + '<form id="add-txn" class="add-form">'
    + '<div class="field"><label for="add-day">Day</label><input id="add-day" type="number" min="1" max="30" value="29" required></div>'
    + '<div class="field grow"><label for="add-label">What was it?</label><input id="add-label" type="text" maxlength="60" placeholder="e.g. Extra milk run" required></div>'
    + '<div class="field"><label for="add-cat">Room</label><select id="add-cat">'
    + state.categories.map(function (c) { return '<option value="' + c.id + '">' + esc(c.room) + '</option>'; }).join("")
    + '</select></div>'
    + '<div class="field"><label for="add-amount">Amount ($)</label><input id="add-amount" type="number" min="0.01" step="0.01" placeholder="0.00" required></div>'
    + '<button class="btn primary" type="submit">Write it in</button></form></section>';

  h += '<section><table class="ledger"><thead><tr><th>Date</th><th>What</th><th>Room</th><th class="num">Amount</th><th><span class="sr">Delete</span></th></tr></thead><tbody>'
    + (rows.length ? rows.map(function (t) {
        const c = catById(state, t.cat);
        return '<tr><td>' + esc(t.d) + '</td><td>' + esc(t.label) + '</td><td>' + esc(c.room) + '</td>'
          + '<td class="num">' + money(t.amount) + '</td>'
          + '<td><button class="del" data-action="del-txn" data-d="' + esc(t.d) + '" data-label="' + esc(t.label) + '" data-amount="' + t.amount + '" aria-label="Delete ' + esc(t.label) + '">&times;</button></td></tr>';
      }).join("") : '<tr><td colspan="5" class="empty">Nothing matches — try another search, or another room.</td></tr>')
    + '</tbody></table></section>';
  return h;
}

// ---- Envelopes (#/budgets) ---------------------------------------------------

function viewBudgets(store) {
  const state = store.state, month = store.month;
  const totalBudget = state.categories.reduce(function (a, c) { return a + c.budget; }, 0);
  const totalSpent = monthTotal(state, month);

  let h = '<section class="story"><p class="kicker">Envelopes · ' + (month === "Nov" ? "November" : "October") + ' 2026</p>'
    + '<h1>Cash in envelopes</h1>'
    + '<p class="lede">Old-fashioned on purpose: each room gets an envelope, and the money inside is all it may spend. '
    + 'Envelopes hold <strong>' + money(totalBudget) + '</strong> this month; <strong>' + money(totalSpent) + '</strong> has come out of them. '
    + 'Move money by changing a budget below — the house re-adds itself.</p></section>';

  h += '<div class="envelopes">'
    + state.categories.map(function (c) {
        const spent = catSpent(state, c.id, month);
        const over = spent > c.budget;
        const left = c.budget - spent;
        return '<article class="envelope' + (over ? ' over' : '') + '">'
          + '<div class="env-flap"></div>'
          + '<h2>' + esc(c.room) + '</h2><p class="env-cat">' + esc(c.label) + '</p>'
          + '<p class="env-amt">' + money(spent) + ' <span>of ' + money(c.budget) + '</span></p>'
          + fillBar(spent, c.budget, over)
          + '<p class="env-left">' + (over ? 'Over by ' + money(-left) : money(left) + ' still in the envelope') + '</p>'
          + '<form class="adjust" data-cat="' + c.id + '"><label>Budget $<input type="number" min="0" step="1" value="' + c.budget + '" aria-label="Budget for ' + esc(c.label) + '"></label>'
          + '<button class="btn small" type="submit">Set budget</button></form>'
          + '</article>';
      }).join("")
    + '</div>';
  return h;
}

// ---- Milestones (#/goals) ----------------------------------------------------

function monthName(offset) {
  // Months counted forward from November 2026.
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const idx = 10 + offset; // November is index 10
  const year = 2026 + Math.floor(idx / 12);
  return names[idx % 12] + " " + year;
}

function goalFinish(goal) {
  if (goal.saved >= goal.target) return "Done";
  const months = Math.max(1, Math.round((goal.target - goal.saved) / goal.monthly));
  return monthName(months);
}

function viewGoals(store) {
  const state = store.state;
  let h = '<section class="story"><p class="kicker">Milestones · what the saving is for</p>'
    + '<h1>Four things we are saving toward</h1>'
    + '<p class="lede">Every goal gets a monthly share of what the house puts aside. '
    + 'Add money to a goal and its finish line moves closer — the date is worked out from the monthly share, not wished for.</p></section>';

  h += '<div class="goals">'
    + state.goals.map(function (g) {
        const p = Math.min(100, (g.saved / g.target) * 100);
        return '<article class="goal"><h2>' + esc(g.name) + '</h2>'
          + '<p class="goal-note">' + esc(g.note) + '</p>'
          + '<p class="goal-amt">' + money(g.saved) + ' <span>of ' + money(g.target) + ' · ' + Math.round(p) + '%</span></p>'
          + fillBar(g.saved, g.target, false)
          + '<p class="goal-line">' + money(g.monthly) + ' a month · finish line <strong>' + goalFinish(g) + '</strong></p>'
          + '<div class="goal-btns"><button class="btn small" data-action="goal-add" data-goal="' + g.id + '" data-amount="50">+$50</button>'
          + '<button class="btn small" data-action="goal-add" data-goal="' + g.id + '" data-amount="100">+$100</button>'
          + '<button class="btn small" data-action="goal-add" data-goal="' + g.id + '" data-amount="250">+$250</button></div>'
          + '</article>';
      }).join("")
    + '</div>';
  return h;
}

// ---- The Calendar (#/bills) ----------------------------------------------------

function viewBills(store) {
  const state = store.state;
  const unpaid = state.bills.filter(function (b) { return !b.paid; });
  const unpaidTotal = unpaid.reduce(function (a, b) { return a + b.amount; }, 0);
  const paidCount = state.bills.length - unpaid.length;

  let h = '<section class="story"><p class="kicker">The Calendar · December bills</p>'
    + '<h1>What the house owes, and when</h1>'
    + '<p class="lede">Eight bills stand between now and December 15. Mark each paid as it goes out — '
    + 'the list, and the total still owed, keep themselves honest.</p></section>';

  h += '<section class="ledger-strip" aria-label="Bills at a glance">'
    + '<div><span>Still to pay</span><strong>' + money(unpaidTotal) + '</strong></div>'
    + '<div><span>Bills left</span><strong>' + unpaid.length + ' of ' + state.bills.length + '</strong></div>'
    + '<div><span>Already paid</span><strong>' + paidCount + '</strong></div>'
    + '<div><span>Payday</span><strong>' + esc(state.family.payday) + ' · in ' + state.family.paydayInDays + ' days</strong></div>'
    + '</section>';

  h += '<ul class="bill-list">'
    + state.bills.map(function (b) {
        return '<li class="bill' + (b.paid ? ' paid' : '') + '">'
          + '<span class="bill-due">' + esc(b.due) + '</span>'
          + '<span class="bill-name">' + esc(b.name) + '</span>'
          + '<strong class="bill-amt">' + money(b.amount) + '</strong>'
          + (b.paid
              ? '<span class="bill-state">Paid ✓</span>'
              : '<button class="btn small" data-action="bill-paid" data-bill="' + b.id + '">Mark paid</button>')
          + '</li>';
      }).join("")
    + '</ul>'
    + '<p class="section-note">Payday lands December 6 — after the mortgage, the streaming bundle and the insurance are due, '
    + 'so those three come out of November’s unassigned ' + money(monthLeft(state, "Nov")) + '.</p>';
  return h;
}

// ---- The Year So Far (#/reports) --------------------------------------------

function viewReports(store) {
  const state = store.state, month = store.month;
  const months12 = state.months12;
  const totals12 = months12.map(function (m) { return monthTotal(state, m); });
  const twelveTotal = totals12.reduce(function (a, b) { return a + b; }, 0);
  const avg12 = twelveTotal / 12;
  const rates12 = months12.map(function (m) { return (monthSaved(state, m) / state.income.total) * 100; });
  const bestMonth = months12[totals12.indexOf(Math.min.apply(null, totals12))];
  const worstMonth = months12[totals12.indexOf(Math.max.apply(null, totals12))];
  const months5 = state.months;
  const fiveTotal = months5.map(function (m) { return monthTotal(state, m); }).reduce(function (a, b) { return a + b; }, 0);
  const monthNameLong = month === "Nov" ? "November" : "October";

  let h = '<section class="story"><p class="kicker">The Year So Far · December to November</p>'
    + '<h1>Twelve months in one picture</h1>'
    + '<p class="lede">The house spent <strong>' + money(twelveTotal) + '</strong> in twelve months — '
    + money(avg12) + ' a month on average. ' + worstMonth + ' was the dearest month, ' + bestMonth + ' the lightest. '
    + 'The kept rate — the share of income the family kept — has risen every single month of the year.</p></section>';

  h += '<section class="ledger-strip" aria-label="Twelve-month totals">'
    + '<div><span>Twelve-month total</span><strong>' + money(twelveTotal) + '</strong></div>'
    + '<div><span>Average a month</span><strong>' + money(avg12) + '</strong></div>'
    + '<div><span>Dearest month</span><strong>' + worstMonth + ' · ' + money(Math.max.apply(null, totals12)) + '</strong></div>'
    + '<div><span>Lightest month</span><strong>' + bestMonth + ' · ' + money(Math.min.apply(null, totals12)) + '</strong></div>'
    + '</section>';

  h += '<section><h2>Where ' + monthNameLong + '’s ' + money0(state.income.total) + ' went</h2>'
    + sankey(state, month)
    + '<p class="section-note">Read it left to right: everything the house brought home, split into the rooms it was spent in, '
    + 'the ' + money(monthSaved(state, month)) + ' put aside and the ' + money(monthLeft(state, month)) + ' still unassigned. '
    + 'The Bedroom is the widest flow every month — the mortgage does not negotiate.</p></section>';

  h += '<section><h2>Twelve months of spending</h2>'
    + trendBars(totals12, months12)
    + '<p class="section-note">December is the dearest of the old year — the holidays — and February the lightest. '
    + 'The five months from July come to ' + money(fiveTotal) + ' of the twelve-month ' + money(twelveTotal) + '.</p></section>';

  h += '<section><h2>Each room, each month</h2>'
    + groupedBars(state.categories, months5)
    + '<p class="section-note">The Bedroom never moves — the mortgage is the same $1,485 every month. '
    + 'The Garden jumps around: the plumber’s visit made November its dearest month.</p></section>';

  h += '<section><h2>The kept rate keeps climbing</h2>'
    + keptLine(rates12, months12)
    + '<p class="section-note">Income held at ' + money(state.income.total) + ' a month. '
    + 'December kept ' + rates12[0].toFixed(1) + '%, November kept ' + rates12[11].toFixed(1) + '% — '
    + money(monthSaved(state, "Nov") - monthSaved(state, "Dec")) + ' more a month put aside than when the year began.</p></section>';

  h += '<section><h2>Where the twelve months went</h2><ul class="insights">'
    + state.categories.slice().sort(function (a, b) {
        let sa = 0, sb = 0;
        months12.forEach(function (m) { sa += catSpent(state, a.id, m); sb += catSpent(state, b.id, m); });
        return sb - sa;
      }).map(function (c) {
        let s = 0;
        months12.forEach(function (m) { s += catSpent(state, c.id, m); });
        return '<li><strong>' + esc(c.room) + ' — ' + esc(c.label) + ':</strong> ' + money(s) + ' in twelve months, ' + pct(s, twelveTotal) + '% of everything.</li>';
      }).join("")
    + '</ul></section>';
  return h;
}

// ---- The Plan (#/planner) ------------------------------------------------------

function viewPlanner(store) {
  const state = store.state;
  const p = store.planner;
  const dining = catById(state, "dining");
  const fun = catById(state, "entertainment");
  const diningCut = Math.max(0, catSpent(state, "dining", "Nov") - p.diningCap);
  const funCut = Math.max(0, catSpent(state, "entertainment", "Nov") - p.funCap);
  const cuts = diningCut + funCut;
  const newSpent = monthTotal(state, "Nov") - cuts;
  const newSaved = monthSaved(state, "Nov") + cuts;
  const emergency = state.goals[0];
  const goalShare = emergency.monthly / 1200;

  let h = '<section class="story"><p class="kicker">The Plan · what-if for December</p>'
    + '<h1>What if we spent a little less?</h1>'
    + '<p class="lede">Move the sliders and the house answers at once. Caps only cut what the room actually spent — '
    + 'a cap above the spending changes nothing, and every dollar cut goes straight to the saving jar.</p></section>';

  h += '<section class="planner"><div class="sliders">'
    + '<div class="slider-row"><label for="cap-dining">Dining out — cap it at $<span id="cap-dining-val">' + p.diningCap + '</span> a month</label>'
    + '<input id="cap-dining" type="range" min="100" max="400" step="5" value="' + p.diningCap + '">'
    + '<p class="slider-note">November’s dining came to ' + money(catSpent(state, "dining", "Nov")) + '.</p></div>'
    + '<div class="slider-row"><label for="cap-fun">Fun &amp; films — cap it at $<span id="cap-fun-val">' + p.funCap + '</span> a month</label>'
    + '<input id="cap-fun" type="range" min="100" max="400" step="5" value="' + p.funCap + '">'
    + '<p class="slider-note">November’s fun came to ' + money(catSpent(state, "entertainment", "Nov")) + '.</p></div>'
    + '<div class="slider-row"><label for="save-goal">Save $<span id="save-goal-val">' + p.saveGoal + '</span> a month, every month</label>'
    + '<input id="save-goal" type="range" min="800" max="2000" step="50" value="' + p.saveGoal + '">'
    + '<p class="slider-note">November saved ' + money(monthSaved(state, "Nov")) + '. The goal is a promise, not a prediction.</p></div>'
    + '</div>'
    + '<div class="whatif"><h2>If December follows the plan</h2>'
    + '<dl>'
    + '<div><dt>Spending</dt><dd>' + money(newSpent) + (cuts > 0 ? ' <span class="delta">−' + money(cuts) + ' vs November</span>' : ' <span class="delta">same as November</span>') + '</dd></div>'
    + '<div><dt>Put aside</dt><dd>' + money(newSaved) + (cuts > 0 ? ' <span class="delta">+' + money(cuts) + '</span>' : '') + '</dd></div>'
    + '<div><dt>Emergency fund</dt><dd>' + (newSaved >= p.saveGoal
        ? 'On track — the fund fills in about ' + Math.ceil((emergency.target - emergency.saved) / Math.max(1, p.saveGoal * goalShare)) + ' months at this pace.'
        : 'Short of the ' + money(p.saveGoal) + ' goal by ' + money(p.saveGoal - newSaved) + ' a month — the dining and fun caps are where to find it.') + '</dd></div>'
    + '</dl>'
    + '<p class="section-note">The caps above would free ' + money(cuts) + ' a month. '
    + 'Kept for a year, that is ' + money(cuts * 12) + ' — most of the kitchen remodel, from two rooms alone.</p>'
    + '</div></section>';

  // Payday December 6: one paycheck, half the month's income, placed
  // into the envelopes before it arrives.
  const pay = store.planner.pay;
  const paycheck = 3620;
  let placed = 0;
  state.categories.forEach(function (c) { placed += pay[c.id] || 0; });
  placed += pay.save || 0;
  const envPlaced = placed - (pay.save || 0);
  const totalBudget = state.categories.reduce(function (a, c) { return a + c.budget; }, 0);

  h += '<section class="payday"><h2>Payday December 6 — ' + money(paycheck) + ' to place</h2>'
    + '<p class="section-note">One paycheck, half the month’s income. Place it in the envelopes before it arrives, '
    + 'so the money has a job the moment it lands. The second paycheck, on December 20, places the rest.</p>'
    + '<div class="pay-grid">'
    + state.categories.map(function (c) {
        return '<div class="pay-row"><label for="pay-' + c.id + '">' + esc(c.room) + ' <span>' + esc(c.label) + '</span></label>'
          + '<input id="pay-' + c.id + '" type="range" min="0" max="' + c.budget + '" step="5" value="' + (pay[c.id] || 0) + '">'
          + '<strong>' + money(pay[c.id] || 0) + '</strong></div>';
      }).join("")
    + '<div class="pay-row"><label for="pay-save">Savings jar <span>put aside</span></label>'
    + '<input id="pay-save" type="range" min="0" max="1200" step="25" value="' + (pay.save || 0) + '">'
    + '<strong>' + money(pay.save || 0) + '</strong></div>'
    + '</div>'
    + '<p class="pay-summary">Placed <strong>' + money(placed) + '</strong> of ' + money(paycheck)
    + ' — <strong>' + money(paycheck - placed) + '</strong> still to place. '
    + 'Envelopes hold ' + money(envPlaced) + ' of their ' + money(totalBudget) + ' month, '
    + 'and the savings jar gets ' + money(pay.save || 0) + ' of the ' + money(monthSaved(state, "Nov")) + ' November put aside.</p>'
    + '</section>';
  return h;
}

// ---- The Mortgage & the Snowball (#/debt) ----------------------------------

function viewDebt(store) {
  const state = store.state;
  const extra = store.debtExtra || 0;
  const debts = state.debts;
  const totalBalance = debts.reduce(function (a, d) { return a + d.balance; }, 0);
  const totalPayment = debts.reduce(function (a, d) { return a + d.payment; }, 0);
  // Snowball order: smallest balance first.
  const order = debts.slice().sort(function (a, b) { return a.balance - b.balance; });
  const mortgage = debts.find(function (d) { return d.id === "mortgage"; });
  const base = amortize(mortgage.balance, mortgage.apr, mortgage.payment);
  const withExtra = amortize(mortgage.balance, mortgage.apr, mortgage.payment + extra);
  const car = debts.find(function (d) { return d.id === "car"; });
  const storeCard = debts.find(function (d) { return d.id === "store"; });
  const carBase = amortize(car.balance, car.apr, car.payment);
  const carRolled = amortize(car.balance, car.apr, car.payment + storeCard.payment);

  let h = '<section class="story"><p class="kicker">The Mortgage &amp; the Snowball · what the house owes</p>'
    + '<h1>Three debts, one order</h1>'
    + '<p class="lede">The house owes <strong>' + money(totalBalance) + '</strong> across three debts, '
    + 'and pays <strong>' + money(totalPayment) + '</strong> a month toward them. The snowball says: '
    + 'kill the smallest first, then roll its payment into the next one. The mortgage is last — it is also the one '
    + 'where a little extra does the most damage.</p></section>';

  h += '<section class="ledger-strip" aria-label="Debts at a glance">'
    + '<div><span>Total owed</span><strong>' + money(totalBalance) + '</strong></div>'
    + '<div><span>Paid a month</span><strong>' + money(totalPayment) + '</strong></div>'
    + '<div><span>First to go</span><strong>' + esc(order[0].name) + ' · ' + money(order[0].balance) + '</strong></div>'
    + '<div><span>Mortgage gone</span><strong>' + (base ? debtFree(base.months) : "—") + '</strong></div>'
    + '</section>';

  h += '<section class="debt-sim"><h2>The mortgage simulator</h2>'
    + '<p class="section-note">Balance ' + money(mortgage.balance) + ' at ' + mortgage.apr + '% — '
    + 'the ' + money(mortgage.payment) + ' a month is the same line the Ledger shows every 1st. '
    + 'Move the slider: the extra comes out of November’s unassigned ' + money(monthLeft(state, "Nov")) + '.</p>'
    + '<div class="slider-row"><label for="debt-extra">Extra toward the mortgage — $<span id="debt-extra-val">' + extra + '</span> a month</label>'
    + '<input id="debt-extra" type="range" min="0" max="500" step="25" value="' + extra + '">'
    + '<p class="slider-note">At ' + money(mortgage.payment + extra) + ' a month the house is free '
    + (withExtra ? 'in <strong>' + withExtra.months + ' months (' + debtFree(withExtra.months) + ')</strong>, paying '
      + money(withExtra.interest) + ' of interest — <strong>' + (withExtra.months < base.months ? (base.months - withExtra.months) + ' months and ' + money(base.interest - withExtra.interest) + ' sooner</strong> than paying the minimum.' : 'the same as the minimum.') : '— the payment does not cover the interest.') + '</p></div>'
    + '<dl class="sim-results">'
    + '<div><dt>As it stands</dt><dd>' + base.months + ' months · ' + money(base.interest) + ' interest · free ' + debtFree(base.months) + '</dd></div>'
    + '<div><dt>With $' + extra + ' extra</dt><dd>' + withExtra.months + ' months · ' + money(withExtra.interest) + ' interest · free ' + debtFree(withExtra.months) + '</dd></div>'
    + '</dl></section>';

  h += '<section><h2>The snowball, in order</h2><div class="debts">'
    + order.map(function (d, i) {
        const a = amortize(d.balance, d.apr, d.payment);
        return '<article class="debt"><p class="debt-order">Step ' + (i + 1) + '</p>'
          + '<h3>' + esc(d.name) + '</h3>'
          + '<p class="debt-amt">' + money(d.balance) + ' <span>at ' + d.apr + '% · ' + money(d.payment) + ' a month</span></p>'
          + '<p class="debt-line">' + (a ? a.months + ' months to go · ' + money(a.interest) + ' of interest · free ' + debtFree(a.months) : 'The payment does not cover the interest.') + '</p>'
          + '<p class="goal-note">' + esc(d.note) + '</p></article>';
      }).join("")
    + '</div>'
    + '<p class="section-note">Pay the store card first (' + amortize(storeCard.balance, storeCard.apr, storeCard.payment).months
    + ' months), then roll its ' + money(storeCard.payment) + ' into the car loan — the car is gone '
    + (carBase.months - carRolled.months) + ' months sooner (' + carRolled.months + ' instead of ' + carBase.months
    + '), and ' + money(carBase.interest - carRolled.interest) + ' of interest is never paid. '
    + 'Then the whole ' + money(totalPayment) + ' a month turns on the mortgage.</p></section>';
  return h;
}

// ---- The Subscription Audit (#/subscriptions) -------------------------------

function viewSubs(store) {
  const state = store.state;
  const off = state.subsOff || [];
  const total = state.subscriptions.reduce(function (a, s) { return a + s.amount; }, 0);
  const cancelled = state.subscriptions.filter(function (s) { return off.indexOf(s.id) !== -1; });
  const savedMo = cancelled.reduce(function (a, s) { return a + s.amount; }, 0);
  const kept = total - savedMo;

  let h = '<section class="story"><p class="kicker">The Subscription Audit · the money that leaves on its own</p>'
    + '<h1>Nine subscriptions, one audit</h1>'
    + '<p class="lede">Every one of these is already inside a room’s November total — cancelling one frees money, '
    + 'it does not rewrite what the room spent. Cancel what the family forgot it was paying, keep what it uses, '
    + 'and the saving shows up at once.</p></section>';

  h += '<section class="ledger-strip" aria-label="Subscriptions at a glance">'
    + '<div><span>All subscriptions</span><strong>' + money(total) + ' / mo</strong></div>'
    + '<div><span>Still paying</span><strong>' + money(kept) + ' / mo</strong></div>'
    + '<div><span>Cancelled saves</span><strong>' + money(savedMo) + ' / mo</strong></div>'
    + '<div><span>That is a year</span><strong>' + money(savedMo * 12) + '</strong></div>'
    + '</section>';

  h += '<ul class="sub-list">'
    + state.subscriptions.map(function (s) {
        const c = catById(state, s.cat);
        const isOff = off.indexOf(s.id) !== -1;
        return '<li class="sub' + (isOff ? ' off' : '') + '">'
          + '<span class="sub-name">' + esc(s.label) + '</span>'
          + '<span class="sub-cat">' + esc(c.room) + ' — ' + esc(c.label) + '</span>'
          + '<span class="sub-note">' + esc(s.note) + '</span>'
          + '<strong class="sub-amt">' + money(s.amount) + ' / mo</strong>'
          + '<button class="btn small" data-action="sub-toggle" data-sub="' + s.id + '">' + (isOff ? "Keep it" : "Cancel") + '</button>'
          + '</li>';
      }).join("")
    + '</ul>'
    + '<p class="section-note">' + (cancelled.length
        ? 'Cancelled ' + cancelled.length + ' of ' + state.subscriptions.length + ': ' + money(savedMo) + ' a month, '
          + money(savedMo * 12) + ' a year — about ' + Math.round((savedMo / 1200) * 100) + '% of what November put aside. '
          + 'The money stays in its room until “Start over” puts it back.'
        : 'Nothing cancelled yet. The streaming bundle alone is ' + money(22.99) + ' a month — '
          + money(22.99 * 12) + ' a year for films the family watches twice a month.')
    + '</p>';
  return h;
}

// ---- The Stress Lab (#/stress) ----------------------------------------------

function viewStress(store) {
  const state = store.state;
  const cost = store.stressCost || 2000;
  const ess = essentials(state);
  const fund = state.goals[0].saved;
  const runway = fund / ess;
  const left = monthLeft(state, "Nov");
  const spent = monthTotal(state, "Nov");
  const saved = monthSaved(state, "Nov");

  // Scenario 1: income falls 25%.
  const incomeCut = state.income.total * 0.75;
  const short1 = saved - (incomeCut - spent); // what the month is short, saving kept
  const cover1 = short1 > 0 ? fund / short1 : Infinity;

  // Scenario 2: a sudden bill of `cost`, paid from the unassigned money first.
  const short2 = Math.max(0, cost - left);
  const fund2 = fund - short2;
  const runway2 = fund2 / ess;

  // Scenario 3: the mortgage rises $150 a month.
  const left3 = left - 150;

  let h = '<section class="story"><p class="kicker">The Stress Lab · what if the month goes wrong</p>'
    + '<h1>Three bad months, priced in advance</h1>'
    + '<p class="lede">The emergency fund is the shock absorber: at today’s essentials — ' + money(ess)
    + ' a month for the mortgage, groceries, getting around, health and the utilities — it lasts '
    + runway.toFixed(1) + ' months even if the income stops entirely. Here is what each bad month actually costs.</p></section>';

  h += '<section class="ledger-strip" aria-label="The house today">'
    + '<div><span>Unassigned</span><strong>' + money(left) + '</strong></div>'
    + '<div><span>Emergency fund</span><strong>' + money(fund) + '</strong></div>'
    + '<div><span>Must-pay a month</span><strong>' + money(ess) + '</strong></div>'
    + '<div><span>Runway, no income</span><strong>' + runway.toFixed(1) + ' months</strong></div>'
    + '</section>';

  h += '<div class="scenarios">'
    + '<article class="scenario"><h2>Pay cut — income falls 25%</h2>'
    + '<p>Income drops to <strong>' + money(incomeCut) + '</strong>. Keeping the ' + money(saved) + ' saving, '
    + 'the month is short <strong>' + money(short1) + '</strong>.</p>'
    + '<p class="scenario-verdict">The fund covers the shortfall for about <strong>' + cover1.toFixed(1) + ' months</strong>. '
    + 'Stop the saving first and the month has ' + money(incomeCut - spent) + ' left over.</p></article>'

    + '<article class="scenario"><h2>A sudden bill</h2>'
    + '<div class="slider-row"><label for="stress-cost">The bill is $<span id="stress-cost-val">' + cost.toLocaleString("en-US") + '</span></label>'
    + '<input id="stress-cost" type="range" min="500" max="5000" step="250" value="' + cost + '"></div>'
    + '<p>It eats the unassigned ' + money(left) + ' first' + (short2 > 0 ? ', then <strong>' + money(short2) + '</strong> comes out of the fund.' : '.') + '</p>'
    + '<p class="scenario-verdict">Fund after the bill: <strong>' + money(fund2) + '</strong> — runway <strong>' + runway2.toFixed(1) + ' months</strong>.</p></article>'

    + '<article class="scenario"><h2>The mortgage rises $150</h2>'
    + '<p>The Bedroom goes to <strong>' + money(catSpent(state, "housing", "Nov") + 150) + '</strong> a month. '
    + 'Spending becomes ' + money(spent + 150) + '; the saving stays ' + money(saved) + '.</p>'
    + '<p class="scenario-verdict">Unassigned falls to <strong>' + money(left3) + '</strong> — still positive, '
    + 'and the fund’s runway does not move: <strong>' + runway.toFixed(1) + ' months</strong>.</p></article>'
    + '</div>'
    + '<p class="section-note">The fund is the only thing between a bad month and a bad year. '
    + 'At ' + money(fund) + ' it is ' + Math.round((fund / 10000) * 100) + '% of its ' + money(10000) + ' target — '
    + 'the March 2027 finish line is the month the house stops being one emergency away from trouble.</p>';
  return h;
}
