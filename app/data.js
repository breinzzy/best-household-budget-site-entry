// Hearth — household budget data: one job, the seed data for the Alvarez family.
// Every figure is a real, worked-out November 2026 month (plus October for the
// month switcher): income, spending by category, bills, goals and the 5-month trend.
// The app computes all totals from these rows, so the dashboard, budgets and
// reports can never disagree with each other.

export const FAMILY = {
  name: 'The Alvarez Family',
  home: 'Austin, Texas',
  members: 'Daniel & Priya · Maya (9) · Leo (6)',
  currency: 'USD',
};

export const CATEGORIES = [
  { id: 'housing', label: 'Housing', color: '#166534', icon: '⌂' },
  { id: 'groceries', label: 'Groceries', color: '#15803d', icon: '◉' },
  { id: 'dining', label: 'Dining Out', color: '#b45309', icon: '◍' },
  { id: 'transport', label: 'Transport', color: '#0369a1', icon: '➤' },
  { id: 'utilities', label: 'Utilities', color: '#6d28d9', icon: '⚡' },
  { id: 'kids', label: 'Kids & School', color: '#db2777', icon: '✎' },
  { id: 'health', label: 'Health', color: '#0891b2', icon: '+' },
  { id: 'entertainment', label: 'Entertainment', color: '#ca8a04', icon: '♪' },
  { id: 'shopping', label: 'Shopping', color: '#4d7c0f', icon: '▣' },
  { id: 'personal', label: 'Personal', color: '#be185d', icon: '✂' },
];

export const BUDGET_LIMITS = {
  housing: 1850, groceries: 850, dining: 260, transport: 340, utilities: 400,
  kids: 420, health: 220, entertainment: 180, shopping: 300, personal: 240,
};

export const SAVINGS_PLAN = 1200; // auto-transfer to savings each month

// [date, merchant, category, amount, note] — amount > 0 is money out.
const NOV_SPEND = [
  ['2026-11-01', 'Maple Grove Apartments — rent', 'housing', 1850.00, 'Monthly rent'],
  ['2026-11-02', 'H-E-B Grocery', 'groceries', 148.20, 'Weekly shop'],
  ['2026-11-02', 'Shell — Anderson Ln', 'transport', 42.10, 'Gas'],
  ['2026-11-03', "Torchy's Tacos", 'dining', 38.50, 'Family dinner'],
  ['2026-11-03', 'School lunch — Maya & Leo', 'kids', 45.00, 'November lunch'],
  ['2026-11-04', 'Austin Energy', 'utilities', 128.40, 'Electric bill'],
  ['2026-11-05', "Trader Joe's", 'groceries', 86.40, 'Weekly shop'],
  ['2026-11-05', 'CVS Pharmacy', 'health', 28.40, 'Allergy meds'],
  ['2026-11-06', 'Toll — MoPac Express', 'transport', 12.00, 'Toll'],
  ['2026-11-06', 'Target', 'shopping', 64.80, 'Household goods'],
  ['2026-11-07', 'Chipotle', 'dining', 27.80, 'Lunch'],
  ['2026-11-07', 'Alamo Drafthouse', 'entertainment', 46.00, 'Movie night'],
  ['2026-11-08', 'H-E-B Grocery', 'groceries', 132.75, 'Weekly shop'],
  ['2026-11-08', 'Maya — ballet classes', 'kids', 85.00, 'November term'],
  ['2026-11-09', 'Shell — Anderson Ln', 'transport', 38.75, 'Gas'],
  ['2026-11-09', 'Bright Smiles Dentistry', 'health', 60.00, 'Cleaning copay'],
  ['2026-11-10', 'Papa John\u2019s — pizza night', 'dining', 42.60, 'Friday pizza'],
  ['2026-11-10', 'Daniel — haircut', 'personal', 35.00, 'Barber'],
  ['2026-11-11', 'City of Austin Water', 'utilities', 62.30, 'Water bill'],
  ['2026-11-12', 'Costco', 'groceries', 174.60, 'Bulk shop'],
  ['2026-11-12', 'Leo — soccer league', 'kids', 65.00, 'Fall season'],
  ['2026-11-13', 'Amazon', 'shopping', 89.99, 'Leo birthday gift'],
  ['2026-11-13', 'Uber', 'transport', 24.60, 'Airport ride'],
  ['2026-11-14', 'Sushi Zushi', 'dining', 68.40, 'Date night'],
  ['2026-11-14', 'Spotify Family', 'entertainment', 11.99, 'Music'],
  ['2026-11-15', "Trader Joe's", 'groceries', 64.30, 'Weekly shop'],
  ['2026-11-15', 'School supplies — Staples', 'kids', 38.20, 'Notebooks'],
  ['2026-11-16', 'Shell — Anderson Ln', 'transport', 44.20, 'Gas'],
  ['2026-11-16', 'Priya — haircut', 'personal', 58.00, 'Salon'],
  ['2026-11-17', 'CVS Pharmacy', 'health', 34.75, 'Vitamins'],
  ['2026-11-17', 'Coffee & bagels — Houndstooth', 'dining', 18.90, 'Saturday breakfast'],
  ['2026-11-18', 'T-Mobile', 'utilities', 112.00, 'Family plan'],
  ['2026-11-19', 'H-E-B Grocery', 'groceries', 121.85, 'Weekly shop'],
  ['2026-11-19', 'Old Navy Kids', 'shopping', 72.40, 'Winter clothes'],
  ['2026-11-20', 'CapMetro — monthly pass', 'transport', 25.00, 'Bus pass'],
  ['2026-11-20', 'After-school care', 'kids', 120.00, 'November care'],
  ['2026-11-21', 'Franklin Barbecue', 'dining', 54.75, 'Family lunch'],
  ['2026-11-21', 'Bowling — Westgate Lanes', 'entertainment', 38.00, 'Kids night'],
  ['2026-11-22', 'Pediatrician — Dr. Chen', 'health', 45.00, 'Leo checkup'],
  ['2026-11-23', 'Costco', 'groceries', 96.40, 'Thanksgiving prep'],
  ['2026-11-23', 'Shell — Anderson Ln', 'transport', 39.85, 'Gas'],
  ['2026-11-24', 'Chipotle', 'dining', 23.60, 'Lunch'],
  ['2026-11-24', 'Gym — Castle Hill Fitness', 'personal', 29.00, 'Monthly'],
  ['2026-11-25', 'Target', 'shopping', 41.60, 'Thanksgiving extras'],
  ['2026-11-25', 'Uber', 'transport', 18.40, 'Evening ride'],
];

