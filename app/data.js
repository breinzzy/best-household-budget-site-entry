// Hearth's seed data: one household, two months of real ledger rows, the December
// bills and the family's goals. Every figure the site shows is computed from these
// rows — nothing on screen is typed in by hand. November's rows add up to $4,505.00
// spent; October's to $3,491.00.

export const FAMILY = {
  name: 'The Alvarez Family',
  place: 'Austin, Texas',
  members: 'Daniel & Priya, Maya (9), Leo (6)',
};

export const CATEGORIES = [
  { id: 'housing', name: 'Housing', color: '#14532d', limit: 1850 },
  { id: 'groceries', name: 'Groceries', color: '#15803d', limit: 850 },
  { id: 'dining', name: 'Dining Out', color: '#d97706', limit: 260 },
  { id: 'transport', name: 'Transport', color: '#0369a1', limit: 340 },
  { id: 'utilities', name: 'Utilities', color: '#7c3aed', limit: 400 },
  { id: 'kids', name: 'Kids & School', color: '#db2777', limit: 420 },
  { id: 'health', name: 'Health', color: '#0891b2', limit: 220 },
  { id: 'shopping', name: 'Shopping', color: '#65a30d', limit: 300 },
  { id: 'entertainment', name: 'Entertainment', color: '#ca8a04', limit: 420 },
];

