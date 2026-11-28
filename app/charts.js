// Hearth — charts.js. Small SVG chart builders: the house floor plan,
// monthly bars, grouped category bars and the kept-rate line. No library,
// no network; every chart is a string of SVG.

// Money helpers shared by the views.
function money(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function money0(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}
function pct(part, whole) {
  return Math.round((part / whole) * 100);
}

// A thin fill bar: spent against budget. Over budget turns terracotta.
function fillBar(spent, budget, over) {
  const w = Math.min(100, (spent / budget) * 100);
  const cls = over ? "bar-over" : "bar-fill";
  return '<span class="bar"><span class="' + cls + '" style="width:' + w.toFixed(1) + '%"></span></span>';
}

// Five small vertical bars, one per month, for the dashboard strip.
function miniBars(values, labels, highlight) {
  const max = Math.max.apply(null, values);
  let out = '<div class="minibars" role="img" aria-label="Monthly spending, July to November">';
  for (let i = 0; i < values.length; i++) {
    const h = Math.max(6, Math.round((values[i] / max) * 64));
    out += '<div class="minibar' + (i === highlight ? ' hot' : '') + '">'
      + '<span class="minibar-val">' + money0(values[i]) + '</span>'
      + '<span class="minibar-col" style="height:' + h + 'px"></span>'
      + '<span class="minibar-lab">' + labels[i] + '</span></div>';
  }
  return out + '</div>';
}

// Grouped bars: one cluster per category, one bar per month.
function groupedBars(categories, months) {
  const all = [];
  categories.forEach(function (c) {
    months.forEach(function (m) { all.push(c.spent[m]); });
  });
  const max = Math.max.apply(null, all);
  const W = 880, H = 300, padL = 44, padB = 30, padT = 12;
  const plotW = W - padL - 8, plotH = H - padT - padB;
  const clusterW = plotW / categories.length;
  const barW = Math.min(16, (clusterW - 14) / months.length);
  const shades = ["#c96f4a", "#d99a5b", "#8a9b7a", "#5b7a6e", "#2e4a3f"];
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart" role="img" aria-label="Spending by category, July to November">';
  // gridlines
  [0.25, 0.5, 0.75, 1].forEach(function (f) {
    const y = padT + plotH * (1 - f);
    s += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - 8) + '" y2="' + y + '" class="gridline"/>';
    s += '<text x="' + (padL - 6) + '" y="' + (y + 4) + '" class="axis">' + money0(max * f) + '</text>';
  });
  categories.forEach(function (c, ci) {
    const cx = padL + ci * clusterW;
    months.forEach(function (m, mi) {
      const v = c.spent[m];
      const h = Math.max(2, (v / max) * plotH);
      const x = cx + 7 + mi * barW;
      const y = padT + plotH - h;
      s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (barW - 2) + '" height="' + h.toFixed(1) + '" fill="' + shades[mi] + '"><title>' + c.label + ' · ' + m + ' ' + money(v) + '</title></rect>';
    });
    s += '<text x="' + (cx + clusterW / 2) + '" y="' + (H - 10) + '" class="axis center">' + c.label.split(" ")[0] + '</text>';
  });
  // legend
  months.forEach(function (m, mi) {
    const x = padL + mi * 74;
    s += '<rect x="' + x + '" y="0" width="10" height="10" fill="' + shades[mi] + '"/><text x="' + (x + 14) + '" y="9" class="axis">' + m + '</text>';
  });
  return s + '</svg>';
}

// Kept-rate line: the share of income the family kept each month.
function keptLine(rates, labels) {
  const W = 880, H = 190, padL = 44, padB = 28, padT = 16;
  const plotW = W - padL - 14, plotH = H - padT - padB;
  const max = 20;
  const x = function (i) { return padL + (i / (rates.length - 1)) * plotW; };
  const y = function (r) { return padT + plotH * (1 - r / max); };
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart" role="img" aria-label="Share of income kept, July to November">';
  [0, 5, 10, 15, 20].forEach(function (v) {
    const yy = y(v);
    s += '<line x1="' + padL + '" y1="' + yy + '" x2="' + (W - 14) + '" y2="' + yy + '" class="gridline"/>';
    s += '<text x="' + (padL - 6) + '" y="' + (yy + 4) + '" class="axis">' + v + '%</text>';
  });
  let path = "";
  rates.forEach(function (r, i) { path += (i === 0 ? "M" : "L") + x(i).toFixed(1) + " " + y(r).toFixed(1) + " "; });
  s += '<path d="' + path + '" class="kept-path"/>';
  rates.forEach(function (r, i) {
    s += '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(r).toFixed(1) + '" r="5" class="kept-dot"/>';
    s += '<text x="' + x(i).toFixed(1) + '" y="' + (y(r) - 10) + '" class="axis center strong">' + r.toFixed(1) + '%</text>';
    s += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" class="axis center">' + labels[i] + '</text>';
  });
  return s + '</svg>';
}