const NOV_INCOME = [
  ['2026-11-06', 'Paycheck — Daniel (Meridian Projects)', 'income', 2425.00, 'Biweekly pay'],
  ['2026-11-06', 'Paycheck — Priya (St. David\u2019s)', 'income', 1195.00, 'Biweekly pay'],
  ['2026-11-20', 'Paycheck — Daniel (Meridian Projects)', 'income', 2425.00, 'Biweekly pay'],
  ['2026-11-20', 'Paycheck — Priya (St. David\u2019s)', 'income', 1195.00, 'Biweekly pay'],
];

const NOV_SAVINGS = [
  ['2026-11-06', 'Auto-transfer to savings', 'savings', 600.00, 'Payday transfer'],
  ['2026-11-20', 'Auto-transfer to savings', 'savings', 600.00, 'Payday transfer'],
];

const OCT_SPEND = [
  ['2026-10-01', 'Maple Grove Apartments — rent', 'housing', 1850.00, 'Monthly rent'],
  ['2026-10-03', 'H-E-B Grocery', 'groceries', 156.40, 'Weekly shop'],
  ['2026-10-05', 'Shell — Anderson Ln', 'transport', 41.30, 'Gas'],
  ['2026-10-06', 'Austin Energy', 'utilities', 141.20, 'Electric bill'],
  ['2026-10-07', "Trader Joe's", 'groceries', 92.10, 'Weekly shop'],
  ['2026-10-09', 'Chipotle', 'dining', 31.20, 'Lunch'],
  ['2026-10-10', 'Target', 'shopping', 78.50, 'Household goods'],
  ['2026-10-12', 'Costco', 'groceries', 168.90, 'Bulk shop'],
  ['2026-10-14', 'Sushi Zushi', 'dining', 72.80, 'Date night'],
  ['2026-10-15', 'School lunch — Maya & Leo', 'kids', 45.00, 'October lunch'],
  ['2026-10-16', 'Shell — Anderson Ln', 'transport', 39.60, 'Gas'],
  ['2026-10-18', 'CVS Pharmacy', 'health', 41.25, 'Prescription'],
  ['2026-10-19', 'H-E-B Grocery', 'groceries', 129.75, 'Weekly shop'],
  ['2026-10-21', 'Maya — ballet classes', 'kids', 85.00, 'October term'],
  ['2026-10-22', 'Amazon', 'shopping', 64.20, 'Home goods'],
  ['2026-10-24', 'Alamo Drafthouse', 'entertainment', 52.00, 'Movie night'],
  ['2026-10-26', 'T-Mobile', 'utilities', 112.00, 'Family plan'],
  ['2026-10-27', 'City of Austin Water', 'utilities', 58.90, 'Water bill'],
  ['2026-10-28', 'Spectrum Internet', 'utilities', 79.00, 'Internet'],
  ['2026-10-29', 'Uber', 'transport', 21.40, 'Evening ride'],
  ['2026-10-30', 'Halloween costumes', 'kids', 86.00, 'Maya & Leo'],
  ['2026-10-31', "Torchy's Tacos", 'dining', 44.60, 'Halloween dinner'],
];

