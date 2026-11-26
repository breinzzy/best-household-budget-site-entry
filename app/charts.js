// Hearth charts — one job: small SVG charts with no library and no network.
// Donut for spending by category, bars for the monthly trend. Pure functions
// of the numbers passed in, so any view can reuse them.

export function money(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function money0(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function donut(parts, size = 168, total = null, label = 'spent') {
  // parts: [{label, value, color}] — slices with a hole in the middle.
  // total defaults to the parts' sum; pass the real total when parts are a top-N.
  const sum = parts.reduce((s, p) => s + p.value, 0) || 1;
  const shown = total === null ? sum : total;
  const r = 62, cx = size / 2, cy = size / 2, stroke = 26;
  let a0 = -Math.PI / 2;
  const arcs = parts.map((p) => {
    const frac = p.value / sum;
    const a1 = a0 + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const d = `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    a0 = a1;
    return `<path d="${d}" fill="none" stroke="${p.color}" stroke-width="${stroke}" />`;
  }).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Spending by category">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f0eadf" stroke-width="${stroke}" />${arcs}
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="15" font-weight="800" fill="#1c1917">${money0(shown)}</text>
    <text x="${cx}" y="${cy + 15}" text-anchor="middle" font-size="11" fill="#78716c">${label}</text>
  </svg>`;
}

export function bars(inputRows, height = 150) {
  // rows: [{label, value}] or [{month, spent}] — vertical bars, tallest scaled.
  const rows = inputRows.map((r) => ({ label: r.label ?? r.month, value: r.value ?? r.spent }));
  const max = Math.max(...rows.map((r) => r.value), 1);
  const w = 300, gap = 14, bw = (w - gap * (rows.length - 1)) / rows.length;
  const parts = rows.map((r, i) => {
    const h = Math.max(4, Math.round((r.value / max) * (height - 34)));
    const x = Math.round(i * (bw + gap));
    const y = height - 22 - h;
    const hot = r.label === 'Nov';
    return `<rect x="${x}" y="${y}" width="${Math.round(bw)}" height="${h}" rx="4" fill="${hot ? '#166534' : '#a7c4b2'}" />
      <text x="${x + bw / 2}" y="${height - 8}" text-anchor="middle" font-size="11" fill="#78716c">${r.label}</text>
      <text x="${x + bw / 2}" y="${y - 5}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1c1917">${money0(r.value)}</text>`;
  }).join('');
  return `<svg width="100%" viewBox="0 0 ${w} ${height}" role="img" aria-label="Monthly spending trend">${parts}</svg>`;
}
