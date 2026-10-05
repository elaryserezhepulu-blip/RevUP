'use strict';

// Ported 1:1 from the RevUp prototype (RevUp (1).html → analyze / salesSeries).
// Pure functions: given an array of sales rows, produce the report payload the
// frontend already knows how to render.
//
// A sales row is: { date: 'YYYY-MM-DD' | 'n/a', product, quantity, price, stock, shelfLife }

const sum = (a) => a.reduce((s, v) => s + v, 0);

const stdev = (a) => {
  if (!a.length) return 0;
  const m = sum(a) / a.length;
  return Math.sqrt(sum(a.map((v) => (v - m) ** 2)) / a.length);
};

const STATUS = {
  rising: { label: 'Rising demand', color: 'var(--blue)', soft: 'var(--blue-soft)' },
  falling: { label: 'Falling — order less', color: 'var(--red)', soft: 'var(--red-soft)' },
  slow: { label: 'Slow mover', color: 'var(--amber)', soft: 'var(--amber-soft)' },
  expiry: { label: 'Overstocked — will expire', color: 'var(--red)', soft: 'var(--red-soft)' },
  steady: { label: 'Steady', color: 'var(--accent)', soft: 'var(--accent-soft)' },
};

function analyze(sales, periodDays) {
  // Anchor the window to the data's own latest date (so uploaded historical files work).
  let maxStr = '';
  for (const s of sales) if (s.date && s.date !== 'n/a' && s.date > maxStr) maxStr = s.date;
  const noDates = !maxStr;
  const end = noDates ? null : new Date(maxStr);
  const cutoff = noDates
    ? null
    : (() => {
        const c = new Date(end);
        c.setDate(end.getDate() - periodDays);
        return c;
      })();

  const byProd = {};
  for (const s of sales) {
    const inPeriod = noDates ? true : new Date(s.date) >= cutoff;
    const g =
      byProd[s.product] ||
      (byProd[s.product] = {
        product: s.product,
        price: s.price,
        sh: s.shelfLife,
        stock: s.stock,
        periodQty: 0,
        periodDaily: [],
        allSorted: [],
      });
    g.allSorted.push(s);
    if (inPeriod) {
      g.periodQty += s.quantity;
      g.periodDaily.push(s.quantity);
    }
  }

  const items = Object.values(byProd).map((g) => {
    g.allSorted.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const recent = g.allSorted.slice(-14).map((x) => x.quantity);
    const recentAvg = recent.length ? sum(recent) / recent.length : 0;
    const earlier = g.allSorted.slice(-28, -14).map((x) => x.quantity);
    const earlierAvg = earlier.length ? sum(earlier) / earlier.length : recentAvg;
    const trendPct = earlierAvg > 0 ? (recentAvg - earlierAvg) / earlierAvg : 0;
    const avgDaily = g.periodQty / periodDays;
    const std = stdev(g.periodDaily);
    const forecastDaily = 0.65 * recentAvg + 0.35 * avgDaily;
    const horizon = 9;
    let target = Math.round(forecastDaily * horizon + 1.65 * std * Math.sqrt(horizon));
    const perishable = g.sh && g.sh > 0;
    const sellable = perishable ? forecastDaily * g.sh : Infinity;
    let trimmed = false;
    if (perishable && target > sellable * 1.1) {
      target = Math.round(sellable);
      trimmed = true;
    }
    let order = Math.max(0, Math.round(target - g.stock));
    let expiryRisk = false;
    if (perishable && g.stock > sellable * 1.15) {
      expiryRisk = true;
      order = 0;
    }
    let status = 'steady';
    if (expiryRisk) status = 'expiry';
    else if (trendPct > 0.15) status = 'rising';
    else if (trendPct < -0.15) status = 'falling';
    else if (avgDaily < 3 && trendPct <= 0) status = 'slow';
    return {
      product: g.product,
      price: g.price,
      perishable,
      trimmed,
      expiryRisk,
      status,
      trendPct,
      qty: g.periodQty,
      revenue: g.periodQty * g.price,
      order,
      orderValue: order * g.price,
      wasteValue: expiryRisk ? Math.round((g.stock - sellable) * g.price) : 0,
    };
  });

  const ranking = [...items].sort((a, b) => b.qty - a.qty);
  const recs = [...items].sort((a, b) => b.order - a.order);
  return {
    ranking,
    recs,
    totalUnits: sum(items.map((x) => x.qty)),
    totalRevenue: sum(items.map((x) => x.revenue)),
    products: items.length,
    orderValue: sum(items.map((x) => x.orderValue)),
    wasteValue: sum(items.map((x) => x.wasteValue)),
    maxQty: Math.max(1, ...items.map((x) => x.qty)),
  };
}

// Revenue trend buckets for the line chart.
function salesSeries(sales, periodDays, buckets) {
  let maxStr = '';
  for (const s of sales) if (s.date && s.date !== 'n/a' && s.date > maxStr) maxStr = s.date;
  const arr = Array(buckets).fill(0);
  if (!maxStr) {
    // No dates: spread by row order so the chart still shows shape.
    sales.forEach((s, i) => {
      const idx = Math.min(buckets - 1, Math.floor((i / Math.max(1, sales.length)) * buckets));
      arr[idx] += s.quantity * s.price;
    });
    return arr;
  }
  const end = new Date(maxStr);
  const start = new Date(end);
  start.setDate(end.getDate() - periodDays);
  const span = end - start || 1;
  for (const s of sales) {
    const d = new Date(s.date);
    if (d < start || d > end) continue;
    let i = Math.floor(((d - start) / span) * buckets);
    i = Math.max(0, Math.min(buckets - 1, i));
    arr[i] += s.quantity * s.price;
  }
  return arr;
}

module.exports = { analyze, salesSeries, STATUS, sum, stdev };