export const MONTHS = {
  '2026-11': {
    label: 'November 2026',
    shortLabel: 'Nov 2026',
    daysInMonth: 30,
    daysElapsed: 26,
    daysLeft: 4,
    paydays: 'Nov 6 & 20',
    income: [
      { id: 'i-n1', date: '2026-11-06', from: 'Daniel — paycheck', amount: 2425 },
      { id: 'i-n2', date: '2026-11-06', from: 'Priya — paycheck', amount: 1195 },
      { id: 'i-n3', date: '2026-11-20', from: 'Daniel — paycheck', amount: 2425 },
      { id: 'i-n4', date: '2026-11-20', from: 'Priya — paycheck', amount: 1195 },
    ],
    spend: [
      { id: 'n01', date: '2026-11-01', merchant: 'Maple Grove Apartments', note: 'November rent', category: 'housing', amount: 1850.0 },
      { id: 'n02', date: '2026-11-02', merchant: 'H-E-B Grocery', note: 'Weekly shop', category: 'groceries', amount: 142.35 },
      { id: 'n03', date: '2026-11-03', merchant: "Torchy's Tacos", note: 'Taco Tuesday', category: 'dining', amount: 32.4 },
      { id: 'n04', date: '2026-11-03', merchant: 'Austin Energy', note: 'Electric bill', category: 'utilities', amount: 132.1 },
      { id: 'n05', date: '2026-11-04', merchant: 'Shell — Anderson Ln', note: 'Fuel', category: 'transport', amount: 48.2 },
      { id: 'n06', date: '2026-11-05', merchant: "Trader Joe's", note: 'Snacks and produce', category: 'groceries', amount: 86.4 },
      { id: 'n07', date: '2026-11-05', merchant: 'Target', note: 'School supplies', category: 'kids', amount: 64.8 },
      { id: 'n08', date: '2026-11-06', merchant: 'T-Mobile', note: 'Family plan', category: 'utilities', amount: 112.0 },
      { id: 'n09', date: '2026-11-06', merchant: 'Target', note: 'Home bits', category: 'shopping', amount: 74.25 },
      { id: 'n10', date: '2026-11-07', merchant: 'Chipotle', note: 'Burrito bowls', category: 'dining', amount: 28.75 },
      { id: 'n11', date: '2026-11-07', merchant: 'CVS Pharmacy', note: 'Prescriptions', category: 'health', amount: 42.3 },
      { id: 'n12', date: '2026-11-08', merchant: 'H-E-B Grocery', note: 'Weekly shop', category: 'groceries', amount: 118.75 },
      { id: 'n13', date: '2026-11-08', merchant: 'Alamo Drafthouse', note: 'Movie night', category: 'entertainment', amount: 38.5 },
      { id: 'n14', date: '2026-11-09', merchant: 'Uber', note: 'Airport run', category: 'transport', amount: 18.4 },
      { id: 'n15', date: '2026-11-09', merchant: 'Amazon', note: 'Kids books', category: 'kids', amount: 88.4 },
      { id: 'n16', date: '2026-11-09', merchant: "Torchy's Tacos", note: 'Lunch with Leo', category: 'dining', amount: 36.2 },
      { id: 'n17', date: '2026-11-10', merchant: 'Spotify', note: 'Family plan', category: 'entertainment', amount: 11.99 },
      { id: 'n18', date: '2026-11-12', merchant: 'Costco', note: 'Bulk pantry', category: 'groceries', amount: 112.3 },
      { id: 'n19', date: '2026-11-12', merchant: 'Austin Water', note: 'Water bill', category: 'utilities', amount: 58.6 },
      { id: 'n20', date: '2026-11-13', merchant: 'Shell — Anderson Ln', note: 'Fuel', category: 'transport', amount: 52.15 },
      { id: 'n21', date: '2026-11-13', merchant: 'Amazon', note: 'Household essentials', category: 'shopping', amount: 92.15 },
      { id: 'n22', date: '2026-11-14', merchant: 'Chipotle', note: 'Family burritos', category: 'dining', amount: 24.6 },
      { id: 'n23', date: '2026-11-14', merchant: 'Q2 Stadium', note: 'Austin FC — family match', category: 'entertainment', amount: 92.75 },
      { id: 'n24', date: '2026-11-15', merchant: 'H-E-B Grocery', note: 'Weekly shop', category: 'groceries', amount: 96.2 },
      { id: 'n25', date: '2026-11-15', merchant: 'Austin Urgent Care', note: 'Co-pay — Maya', category: 'health', amount: 68.45 },
      { id: 'n26', date: '2026-11-15', merchant: 'Alamo Drafthouse', note: 'Sunday matinee', category: 'entertainment', amount: 44.75 },
      { id: 'n27', date: '2026-11-16', merchant: 'Target', note: 'Winter clothes — Maya', category: 'kids', amount: 72.5 },
      { id: 'n28', date: '2026-11-17', merchant: 'Uber', note: 'Downtown ride', category: 'transport', amount: 22.75 },
      { id: 'n29', date: '2026-11-18', merchant: 'Whataburger', note: 'Drive-through dinner', category: 'dining', amount: 41.25 },
      { id: 'n30', date: '2026-11-18', merchant: 'Target', note: 'Holiday decor', category: 'shopping', amount: 61.0 },
      { id: 'n31', date: '2026-11-19', merchant: "Trader Joe's", note: 'Produce and cheese', category: 'groceries', amount: 74.1 },
      { id: 'n32', date: '2026-11-20', merchant: 'City of Austin Parking', note: 'Downtown parking', category: 'transport', amount: 25.0 },
      { id: 'n33', date: '2026-11-21', merchant: 'Shell — Anderson Ln', note: 'Fuel', category: 'transport', amount: 46.8 },
      { id: 'n34', date: '2026-11-21', merchant: 'Amazon', note: "Leo's birthday gift", category: 'kids', amount: 58.25 },
      { id: 'n35', date: '2026-11-21', merchant: 'CVS Pharmacy', note: 'Vitamins and first aid', category: 'health', amount: 57.4 },
      { id: 'n36', date: '2026-11-22', merchant: 'Costco', note: 'Turkey and sides', category: 'groceries', amount: 68.45 },
      { id: 'n37', date: '2026-11-22', merchant: 'Alamo Drafthouse', note: 'Sunday matinee', category: 'entertainment', amount: 30.01 },
      { id: 'n38', date: '2026-11-23', merchant: "Torchy's Tacos", note: 'Friends over dinner', category: 'dining', amount: 56.85 },
      { id: 'n39', date: '2026-11-24', merchant: 'H-E-B Grocery', note: 'Last-minute pantry', category: 'groceries', amount: 41.5 },
      { id: 'n40', date: '2026-11-24', merchant: 'Target', note: 'Thanksgiving crafts', category: 'kids', amount: 69.25 },
      { id: 'n41', date: '2026-11-25', merchant: 'Uber', note: 'Evening ride', category: 'transport', amount: 31.6 },
      { id: 'n42', date: '2026-11-25', merchant: 'Target', note: 'Thanksgiving extras', category: 'shopping', amount: 41.6 },
      { id: 'n43', date: '2026-11-26', merchant: 'H-E-B Grocery', note: 'Thanksgiving top-up', category: 'groceries', amount: 84.45 },
      { id: 'n44', date: '2026-11-26', merchant: "Torchy's Tacos", note: 'Thanksgiving tacos', category: 'dining', amount: 54.5 },
    ],
  },
  '2026-10': {
    label: 'October 2026',
    shortLabel: 'Oct 2026',
    daysInMonth: 31,
    daysElapsed: 31,
    daysLeft: 0,
    paydays: 'Oct 6 & 20',
    income: [
      { id: 'i-o1', date: '2026-10-06', from: 'Daniel — paycheck', amount: 2425 },
      { id: 'i-o2', date: '2026-10-06', from: 'Priya — paycheck', amount: 1195 },
      { id: 'i-o3', date: '2026-10-20', from: 'Daniel — paycheck', amount: 2425 },
      { id: 'i-o4', date: '2026-10-20', from: 'Priya — paycheck', amount: 1195 },
    ],
    spend: [
      { id: 'o01', date: '2026-10-01', merchant: 'Maple Grove Apartments', note: 'October rent', category: 'housing', amount: 1850.0 },
      { id: 'o02', date: '2026-10-03', merchant: 'H-E-B Grocery', note: 'Weekly shop', category: 'groceries', amount: 128.6 },
      { id: 'o03', date: '2026-10-04', merchant: "Torchy's Tacos", note: 'Taco Tuesday', category: 'dining', amount: 28.9 },
      { id: 'o04', date: '2026-10-04', merchant: 'Austin Energy', note: 'Electric bill', category: 'utilities', amount: 118.45 },
      { id: 'o05', date: '2026-10-05', merchant: 'Shell — Anderson Ln', note: 'Fuel', category: 'transport', amount: 44.6 },
      { id: 'o06', date: '2026-10-06', merchant: 'T-Mobile', note: 'Family plan', category: 'utilities', amount: 112.0 },
      { id: 'o07', date: '2026-10-07', merchant: "Trader Joe's", note: 'Snacks and produce', category: 'groceries', amount: 74.25 },
      { id: 'o08', date: '2026-10-08', merchant: 'Target', note: 'School supplies', category: 'kids', amount: 58.2 },
      { id: 'o09', date: '2026-10-10', merchant: 'Chipotle', note: 'Burrito bowls', category: 'dining', amount: 26.4 },
      { id: 'o10', date: '2026-10-11', merchant: 'H-E-B Grocery', note: 'Weekly shop', category: 'groceries', amount: 132.8 },
      { id: 'o11', date: '2026-10-11', merchant: 'CVS Pharmacy', note: 'Prescriptions', category: 'health', amount: 36.75 },
      { id: 'o12', date: '2026-10-12', merchant: 'Uber', note: 'Airport run', category: 'transport', amount: 16.85 },
      { id: 'o13', date: '2026-10-14', merchant: 'Austin Water', note: 'Water bill', category: 'utilities', amount: 38.45 },
      { id: 'o14', date: '2026-10-15', merchant: 'Target', note: 'Home bits', category: 'shopping', amount: 49.0 },
      { id: 'o15', date: '2026-10-17', merchant: 'Costco', note: 'Bulk pantry', category: 'groceries', amount: 98.4 },
      { id: 'o16', date: '2026-10-18', merchant: "Torchy's Tacos", note: 'Lunch with Leo', category: 'dining', amount: 41.75 },
      { id: 'o17', date: '2026-10-19', merchant: 'Shell — Anderson Ln', note: 'Fuel', category: 'transport', amount: 47.3 },
      { id: 'o18', date: '2026-10-19', merchant: 'Amazon', note: 'Kids books', category: 'kids', amount: 66.55 },
      { id: 'o19', date: '2026-10-21', merchant: 'H-E-B Grocery', note: 'Weekly shop', category: 'groceries', amount: 88.15 },
      { id: 'o20', date: '2026-10-24', merchant: 'Whataburger', note: 'Drive-through dinner', category: 'dining', amount: 38.55 },
      { id: 'o21', date: '2026-10-25', merchant: "Trader Joe's", note: 'Produce and cheese', category: 'groceries', amount: 64.9 },
      { id: 'o22', date: '2026-10-26', merchant: 'Uber', note: 'Evening ride', category: 'transport', amount: 28.4 },
      { id: 'o23', date: '2026-10-26', merchant: 'CVS Pharmacy', note: 'Vitamins and first aid', category: 'health', amount: 49.35 },
      { id: 'o24', date: '2026-10-28', merchant: 'Shell — Anderson Ln', note: 'Fuel', category: 'transport', amount: 64.4 },
      { id: 'o25', date: '2026-10-29', merchant: 'H-E-B Grocery', note: 'Weekly shop', category: 'groceries', amount: 125.3 },
      { id: 'o26', date: '2026-10-30', merchant: 'Chipotle', note: 'Family burritos', category: 'dining', amount: 62.7 },
    ],
  },
};

