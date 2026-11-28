# Hearth — The Alvarez House

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/breinzzy/best-household-budget-site-entry/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/breinzzy/best-household-budget-site-entry/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

A household budget site you walk through, not a dashboard you stare at. The Alvarez family of Austin, Texas keeps its money room by room: tap the Kitchen to open the groceries, the Bedroom for the mortgage, the Garden for the plumber's bill. Behind the floor plan sits a full budget site — a ledger in ink, cash envelopes, savings milestones, a bill calendar, twelve months of reports with a cashflow Sankey, a mortgage and snowball simulator, a subscription audit, a stress lab and a paycheck planner. Every figure reconciles: November's eight rooms add up to $4,505 spent on $7,240 brought home, with $1,200 put aside and $1,535 still unassigned.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network — the site is plain static files under `app/`, and your edits live only in the browser (localStorage). “Start over” restores November as it began.

## What's inside

- `app/index.html` — the shell: masthead, month switch, navigation
- `app/data.js` — the Alvarez books: categories, transactions, goals, bills
- `app/charts.js` — the floor plan, monthly bars, grouped bars, kept-rate line
- `app/views.js` — one render function per page
- `app/main.js` — router, store and every control
- `app/style.css` — paper and ink
- `main.ts` — hands the entry in (copies `app/` + `screenshots/`, writes `dossier.json`)

## The house

| Room | What lives there | November |
| --- | --- | --- |
| Kitchen | Groceries | $824.50 of $850 |
| Dining Room | Dining out | $274.55 of $260 — over by $14.55 |
| Living Room | Fun & films | $318.75 of $320 |
| Bedroom | House & mortgage | $1,485.00 of $1,500 |
| Kids' Room | Kids & school | $412.30 of $450 |
| Bathroom | Health | $186.20 of $200 |
| Garage | Getting around | $402.15 of $420 |
| Garden | Home & garden | $601.55 of $600 — over by $1.55 |

Twelve months, December to November, come to $48,763.70. The emergency fund stands at $7,850 of $10,000 and fills in March 2027 at $500 a month. The mortgage stands at $212,000 at 6.25% — $1,350 a month, free in March 2054, or 88 months sooner with $200 extra a month.

---

<sub>Entered on [make.fun](https://make.fun/?ref=rp1x5e31&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
