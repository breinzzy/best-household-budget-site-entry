// Hearth — money formatting and the two SVG charts (donut + bars).
// Both charts are plain SVG strings, no library, no network.

export function money(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function money0(n) {
  return '$' + Math.round(Number(n)).toLocaleString('en-US');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// A donut from slices of { label, value, color }. The hole carries the
// total and a caption, so the chart reads even without its legend.
export function donut(parts, size, total, label) {
  const r = size / 2;
  const hole = r * 0.62;
  const cx = r;
  const cy = r;
  const sum = parts.reduce((a, p) => a + p.value, 0) || 1;
  let angle = -90;
  const arcs = parts.map((p) => {
    const frac = p.value / sum;
    const sweep = frac * 360;
    const large = sweep > 180 ? 1 : 0;
    const a0 = (angle * Math.PI) / 180;
    const a1 = ((angle + sweep) * Math.PI) / 180;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    angle += sweep;
    if (frac >= 0.999) {
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.color}" />`;
    }
    return `<path d="M ${cx} ${cy} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${p.color}" />`;
  });
  return `<svg class="donut" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label)}">
    ${arcs.join('')}
    <circle cx="${cx}" cy="${cy}" r="${hole}" fill="#ffffff" />
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-total">${money0(total)}</text>
    <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-label">${esc(label)}</text>
  </svg>`;
}

// A simple vertical bar chart. `rows` are { label, value, highlight }.
export function bars(rows, height) {
  const width = 560;
  const max = Math.max(...rows.map((r) => r.value), 1);
  const gap = 14;
  const bw = (width - gap * (rows.length - 1)) / rows.length;
  const floor = height - 26;
  const scale = (height - 56) / max;
  const rects = rows
    .map((row, i) => {
      const h = Math.max(3, Math.round(row.value * scale));
      const x = i * (bw + gap);
      const y = floor - h;
      const fill = row.highlight ? '#166534' : '#a8c3a0';
      return `<g>
        <rect x="${x.toFixed(1)}" y="${y}" width="${bw.toFixed(1)}" height="${h}" rx="5" fill="${fill}" />
        <text x="${(x + bw / 2).toFixed(1)}" y="${y - 6}" text-anchor="middle" class="bar-value">${money0(row.value)}</text>
        <text x="${(x + bw / 2).toFixed(1)}" y="${height - 8}" text-anchor="middle" class="bar-label">${esc(row.label)}</text>
      </g>`;
    })
    .join('');
  return `<svg class="bars" width="100%" viewBox="0 0 ${width} ${height}" role="img" aria-label="Monthly spending">
    <line x1="0" y1="${floor}" x2="${width}" y2="${floor}" stroke="#e7e0d4" stroke-width="1" />
    ${rects}
  </svg>`;
}
