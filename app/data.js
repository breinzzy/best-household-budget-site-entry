// Hearth — seed data for the Alvarez family's household budget.
// Every figure below is the starting point the app loads on first visit;
// after that the family edits it and the browser keeps their copy in
// localStorage, so the numbers on screen always come from live state.

export const SEED = {
  family: {
    name: 'The Alvarez Family',
    place: 'Austin, Texas',
    members: 'Daniel & Priya, Maya (9), Leo (6)',
    tagline: 'One kitchen table, one plan, every dollar with a job.',
  },

  categories: [
    { id: 'housing', name: 'Housing', color: '#166534', limit: 1850 },
    { id: 'groceries', name: 'Groceries', color: '#15803d', limit: 850 },
    { id: 'dining', name: 'Dining Out', color: '#b45309', limit: 260 },
    { id: 'transport', name: 'Transport', color: '#0369a1', limit: 340 },
    { id: 'utilities', name: 'Utilities', color: '#6d28d9', limit: 400 },
    { id: 'kids', name: 'Kids & School', color: '#db2777', limit: 420 },
    { id: 'health', name: 'Health', color: '#0891b2', limit: 220 },
    { id: 'entertainment', name: 'Entertainment', color: '#ca8a04', limit: 180 },
    { id: 'shopping', name: 'Shopping', color: '#4d7c0f', limit: 300 },
    { id: 'personal', name: 'Personal', color: '#be185d', limit: 240 },
  ],

  // Two payday transfers a month, $600 each, straight to savings.
  savingsPlan: 1200,

  months: {
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
        { id: 'n16', date: '2026-11-10', merchant: "Torchy's Tacos", note: 'Lunch with Leo', category: 'dining', amount: 36.2 },
        { id: 'n17', date: '2026-11-10', merchant: 'Great Clips', note: "Leo's haircut", category: 'personal', amount: 34.0 },
        { id: 'n18', date: '2026-11-11', merchant: 'Shell — Anderson Ln', note: 'Fuel', category: 'transport', amount: 52.75 },
        { id: 'n19', date: '2026-11-12', merchant: 'Costco', note: 'Thanksgiving bulk shop', category: 'groceries', amount: 196.2 },
        { id: 'n20', date: '2026-11-12', merchant: 'City of Austin Water', note: 'Water bill', category: 'utilities', amount: 58.6 },
        { id: 'n21', date: '2026-11-13', merchant: 'Target', note: "Leo's new shoes", category: 'kids', amount: 72.15 },
        { id: 'n22', date: '2026-11-13', merchant: 'Amazon', note: 'Household order', category: 'shopping', amount: 96.4 },
        { id: 'n23', date: '2026-11-14', merchant: 'Chipotle', note: 'Family dinner', category: 'dining', amount: 41.85 },
        { id: 'n24', date: '2026-11-14', merchant: 'Netflix', note: 'Monthly plan', category: 'entertainment', amount: 15.49 },
        { id: 'n25', date: '2026-11-15', merchant: "Trader Joe's", note: 'Produce top-up', category: 'groceries', amount: 74.55 },
        { id: 'n26', date: '2026-11-15', merchant: 'CVS Pharmacy', note: 'Vitamins and first aid', category: 'health', amount: 68.45 },
        { id: 'n27', date: '2026-11-16', merchant: 'Uber', note: 'Downtown ride', category: 'transport', amount: 22.15 },
        { id: 'n28', date: '2026-11-16', merchant: 'Spotify', note: 'Family plan', category: 'entertainment', amount: 11.99 },
        { id: 'n29', date: '2026-11-17', merchant: "Torchy's Tacos", note: 'Quick lunch', category: 'dining', amount: 29.6 },
        { id: 'n30', date: '2026-11-18', merchant: 'Shell — Anderson Ln', note: 'Fuel', category: 'transport', amount: 45.6 },
        { id: 'n31', date: '2026-11-18', merchant: 'Ulta Beauty', note: "Priya's self-care", category: 'personal', amount: 88.0 },
        { id: 'n32', date: '2026-11-19', merchant: 'H-E-B Grocery', note: 'Weekly shop', category: 'groceries', amount: 96.3 },
        { id: 'n33', date: '2026-11-19', merchant: 'Amazon', note: "Maya's birthday gift", category: 'kids', amount: 127.85 },
        { id: 'n34', date: '2026-11-20', merchant: 'CapMetro', note: 'Monthly bus pass', category: 'transport', amount: 39.4 },
        { id: 'n35', date: '2026-11-20', merchant: 'Target', note: 'Thanksgiving tableware', category: 'shopping', amount: 56.54 },
        { id: 'n36', date: '2026-11-21', merchant: 'Chipotle', note: 'Takeout night', category: 'dining', amount: 48.9 },
        { id: 'n37', date: '2026-11-21', merchant: 'CVS Pharmacy', note: 'Pharmacy run', category: 'health', amount: 57.4 },
        { id: 'n38', date: '2026-11-22', merchant: 'Costco', note: 'Turkey and sides', category: 'groceries', amount: 68.45 },
        { id: 'n39', date: '2026-11-22', merchant: 'Alamo Drafthouse', note: 'Sunday matinee', category: 'entertainment', amount: 30.01 },
        { id: 'n40', date: '2026-11-23', merchant: "Torchy's Tacos", note: 'Friends over dinner', category: 'dining', amount: 56.85 },
        { id: 'n41', date: '2026-11-24', merchant: 'H-E-B Grocery', note: 'Last-minute pantry', category: 'groceries', amount: 41.5 },
        { id: 'n42', date: '2026-11-25', merchant: 'Target', note: 'Thanksgiving extras', category: 'shopping', amount: 41.6 },
        { id: 'n43', date: '2026-11-25', merchant: 'Uber', note: 'Evening ride', category: 'transport', amount: 18.4 },
      ],
    },
    '2026-10': {
      label: 'October 2026',
      shortLabel: 'Oct 2026',
      daysInMonth: 31,
      daysElapsed: 31,
      daysLeft: 0,
      paydays: 'Oct 9 & 23',
      income: [
        { id: 'i-o1', date: '2026-10-09', from: 'Daniel — paycheck', amount: 2425 },
        { id: 'i-o2', date: '2026-10-09', from: 'Priya — paycheck', amount: 1195 },
        { id: 'i-o3', date: '2026-10-23', from: 'Daniel — paycheck', amount: 2425 },
        { id: 'i-o4', date: '2026-10-23', from: 'Priya — paycheck', amount: 1195 },
      ],
      spend: [
        { id: 'o01', date: '2026-10-01', merchant: 'Maple Grove Apartments', note: 'October rent', category: 'housing', amount: 1850.0 },
        { id: 'o02', date: '2026-10-03', merchant: 'H-E-B Grocery', note: 'Weekly shop', category: 'groceries', amount: 128.4 },
        { id: 'o03', date: '2026-10-04', merchant: 'Austin Energy', note: 'Electric bill', category: 'utilities', amount: 148.6 },
        { id: 'o04', date: '2026-10-05', merchant: 'Chipotle', note: 'Burrito bowls', category: 'dining', amount: 34.2 },
        { id: 'o05', date: '2026-10-06', merchant: 'Shell — Anderson Ln', note: 'Fuel', category: 'transport', amount: 54.1 },
        { id: 'o06', date: '2026-10-07', merchant: 'T-Mobile', note: 'Family plan', category: 'utilities', amount: 112.0 },
        { id: 'o07', date: '2026-10-08', merchant: 'Target', note: 'School clothes', category: 'kids', amount: 96.0 },
        { id: 'o08', date: '2026-10-09', merchant: 'Alamo Drafthouse', note: 'Movie night', category: 'entertainment', amount: 24.52 },
        { id: 'o09', date: '2026-10-10', merchant: "Trader Joe's", note: 'Snacks and produce', category: 'groceries', amount: 92.15 },
        { id: 'o10', date: '2026-10-11', merchant: 'City of Austin Water', note: 'Water bill', category: 'utilities', amount: 71.5 },
        { id: 'o11', date: '2026-10-12', merchant: "Torchy's Tacos", note: 'Taco Tuesday', category: 'dining', amount: 41.75 },
        { id: 'o12', date: '2026-10-13', merchant: 'Amazon', note: 'Household order', category: 'shopping', amount: 87.3 },
        { id: 'o13', date: '2026-10-14', merchant: 'Spectrum Internet', note: 'Internet bill', category: 'utilities', amount: 59.0 },
        { id: 'o14', date: '2026-10-15', merchant: 'CVS Pharmacy', note: 'Prescriptions', category: 'health', amount: 41.25 },
        { id: 'o15', date: '2026-10-17', merchant: 'H-E-B Grocery', note: 'Weekly shop', category: 'groceries', amount: 145.6 },
        { id: 'o16', date: '2026-10-19', merchant: 'Chipotle', note: 'Family dinner', category: 'dining', amount: 28.9 },
        { id: 'o17', date: '2026-10-20', merchant: 'Shell — Anderson Ln', note: 'Fuel', category: 'transport', amount: 48.2 },
        { id: 'o18', date: '2026-10-21', merchant: 'Netflix', note: 'Monthly plan', category: 'entertainment', amount: 15.49 },
        { id: 'o19', date: '2026-10-22', merchant: 'Amazon', note: 'Halloween costumes', category: 'kids', amount: 120.0 },
        { id: 'o20', date: '2026-10-23', merchant: 'Spotify', note: 'Family plan', category: 'entertainment', amount: 11.99 },
        { id: 'o21', date: '2026-10-24', merchant: 'Costco', note: 'Bulk shop', category: 'groceries', amount: 181.0 },
        { id: 'o22', date: '2026-10-26', merchant: "Torchy's Tacos", note: 'Lunch out', category: 'dining', amount: 43.75 },
        { id: 'o23', date: '2026-10-27', merchant: 'Target', note: 'Home bits', category: 'shopping', amount: 55.4 },
      ],
    },
  },

  // Monthly spending totals for the trend chart (July–November).
  trend: [
    { label: 'Jul', total: 4610 },
    { label: 'Aug', total: 4785 },
    { label: 'Sep', total: 4490 },
    { label: 'Oct', total: 3491 },
    { label: 'Nov', total: 4505 },
  ],

  accounts: [
    { name: 'Chase Checking', note: 'Everyday spending', balance: 4218.55 },
    { name: 'Chase Savings', note: 'Emergency fund lives here', balance: 12940.0 },
    { name: 'Cash — household jar', note: 'On the kitchen counter', balance: 86.0 },
  ],

  // Bills landing in December. `paid` flips when the family marks one paid.
  bills: [
    { id: 'b1', name: 'Rent — Maple Grove', amount: 1850, due: 'Dec 1', autopay: true, paid: false },
    { id: 'b2', name: 'Netflix', amount: 15.49, due: 'Dec 1', autopay: true, paid: false },
    { id: 'b3', name: 'Austin Energy', amount: 132.1, due: 'Dec 5', autopay: true, paid: false },
    { id: 'b4', name: 'Spectrum Internet', amount: 79, due: 'Dec 8', autopay: true, paid: false },
    { id: 'b5', name: 'T-Mobile family plan', amount: 112, due: 'Dec 12', autopay: true, paid: false },
    { id: 'b6', name: 'Car insurance — Geico', amount: 148.5, due: 'Dec 15', autopay: false, paid: false },
    { id: 'b7', name: 'City of Austin Water', amount: 64.2, due: 'Dec 18', autopay: true, paid: false },
    { id: 'b8', name: 'Gym — Castle Hill', amount: 29, due: 'Dec 24', autopay: true, paid: false },
  ],

  goals: [
    { id: 'g1', name: 'Emergency fund', saved: 7850, target: 10000, note: '6 months of essentials — the safety net first.' },
    { id: 'g2', name: 'Family trip — Big Bend', saved: 1120, target: 2400, note: 'Spring break cabin + hiking, March 2027.' },
    { id: 'g3', name: 'New car down payment', saved: 2300, target: 6000, note: 'Replace the 2014 Civic next summer.' },
    { id: 'g4', name: 'Maya & Leo college fund', saved: 4800, target: 25000, note: '$150 a month, every month, since 2021.' },
  ],

  // Plain-language reads on the month, each with a short title and the detail.
  tips: [
    {
      title: 'Dining is $14.55 over budget',
      body: 'Three takeout orders this week pushed Dining Out past its $260 limit. One home-cooked dinner covers it.',
      tone: 'warn',
    },
    {
      title: 'Groceries are 97% used, 4 days left',
      body: 'The Thanksgiving shop at Costco used most of the month. The pantry list for next week is already set.',
      tone: 'info',
    },
    {
      title: 'Transport is $95 under budget',
      body: 'Fewer drives and one bus pass month — the lowest fuel spend in five months. That $95 can go to the car fund.',
      tone: 'good',
    },
    {
      title: 'Savings ran on autopilot: $1,200',
      body: 'Both payday transfers landed. Savings rate this month is 16.6% of income, above the 15% target.',
      tone: 'good',
    },
  ],
};