const OCT_INCOME = [
  ['2026-10-09', 'Paycheck — Daniel (Meridian Projects)', 'income', 2425.00, 'Biweekly pay'],
  ['2026-10-09', 'Paycheck — Priya (St. David\u2019s)', 'income', 1195.00, 'Biweekly pay'],
  ['2026-10-23', 'Paycheck — Daniel (Meridian Projects)', 'income', 2425.00, 'Biweekly pay'],
  ['2026-10-23', 'Paycheck — Priya (St. David\u2019s)', 'income', 1195.00, 'Biweekly pay'],
];

const OCT_SAVINGS = [
  ['2026-10-09', 'Auto-transfer to savings', 'savings', 600.00, 'Payday transfer'],
  ['2026-10-23', 'Auto-transfer to savings', 'savings', 600.00, 'Payday transfer'],
];

function toTxns(rows, kind) {
  return rows.map(([date, merchant, category, amount, note], i) => ({
    id: `${kind}-${date}-${i}`, date, merchant, category, amount, note, kind,
  }));
}

export const MONTHS = {
  '2026-11': {
    label: 'November 2026', daysLeft: 4,
    txns: [...toTxns(NOV_INCOME, 'income'), ...toTxns(NOV_SPEND, 'spend'), ...toTxns(NOV_SAVINGS, 'savings')],
  },
  '2026-10': {
    label: 'October 2026', daysLeft: 0,
    txns: [...toTxns(OCT_INCOME, 'income'), ...toTxns(OCT_SPEND, 'spend'), ...toTxns(OCT_SAVINGS, 'savings')],
  },
};

export const MONTH_ORDER = ['2026-11', '2026-10'];

export const TREND = [
  { month: 'Jul', spent: 4610 }, { month: 'Aug', spent: 4785 },
  { month: 'Sep', spent: 4490 }, { month: 'Oct', spent: 3491 },
  { month: 'Nov', spent: 4505 },
];

export const ACCOUNTS = [
  { name: 'Chase Checking', kind: 'Everyday', balance: 4218.55 },
  { name: 'Chase Savings', kind: 'Emergency & goals', balance: 12940.00 },
  { name: 'Cash — household jar', kind: 'Petty cash', balance: 86.00 },
];

export const BILLS = [
  { id: 'b1', name: 'Rent — Maple Grove', category: 'housing', due: 'Dec 1', amount: 1850.00, autopay: true, paid: false },
  { id: 'b2', name: 'Netflix', category: 'entertainment', due: 'Dec 1', amount: 15.49, autopay: true, paid: false },
  { id: 'b3', name: 'Austin Energy', category: 'utilities', due: 'Dec 5', amount: 132.10, autopay: true, paid: false },
  { id: 'b4', name: 'Spectrum Internet', category: 'utilities', due: 'Dec 8', amount: 79.00, autopay: true, paid: false },
  { id: 'b5', name: 'T-Mobile — family plan', category: 'utilities', due: 'Dec 12', amount: 112.00, autopay: true, paid: false },
  { id: 'b6', name: 'Car insurance — Geico', category: 'transport', due: 'Dec 15', amount: 148.50, autopay: false, paid: false },
  { id: 'b7', name: 'City of Austin Water', category: 'utilities', due: 'Dec 18', amount: 64.20, autopay: true, paid: false },
  { id: 'b8', name: 'Gym — Castle Hill', category: 'personal', due: 'Dec 24', amount: 29.00, autopay: true, paid: false },
];

export const GOALS = [
  { id: 'g1', name: 'Emergency fund', target: 10000, saved: 7850, note: '6 months of essentials — the safety net first.' },
  { id: 'g2', name: 'Family trip — Big Bend', target: 2400, saved: 1120, note: 'Spring break cabin + hiking, March 2027.' },
  { id: 'g3', name: 'New car down payment', target: 6000, saved: 2300, note: 'Replace the 2014 Civic next summer.' },
  { id: 'g4', name: 'Maya & Leo college fund', target: 25000, saved: 4800, note: '$150 a month, every month, since 2021.' },
];

export const TIPS = [
  { title: 'Dining is $14.55 over budget', body: 'Three takeout orders this week pushed Dining Out past its $260 limit. One home-cooked dinner covers it.' },
  { title: 'Groceries are 97% used, 4 days left', body: 'The Thanksgiving shop at Costco used most of the month. The pantry list for next week is already set.' },
  { title: 'Transport is $95 under budget', body: 'Fewer drives and one bus pass month — the lowest fuel spend in five months. That $95 can go to the car fund.' },
  { title: 'Savings ran on autopilot: $1,200', body: 'Both payday transfers landed. Savings rate this month is 16.6% of income, above the 15% target.' },
];