// Two payday transfers a month, $600 each, straight to savings.
export const SAVINGS_PLAN = 1200;

// Five months of spending by category, for the Reports page. Each month's
// categories add up to that month's total: Jul $4,120, Aug $4,388, Sep $3,972,
// Oct $3,491 (the ledger above), Nov $4,505 (the ledger above).
export const TREND = [
  { month: 'Jul 2026', total: 4120, byCategory: { housing: 1850, groceries: 780, dining: 240, transport: 230, utilities: 310, kids: 290, health: 150, shopping: 190, entertainment: 80 } },
  { month: 'Aug 2026', total: 4388, byCategory: { housing: 1850, groceries: 810, dining: 265, transport: 255, utilities: 295, kids: 310, health: 175, shopping: 240, entertainment: 188 } },
  { month: 'Sep 2026', total: 3972, byCategory: { housing: 1850, groceries: 695, dining: 210, transport: 220, utilities: 285, kids: 265, health: 140, shopping: 175, entertainment: 132 } },
  { month: 'Oct 2026', total: 3491, byCategory: { housing: 1850, groceries: 712.4, dining: 198.3, transport: 201.55, utilities: 268.9, kids: 124.75, health: 86.1, shopping: 49, entertainment: 0 } },
  { month: 'Nov 2026', total: 4505, byCategory: { housing: 1850, groceries: 824.5, dining: 274.55, transport: 244.9, utilities: 302.7, kids: 353.2, health: 168.15, shopping: 269, entertainment: 218 } },
];

