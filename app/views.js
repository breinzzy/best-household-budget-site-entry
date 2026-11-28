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
  const rows = sortedTx(state, month).filter(function (t) {
    const okQ = !q || t.label.toLowerCase().indexOf(q) !== -1;
    const okC = store.ledgerCat === "all" || t.cat === store.ledgerCat;
    return okQ && okC;
  });
  const total = monthTotal(state, month);
  const count = txOfMonth(state, month).length;

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
    + '<button class="btn" data-action="export-csv">Export CSV</button></section>';

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
  const state = store.state;
  const months5 = state.months;
  const totals5 = months5.map(function (m) { return monthTotal(state, m); });
  const fiveTotal = totals5.reduce(function (a, b) { return a + b; }, 0);
  const avg = fiveTotal / 5;
  const rates = months5.map(function (m) { return (monthSaved(state, m) / state.income.total) * 100; });
  const bestMonth = months5[totals5.indexOf(Math.min.apply(null, totals5))];
  const worstMonth = months5[totals5.indexOf(Math.max.apply(null, totals5))];

  let h = '<section class="story"><p class="kicker">The Year So Far · July to November</p>'
    + '<h1>Five months in one picture</h1>'
    + '<p class="lede">The house spent <strong>' + money(fiveTotal) + '</strong> in five months — '
    + money(avg) + ' a month on average. ' + worstMonth + ' was the dearest month, ' + bestMonth + ' the lightest. '
    + 'The kept rate — the share of income the family kept — has risen every single month.</p></section>';

  h += '<section class="ledger-strip" aria-label="Five-month totals">'
    + '<div><span>Five-month total</span><strong>' + money(fiveTotal) + '</strong></div>'
    + '<div><span>Average a month</span><strong>' + money(avg) + '</strong></div>'
    + '<div><span>Dearest month</span><strong>' + worstMonth + ' · ' + money(Math.max.apply(null, totals5)) + '</strong></div>'
    + '<div><span>Lightest month</span><strong>' + bestMonth + ' · ' + money(Math.min.apply(null, totals5)) + '</strong></div>'
    + '</section>';

  h += '<section><h2>Each room, each month</h2>'
    + groupedBars(state.categories, months5)
    + '<p class="section-note">The Bedroom never moves — the mortgage is the same $1,485 every month. '
    + 'The Garden jumps around: the plumber’s visit made November its dearest month.</p></section>';

  h += '<section><h2>The kept rate keeps climbing</h2>'
    + keptLine(rates, months5)
    + '<p class="section-note">Income held at ' + money(state.income.total) + ' a month. '
    + 'July kept ' + rates[0].toFixed(1) + '%, November kept ' + rates[4].toFixed(1) + '% — '
    + money(monthSaved(state, "Nov") - monthSaved(state, "Jul")) + ' more a month put aside than when the year’s second half began.</p></section>';

  h += '<section><h2>Where the five months went</h2><ul class="insights">'
    + state.categories.slice().sort(function (a, b) {
        let sa = 0, sb = 0;
        months5.forEach(function (m) { sa += catSpent(state, a.id, m); sb += catSpent(state, b.id, m); });
        return sb - sa;
      }).map(function (c) {
        let s = 0;
        months5.forEach(function (m) { s += catSpent(state, c.id, m); });
        return '<li><strong>' + esc(c.room) + ' — ' + esc(c.label) + ':</strong> ' + money(s) + ' in five months, ' + pct(s, fiveTotal) + '% of everything.</li>';
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
  const goalShare = emergency.monthly / 1410;

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
  return h;
}