// The house itself: a hand-drawn floor plan. Each room is a button that
// opens its category. viewBox 0 0 960 525. Upstairs: Bedroom, Kids' Room,
// Bathroom. Downstairs: Garage, Kitchen, Dining Room, Living Room. The
// garden runs along the bottom as the yard.
function housePlan(categories, selectedId) {
  function cat(id) { return categories.find(function (c) { return c.id === id; }); }
  // room: [id, x, y, w, h]
  const rooms = [
    ["housing", 80, 150, 270, 140],
    ["kids", 350, 150, 260, 140],
    ["health", 610, 150, 270, 140],
    ["transport", 80, 290, 200, 140],
    ["groceries", 280, 290, 220, 140],
    ["dining", 500, 290, 180, 140],
    ["entertainment", 680, 290, 200, 140]
  ];
  let s = '<svg viewBox="0 0 960 525" class="house" role="group" aria-label="Floor plan of the Alvarez house. Each room is a budget category.">';
  // roof
  s += '<polygon points="40,150 480,40 920,150" class="roof"/>';
  s += '<text x="480" y="102" class="house-title">The Alvarez House</text>';
  s += '<text x="480" y="124" class="house-sub">Austin, Texas · tap a room to open its books</text>';
  // chimney
  s += '<rect x="700" y="58" width="34" height="48" class="chimney"/>';
  // rooms
  rooms.forEach(function (r) {
    const c = cat(r[0]);
    const over = c.spent.Nov > c.budget;
    const sel = c.id === selectedId;
    s += '<g class="room' + (sel ? ' selected' : '') + '" data-room="' + c.id + '" tabindex="0" role="button" aria-label="' + c.room + ', ' + c.label + ', spent ' + money(c.spent.Nov) + ' of ' + money(c.budget) + '">'
      + '<rect x="' + r[1] + '" y="' + r[2] + '" width="' + r[3] + '" height="' + r[4] + '" class="room-rect"/>'
      + '<text x="' + (r[1] + 14) + '" y="' + (r[2] + 26) + '" class="room-name">' + c.room + '</text>'
      + '<text x="' + (r[1] + 14) + '" y="' + (r[2] + 46) + '" class="room-cat">' + c.label + '</text>'
      + '<text x="' + (r[1] + 14) + '" y="' + (r[2] + 72) + '" class="room-amt">' + money(c.spent.Nov) + '</text>'
      + '<text x="' + (r[1] + 14) + '" y="' + (r[2] + 90) + '" class="room-bud">of ' + money(c.budget) + (over ? ' · over by ' + money(c.spent.Nov - c.budget) : '') + '</text>'
      + '<rect x="' + (r[1] + 14) + '" y="' + (r[2] + 102) + '" width="' + (r[3] - 28) + '" height="8" rx="4" class="room-track"/>'
      + '<rect x="' + (r[1] + 14) + '" y="' + (r[2] + 102) + '" width="' + Math.max(4, ((r[3] - 28) * Math.min(1, c.spent.Nov / c.budget))).toFixed(1) + '" height="8" rx="4" class="' + (over ? 'room-fill-over' : 'room-fill') + '"/>'
      + '<text x="' + (r[1] + r[3] - 14) + '" y="' + (r[2] + r[4] - 12) + '" class="room-pct">' + pct(c.spent.Nov, c.budget) + '%</text>'
      + '</g>';
  });
  // garden strip
  const g = cat("home");
  const gover = g.spent.Nov > g.budget;
  s += '<g class="room garden' + (g.id === selectedId ? ' selected' : '') + '" data-room="home" tabindex="0" role="button" aria-label="Garden, Home and garden, spent ' + money(g.spent.Nov) + ' of ' + money(g.budget) + '">'
    + '<rect x="80" y="440" width="800" height="55" class="room-rect garden-rect"/>'
    + '<text x="100" y="462" class="room-name">Garden</text>'
    + '<text x="100" y="480" class="room-cat">Home &amp; garden</text>'
    + '<text x="330" y="464" class="room-amt">' + money(g.spent.Nov) + ' of ' + money(g.budget) + (gover ? ' · over by ' + money(g.spent.Nov - g.budget) : '') + '</text>'
    + '<rect x="330" y="474" width="300" height="8" rx="4" class="room-track"/>'
    + '<rect x="330" y="474" width="' + Math.max(4, (300 * Math.min(1, g.spent.Nov / g.budget))).toFixed(1) + '" height="8" rx="4" class="' + (gover ? 'room-fill-over' : 'room-fill') + '"/>'
    + '<text x="860" y="476" class="room-pct">' + pct(g.spent.Nov, g.budget) + '%</text>'
    + '<circle cx="700" cy="458" r="9" class="tree"/><rect x="697" y="464" width="6" height="12" class="trunk"/>'
    + '</g>';
  s += '<text x="480" y="516" class="house-foot">Every dollar in this house has a room. Nothing is unaccounted for.</text>';
  return s + '</svg>';
}