// December's bills: 8 due, $2,435.48 in all. Autopay handles most of them;
// the two marked manual need a tap.
export const BILLS = [
  { id: 'b-rent', name: 'Maple Grove Apartments', what: 'Rent', amount: 1850.0, due: 'Dec 1', autopay: true },
  { id: 'b-electric', name: 'Austin Energy', what: 'Electric', amount: 128.0, due: 'Dec 5', autopay: true },
  { id: 'b-phone', name: 'T-Mobile', what: 'Family plan', amount: 112.0, due: 'Dec 6', autopay: true },
  { id: 'b-water', name: 'Austin Water', what: 'Water', amount: 54.0, due: 'Dec 9', autopay: true },
  { id: 'b-internet', name: 'Spectrum', what: 'Internet', amount: 89.99, due: 'Dec 12', autopay: true },
  { id: 'b-insurance', name: 'Geico', what: 'Car insurance', amount: 142.5, due: 'Dec 15', autopay: false },
  { id: 'b-music', name: 'Spotify', what: 'Family plan', amount: 19.99, due: 'Dec 18', autopay: true },
  { id: 'b-gym', name: "Gold's Gym", what: 'Membership', amount: 39.0, due: 'Dec 20', autopay: false },
];

export const PAID_BILLS = [
  { id: 'p-rent', name: 'Maple Grove Apartments', what: 'Rent', amount: 1850.0, due: 'Nov 1' },
  { id: 'p-electric', name: 'Austin Energy', what: 'Electric', amount: 132.1, due: 'Nov 3' },
  { id: 'p-phone', name: 'T-Mobile', what: 'Family plan', amount: 112.0, due: 'Nov 6' },
];

// The family's goals. `monthly` is the planned contribution each month; the
// projected finish date is computed from what is left divided by it.
export const GOALS = [
  { id: 'g-emergency', name: 'Emergency fund', saved: 7850, target: 10000, monthly: 600, note: 'Six months of essentials — nearly there.' },
  { id: 'g-vacation', name: 'Family vacation — Big Bend', saved: 1450, target: 2500, monthly: 150, note: 'Spring road trip to Big Bend National Park.' },
  { id: 'g-car', name: 'New car', saved: 3400, target: 6000, monthly: 250, note: 'Trading in the 2016 Civic next fall.' },
];

// Paydays land on the 6th and the 20th. As the site is dated (Nov 26), the
// next one is Dec 6 — 10 days away.
export const NEXT_PAYDAY = { label: 'Dec 6', daysAway: 10 };
