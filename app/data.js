// Hearth — The Alvarez House. The seed data for one household's money.
// Every figure below reconciles by hand: November's eight categories add
// up to exactly $4,505.00, October's to $3,491.00, and the five months
// July–November to $20,476.00. Income is $7,240 a month; November saved
// $1,200 and left $1,535 unassigned (7,240 − 4,505 − 1,200 = 1,535).
// "Today" inside the site is Sunday, November 29, 2026.

const HEARTH = {
  family: {
    name: "The Alvarez Family",
    place: "Austin, Texas",
    members: "Daniel & Priya, Maya (9), Leo (6)",
    today: "Sunday, November 29, 2026",
    payday: "December 6",
    paydayInDays: 7
  },

  months: ["Jul", "Aug", "Sep", "Oct", "Nov"],

  income: {
    total: 7240,
    sources: [
      { label: "Daniel — salary", amount: 4600 },
      { label: "Priya — salary", amount: 2340 },
      { label: "Weekend freelance", amount: 300 }
    ]
  },

  // One room of the house per category. spent holds each month; the
  // November column is the month the site opens on.
  categories: [
    { id: "groceries", room: "Kitchen", label: "Groceries",
      spent: { Jul: 812.30, Aug: 790.45, Sep: 806.90, Oct: 798.20, Nov: 824.50 },
      budget: 850 },
    { id: "dining", room: "Dining Room", label: "Dining out",
      spent: { Jul: 245.60, Aug: 268.90, Sep: 252.75, Oct: 231.40, Nov: 274.55 },
      budget: 260 },
    { id: "entertainment", room: "Living Room", label: "Fun & films",
      spent: { Jul: 298.40, Aug: 310.25, Sep: 287.60, Oct: 265.00, Nov: 318.75 },
      budget: 320 },
    { id: "housing", room: "Bedroom", label: "House & mortgage",
      spent: { Jul: 1485.00, Aug: 1485.00, Sep: 1485.00, Oct: 1485.00, Nov: 1485.00 },
      budget: 1500 },
    { id: "kids", room: "Kids' Room", label: "Kids & school",
      spent: { Jul: 385.20, Aug: 402.75, Sep: 368.40, Oct: 198.75, Nov: 412.30 },
      budget: 450 },
    { id: "health", room: "Bathroom", label: "Health",
      spent: { Jul: 172.60, Aug: 165.30, Sep: 190.45, Oct: 142.90, Nov: 186.20 },
      budget: 200 },
    { id: "transport", room: "Garage", label: "Getting around",
      spent: { Jul: 398.50, Aug: 375.20, Sep: 410.80, Oct: 189.30, Nov: 402.15 },
      budget: 420 },
    { id: "home", room: "Garden", label: "Home & garden",
      spent: { Jul: 382.65, Aug: 254.75, Sep: 445.25, Oct: 180.45, Nov: 601.55 },
      budget: 600 }
  ],

  // What the family put aside each month; the kept rate climbs all year.
  savedByMonth: { Jul: 980, Aug: 1050, Sep: 1100, Oct: 1150, Nov: 1200 },

  goals: [
    { id: "emergency", name: "Emergency fund", saved: 7850, target: 10000,
      monthly: 500, finish: "March 2027",
      note: "Six months of must-pay bills, for the month nobody plans." },
    { id: "kitchen", name: "Kitchen remodel", saved: 4200, target: 12000,
      monthly: 350, finish: "September 2028",
      note: "New counters, a working oven, a table that seats six." },
    { id: "trip", name: "Big Bend family trip", saved: 950, target: 2500,
      monthly: 150, finish: "September 2027",
      note: "Three nights under the desert stars, Maya's idea." },
    { id: "car", name: "Next family car", saved: 2100, target: 6000,
      monthly: 200, finish: "July 2028",
      note: "A down payment, so the next car is chosen, not forced." }
  ],

  bills: [
    { id: "mortgage", name: "Mortgage", amount: 1350.00, due: "Dec 1", paid: false },
    { id: "streaming", name: "Streaming bundle", amount: 22.99, due: "Dec 3", paid: false },
    { id: "insurance", name: "Home insurance", amount: 135.00, due: "Dec 5", paid: false },
    { id: "soccer", name: "Leo's soccer — winter term", amount: 85.00, due: "Dec 7", paid: false },
    { id: "electric", name: "Electric", amount: 142.80, due: "Dec 8", paid: false },
    { id: "internet", name: "Internet", amount: 79.99, due: "Dec 10", paid: false },
    { id: "phone", name: "Phone plan", amount: 71.00, due: "Dec 12", paid: false },
    { id: "water", name: "Water", amount: 68.40, due: "Dec 15", paid: false }
  ],

  // November transactions, grouped by category; each group sums exactly
  // to its category's November figure above.
  txNov: [
    { d: "Nov 2", cat: "groceries", label: "H-E-B weekly shop", amount: 142.30 },
    { d: "Nov 5", cat: "groceries", label: "Trader Joe's", amount: 86.40 },
    { d: "Nov 9", cat: "groceries", label: "H-E-B top-up", amount: 50.91 },
    { d: "Nov 12", cat: "groceries", label: "Costco run", amount: 198.60 },
    { d: "Nov 16", cat: "groceries", label: "H-E-B weekly shop", amount: 118.20 },
    { d: "Nov 21", cat: "groceries", label: "Farmers market", amount: 42.15 },
    { d: "Nov 23", cat: "groceries", label: "H-E-B Thanksgiving shop", amount: 185.94 },

    { d: "Nov 3", cat: "dining", label: "Taco truck lunch", amount: 24.50 },
    { d: "Nov 7", cat: "dining", label: "Pizza night", amount: 38.75 },
    { d: "Nov 11", cat: "dining", label: "Lunch, Priya's team", amount: 31.20 },
    { d: "Nov 14", cat: "dining", label: "BBQ joint", amount: 52.40 },
    { d: "Nov 18", cat: "dining", label: "Sushi takeout", amount: 64.85 },
    { d: "Nov 22", cat: "dining", label: "Coffee & pastries", amount: 18.90 },
    { d: "Nov 25", cat: "dining", label: "Taco Tuesday", amount: 28.45 },
    { d: "Nov 27", cat: "dining", label: "Breakfast tacos", amount: 15.50 },

    { d: "Nov 1", cat: "entertainment", label: "Movie night", amount: 46.00 },
    { d: "Nov 8", cat: "entertainment", label: "Streaming bundle", amount: 22.99 },
    { d: "Nov 13", cat: "entertainment", label: "Board game for Maya", amount: 34.95 },
    { d: "Nov 17", cat: "entertainment", label: "Concert tickets", amount: 120.00 },
    { d: "Nov 22", cat: "entertainment", label: "Bowling with Leo", amount: 48.50 },
    { d: "Nov 26", cat: "entertainment", label: "Kids' movie rental", amount: 12.99 },
    { d: "Nov 29", cat: "entertainment", label: "Arcade afternoon", amount: 33.32 },

    { d: "Nov 1", cat: "housing", label: "Mortgage", amount: 1350.00 },
    { d: "Nov 5", cat: "housing", label: "Home insurance", amount: 135.00 },

    { d: "Nov 4", cat: "kids", label: "Maya's art class", amount: 65.00 },
    { d: "Nov 10", cat: "kids", label: "Leo's soccer fee", amount: 85.00 },
    { d: "Nov 15", cat: "kids", label: "School supplies", amount: 42.30 },
    { d: "Nov 19", cat: "kids", label: "Maya's book fair", amount: 28.00 },
    { d: "Nov 21", cat: "kids", label: "Leo's new shoes", amount: 64.00 },
    { d: "Nov 26", cat: "kids", label: "Piano books", amount: 58.00 },
    { d: "Nov 28", cat: "kids", label: "Craft supplies", amount: 70.00 },

    { d: "Nov 6", cat: "health", label: "Pharmacy", amount: 32.40 },
    { d: "Nov 12", cat: "health", label: "Dentist copay", amount: 75.00 },
    { d: "Nov 19", cat: "health", label: "Vitamins", amount: 28.80 },
    { d: "Nov 25", cat: "health", label: "Eye drops", amount: 12.50 },
    { d: "Nov 27", cat: "health", label: "Gym, Priya", amount: 37.50 },

    { d: "Nov 2", cat: "transport", label: "Gas", amount: 48.20 },
    { d: "Nov 7", cat: "transport", label: "Gas", amount: 52.75 },
    { d: "Nov 12", cat: "transport", label: "Bus passes", amount: 36.00 },
    { d: "Nov 15", cat: "transport", label: "Car wash", amount: 18.50 },
    { d: "Nov 18", cat: "transport", label: "Gas", amount: 55.40 },
    { d: "Nov 21", cat: "transport", label: "Oil change", amount: 89.00 },
    { d: "Nov 25", cat: "transport", label: "Gas", amount: 61.30 },
    { d: "Nov 28", cat: "transport", label: "Parking downtown", amount: 41.00 },

    { d: "Nov 3", cat: "home", label: "Electric bill", amount: 142.80 },
    { d: "Nov 8", cat: "home", label: "Water bill", amount: 68.40 },
    { d: "Nov 10", cat: "home", label: "Internet", amount: 79.99 },
    { d: "Nov 14", cat: "home", label: "Garden supplies", amount: 56.20 },
    { d: "Nov 19", cat: "home", label: "Plumber visit", amount: 145.00 },
    { d: "Nov 23", cat: "home", label: "Light bulbs & filters", amount: 38.16 },
    { d: "Nov 26", cat: "home", label: "Phone plan", amount: 71.00 }
  ],

  // October transactions; they sum to $3,491.00.
  txOct: [
    { d: "Oct 4", cat: "groceries", label: "H-E-B weekly shop", amount: 145.60 },
    { d: "Oct 11", cat: "groceries", label: "Costco run", amount: 210.35 },
    { d: "Oct 18", cat: "groceries", label: "H-E-B weekly shop", amount: 132.45 },
    { d: "Oct 25", cat: "groceries", label: "H-E-B weekly shop", amount: 158.90 },
    { d: "Oct 28", cat: "groceries", label: "Farmers market", amount: 28.90 },
    { d: "Oct 30", cat: "groceries", label: "H-E-B top-up", amount: 122.00 },

    { d: "Oct 6", cat: "dining", label: "Taco truck", amount: 41.20 },
    { d: "Oct 13", cat: "dining", label: "Pizza night", amount: 58.75 },
    { d: "Oct 20", cat: "dining", label: "BBQ joint", amount: 72.45 },
    { d: "Oct 27", cat: "dining", label: "Sushi takeout", amount: 59.00 },

    { d: "Oct 3", cat: "entertainment", label: "Movie night", amount: 89.00 },
    { d: "Oct 17", cat: "entertainment", label: "Concert tickets", amount: 120.00 },
    { d: "Oct 24", cat: "entertainment", label: "Board game", amount: 33.01 },
    { d: "Oct 31", cat: "entertainment", label: "Streaming bundle", amount: 22.99 },

    { d: "Oct 1", cat: "housing", label: "Mortgage", amount: 1350.00 },
    { d: "Oct 5", cat: "housing", label: "Home insurance", amount: 135.00 },

    { d: "Oct 8", cat: "kids", label: "Leo's soccer gear", amount: 110.00 },
    { d: "Oct 22", cat: "kids", label: "Maya's art supplies", amount: 88.75 },

    { d: "Oct 9", cat: "health", label: "Pharmacy", amount: 48.90 },
    { d: "Oct 21", cat: "health", label: "Dentist copay", amount: 94.00 },

    { d: "Oct 5", cat: "transport", label: "Gas", amount: 62.40 },
    { d: "Oct 19", cat: "transport", label: "Gas", amount: 71.50 },
    { d: "Oct 26", cat: "transport", label: "Bus passes", amount: 55.40 },

    { d: "Oct 3", cat: "home", label: "Electric bill", amount: 100.46 },
    { d: "Oct 12", cat: "home", label: "Internet", amount: 79.99 }
  ]
};
