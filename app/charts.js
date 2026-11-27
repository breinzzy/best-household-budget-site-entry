// Canvas charts for Hearth: a spending donut, grouped monthly bars and a small
// trend strip. No library — plain 2D canvas, drawn after each render, scaled for
// the screen's pixel density so the lines stay crisp.

function setupCanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

export function drawDonut(canvas, segments, centerTop, centerBottom) {
  const size = 240;
  const ctx = setupCanvas(canvas, size, size);
  const cx = size / 2;
  const cy = size / 2;
  const outer = 104;
  const inner = 66;
  const total = segments.reduce((a, s) => a + s.value, 0);
  let angle = -Math.PI / 2;
  for (const s of segments) {
    if (s.value <= 0) continue;
    const sweep = (s.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    angle += sweep;
  }
  // Punch the hole out and ring it, so the middle reads as a label, not a pie.
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.strokeStyle = '#e7ddc8';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#1f2a22';
  ctx.font = '700 26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(centerTop, cx, cy - 12);
  ctx.fillStyle = '#78716c';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(centerBottom, cx, cy + 14);
}

// Grouped bars: one group per month, one bar per category inside it, with a
// legend of the categories that actually appear.
export function drawGroupedBars(canvas, months, categories, values) {
  const width = 640;
  const height = 300;
  const ctx = setupCanvas(canvas, width, height);
  const padL = 46;
  const padR = 10;
  const padT = 14;
  const padB = 34;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const max = Math.max(...values.flat()) * 1.1;
  const groupW = plotW / months.length;
  const barW = Math.min(16, (groupW - 14) / categories.length);

  ctx.strokeStyle = '#e7ddc8';
  ctx.fillStyle = '#78716c';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let g = 0; g <= 4; g++) {
    const y = padT + (plotH * g) / 4;
    const v = Math.round((max * (4 - g)) / 4);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(width - padR, y);
    ctx.stroke();
    ctx.fillText(`$${v.toLocaleString('en-US')}`, padL - 8, y);
  }

  months.forEach((m, mi) => {
    const groupX = padL + mi * groupW;
    const innerW = categories.length * barW;
    categories.forEach((c, ci) => {
      const v = values[mi][ci];
      const h = (v / max) * plotH;
      ctx.fillStyle = c.color;
      ctx.fillRect(groupX + (groupW - innerW) / 2 + ci * barW, padT + plotH - h, barW - 1.5, h);
    });
    ctx.fillStyle = '#44403c';
    ctx.textAlign = 'center';
    ctx.fillText(m, groupX + groupW / 2, height - 14);
    ctx.fillStyle = '#78716c';
    ctx.font = '700 11px system-ui, sans-serif';
    const total = values[mi].reduce((a, b) => a + b, 0);
    ctx.fillText(`$${total.toLocaleString('en-US')}`, groupX + groupW / 2, padT + plotH - Math.max(...values[mi]) / max * plotH - 8);
    ctx.font = '11px system-ui, sans-serif';
  });
}

// Small vertical bars for the dashboard's five-month strip.
export function drawTrendBars(canvas, labels, values, highlightIndex) {
  const width = 300;
  const height = 120;
  const ctx = setupCanvas(canvas, width, height);
  const padB = 22;
  const plotH = height - padB - 8;
  const max = Math.max(...values) * 1.08;
  const slot = width / values.length;
  const barW = 34;
  values.forEach((v, i) => {
    const h = (v / max) * plotH;
    const x = i * slot + (slot - barW) / 2;
    ctx.fillStyle = i === highlightIndex ? '#b45309' : '#1d4d2b';
    ctx.globalAlpha = i === highlightIndex ? 1 : 0.55;
    ctx.beginPath();
    ctx.roundRect(x, 8 + plotH - h, barW, h, 4);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#44403c';
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`$${(v / 1000).toFixed(1)}k`, i * slot + slot / 2, 8 + plotH - h - 6);
    ctx.fillStyle = '#78716c';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(labels[i], i * slot + slot / 2, height - 8);
  });
}
