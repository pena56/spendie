import { TransactionCategory } from "../src/constants/categories";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to get random date within last 3 months
function getRandomDate(monthsAgo: number): number {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const randomTime =
    startDate.getTime() +
    Math.random() * (endDate.getTime() - startDate.getTime());
  return randomTime;
}

// Helper to get random day of month
function getDateInMonth(monthsAgo: number, day: number): number {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
  return date.getTime();
}

// Helper to add some randomness to amounts
function vary(amount: number, variance: number = 0.1): number {
  return Math.round(amount * (1 + (Math.random() - 0.5) * variance));
}

// Persona 1: Freelance Writer
const freelanceWriterTransactions = [
  // INCOME - Monthly client payments
  {
    amount: 2500,
    description: "Article writing for TechBlog",
    type: "income" as const,
    category: "Freelance",
    monthsAgo: 0,
    day: 5,
  },
  {
    amount: 1800,
    description: "Content writing for MarketingCo",
    type: "income" as const,
    category: "Freelance",
    monthsAgo: 0,
    day: 12,
  },
  {
    amount: 3200,
    description: "Copywriting project - Website redesign",
    type: "income" as const,
    category: "Freelance",
    monthsAgo: 0,
    day: 18,
  },
  {
    amount: 1500,
    description: "Blog posts for StartupXYZ",
    type: "income" as const,
    category: "Freelance",
    monthsAgo: 0,
    day: 25,
  },

  {
    amount: 2800,
    description: "Article writing for TechBlog",
    type: "income" as const,
    category: "Freelance",
    monthsAgo: 1,
    day: 5,
  },
  {
    amount: 1600,
    description: "Content writing for MarketingCo",
    type: "income" as const,
    category: "Freelance",
    monthsAgo: 1,
    day: 12,
  },
  {
    amount: 2100,
    description: "SEO content for E-commerce site",
    type: "income" as const,
    category: "Freelance",
    monthsAgo: 1,
    day: 20,
  },

  {
    amount: 2400,
    description: "Article writing for TechBlog",
    type: "income" as const,
    category: "Freelance",
    monthsAgo: 2,
    day: 5,
  },
  {
    amount: 1900,
    description: "Content writing for MarketingCo",
    type: "income" as const,
    category: "Freelance",
    monthsAgo: 2,
    day: 12,
  },
  {
    amount: 2700,
    description: "White paper for SaaS company",
    type: "income" as const,
    category: "Freelance",
    monthsAgo: 2,
    day: 22,
  },

  // EXPENSES - Housing
  {
    amount: 1200,
    description: "Apartment rent",
    type: "expense" as const,
    category: "Rent / Mortgage",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 1200,
    description: "Apartment rent",
    type: "expense" as const,
    category: "Rent / Mortgage",
    monthsAgo: 1,
    day: 1,
  },
  {
    amount: 1200,
    description: "Apartment rent",
    type: "expense" as const,
    category: "Rent / Mortgage",
    monthsAgo: 2,
    day: 1,
  },

  // Utilities
  {
    amount: 85,
    description: "Electric bill",
    type: "expense" as const,
    category: "Utilities - Electricity",
    monthsAgo: 0,
    day: 8,
  },
  {
    amount: 92,
    description: "Electric bill",
    type: "expense" as const,
    category: "Utilities - Electricity",
    monthsAgo: 1,
    day: 8,
  },
  {
    amount: 78,
    description: "Electric bill",
    type: "expense" as const,
    category: "Utilities - Electricity",
    monthsAgo: 2,
    day: 8,
  },

  {
    amount: 60,
    description: "Internet - Fiber 500mbps",
    type: "expense" as const,
    category: "Internet",
    monthsAgo: 0,
    day: 10,
  },
  {
    amount: 60,
    description: "Internet - Fiber 500mbps",
    type: "expense" as const,
    category: "Internet",
    monthsAgo: 1,
    day: 10,
  },
  {
    amount: 60,
    description: "Internet - Fiber 500mbps",
    type: "expense" as const,
    category: "Internet",
    monthsAgo: 2,
    day: 10,
  },

  // Food & Dining
  {
    amount: 320,
    description: "Whole Foods grocery run",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 3,
  },
  {
    amount: 280,
    description: "Trader Joe's",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 11,
  },
  {
    amount: 195,
    description: "Weekly groceries",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 18,
  },
  {
    amount: 240,
    description: "Costco shopping",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 25,
  },

  {
    amount: 45,
    description: "Brunch at Local Cafe",
    type: "expense" as const,
    category: "Dining Out",
    monthsAgo: 0,
    day: 7,
  },
  {
    amount: 32,
    description: "Takeout - Thai food",
    type: "expense" as const,
    category: "Dining Out",
    monthsAgo: 0,
    day: 14,
  },
  {
    amount: 68,
    description: "Dinner with friends",
    type: "expense" as const,
    category: "Dining Out",
    monthsAgo: 0,
    day: 21,
  },
  {
    amount: 28,
    description: "Coffee meeting with client",
    type: "expense" as const,
    category: "Coffee & Snacks",
    monthsAgo: 0,
    day: 16,
  },

  // Transportation
  {
    amount: 45,
    description: "Gas station",
    type: "expense" as const,
    category: "Transportation - Fuel",
    monthsAgo: 0,
    day: 6,
  },
  {
    amount: 50,
    description: "Gas station",
    type: "expense" as const,
    category: "Transportation - Fuel",
    monthsAgo: 0,
    day: 20,
  },
  {
    amount: 38,
    description: "Gas station",
    type: "expense" as const,
    category: "Transportation - Fuel",
    monthsAgo: 1,
    day: 9,
  },

  {
    amount: 120,
    description: "Car insurance - monthly",
    type: "expense" as const,
    category: "Car Insurance",
    monthsAgo: 0,
    day: 15,
  },
  {
    amount: 120,
    description: "Car insurance - monthly",
    type: "expense" as const,
    category: "Car Insurance",
    monthsAgo: 1,
    day: 15,
  },
  {
    amount: 120,
    description: "Car insurance - monthly",
    type: "expense" as const,
    category: "Car Insurance",
    monthsAgo: 2,
    day: 15,
  },

  // Health
  {
    amount: 280,
    description: "Health insurance premium",
    type: "expense" as const,
    category: "Health Insurance",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 280,
    description: "Health insurance premium",
    type: "expense" as const,
    category: "Health Insurance",
    monthsAgo: 1,
    day: 1,
  },
  {
    amount: 280,
    description: "Health insurance premium",
    type: "expense" as const,
    category: "Health Insurance",
    monthsAgo: 2,
    day: 1,
  },

  // Business expenses
  {
    amount: 29.99,
    description: "Grammarly Premium",
    type: "expense" as const,
    category: "Software & Apps",
    monthsAgo: 0,
    day: 5,
  },
  {
    amount: 29.99,
    description: "Grammarly Premium",
    type: "expense" as const,
    category: "Software & Apps",
    monthsAgo: 1,
    day: 5,
  },
  {
    amount: 29.99,
    description: "Grammarly Premium",
    type: "expense" as const,
    category: "Software & Apps",
    monthsAgo: 2,
    day: 5,
  },

  {
    amount: 12,
    description: "Google Workspace",
    type: "expense" as const,
    category: "Software & Apps",
    monthsAgo: 0,
    day: 12,
  },
  {
    amount: 35,
    description: "Office supplies - notebooks, pens",
    type: "expense" as const,
    category: "Office Supplies",
    monthsAgo: 1,
    day: 18,
  },

  // Entertainment & subscriptions
  {
    amount: 15.99,
    description: "Netflix",
    type: "expense" as const,
    category: "Subscriptions & Memberships",
    monthsAgo: 0,
    day: 10,
  },
  {
    amount: 11.99,
    description: "Spotify Premium",
    type: "expense" as const,
    category: "Subscriptions & Memberships",
    monthsAgo: 0,
    day: 15,
  },
  {
    amount: 9.99,
    description: "Audible",
    type: "expense" as const,
    category: "Subscriptions & Memberships",
    monthsAgo: 0,
    day: 20,
  },
];

// Persona 2: Construction Worker with Family
const constructionWorkerTransactions = [
  // INCOME - Bi-weekly paychecks
  {
    amount: 2100,
    description: "Paycheck - BuildRight Construction",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 0,
    day: 7,
  },
  {
    amount: 2100,
    description: "Paycheck - BuildRight Construction",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 0,
    day: 21,
  },
  {
    amount: 2100,
    description: "Paycheck - BuildRight Construction",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 1,
    day: 7,
  },
  {
    amount: 2100,
    description: "Paycheck - BuildRight Construction",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 1,
    day: 21,
  },
  {
    amount: 2100,
    description: "Paycheck - BuildRight Construction",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 2,
    day: 7,
  },
  {
    amount: 2100,
    description: "Paycheck - BuildRight Construction",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 2,
    day: 21,
  },

  {
    amount: 450,
    description: "Weekend side job - deck repair",
    type: "income" as const,
    category: "Freelance",
    monthsAgo: 1,
    day: 14,
  },
  {
    amount: 380,
    description: "Side job - fence installation",
    type: "income" as const,
    category: "Freelance",
    monthsAgo: 2,
    day: 22,
  },

  // EXPENSES - Housing
  {
    amount: 1650,
    description: "Mortgage payment",
    type: "expense" as const,
    category: "Rent / Mortgage",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 1650,
    description: "Mortgage payment",
    type: "expense" as const,
    category: "Rent / Mortgage",
    monthsAgo: 1,
    day: 1,
  },
  {
    amount: 1650,
    description: "Mortgage payment",
    type: "expense" as const,
    category: "Rent / Mortgage",
    monthsAgo: 2,
    day: 1,
  },

  {
    amount: 220,
    description: "Homeowners insurance",
    type: "expense" as const,
    category: "Home Insurance",
    monthsAgo: 0,
    day: 5,
  },
  {
    amount: 145,
    description: "Electric bill",
    type: "expense" as const,
    category: "Utilities - Electricity",
    monthsAgo: 0,
    day: 12,
  },
  {
    amount: 168,
    description: "Electric bill",
    type: "expense" as const,
    category: "Utilities - Electricity",
    monthsAgo: 1,
    day: 12,
  },
  {
    amount: 132,
    description: "Electric bill",
    type: "expense" as const,
    category: "Utilities - Electricity",
    monthsAgo: 2,
    day: 12,
  },

  {
    amount: 75,
    description: "Water bill",
    type: "expense" as const,
    category: "Utilities - Water",
    monthsAgo: 0,
    day: 15,
  },
  {
    amount: 82,
    description: "Water bill",
    type: "expense" as const,
    category: "Utilities - Water",
    monthsAgo: 1,
    day: 15,
  },

  {
    amount: 95,
    description: "Internet & cable",
    type: "expense" as const,
    category: "Internet",
    monthsAgo: 0,
    day: 18,
  },
  {
    amount: 95,
    description: "Internet & cable",
    type: "expense" as const,
    category: "Internet",
    monthsAgo: 1,
    day: 18,
  },
  {
    amount: 95,
    description: "Internet & cable",
    type: "expense" as const,
    category: "Internet",
    monthsAgo: 2,
    day: 18,
  },

  // Food - family of 4
  {
    amount: 520,
    description: "Costco bulk shopping",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 4,
  },
  {
    amount: 380,
    description: "Walmart grocery run",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 11,
  },
  {
    amount: 295,
    description: "Weekly groceries",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 18,
  },
  {
    amount: 410,
    description: "Sam's Club shopping",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 25,
  },

  {
    amount: 85,
    description: "Family dinner - Olive Garden",
    type: "expense" as const,
    category: "Dining Out",
    monthsAgo: 0,
    day: 9,
  },
  {
    amount: 45,
    description: "Pizza night",
    type: "expense" as const,
    category: "Dining Out",
    monthsAgo: 0,
    day: 16,
  },
  {
    amount: 62,
    description: "McDonald's - kids meal",
    type: "expense" as const,
    category: "Dining Out",
    monthsAgo: 0,
    day: 23,
  },

  // Transportation
  {
    amount: 380,
    description: "Truck payment",
    type: "expense" as const,
    category: "Car Payment",
    monthsAgo: 0,
    day: 10,
  },
  {
    amount: 380,
    description: "Truck payment",
    type: "expense" as const,
    category: "Car Payment",
    monthsAgo: 1,
    day: 10,
  },
  {
    amount: 380,
    description: "Truck payment",
    type: "expense" as const,
    category: "Car Payment",
    monthsAgo: 2,
    day: 10,
  },

  {
    amount: 85,
    description: "Gas - work truck",
    type: "expense" as const,
    category: "Transportation - Fuel",
    monthsAgo: 0,
    day: 6,
  },
  {
    amount: 92,
    description: "Gas - work truck",
    type: "expense" as const,
    category: "Transportation - Fuel",
    monthsAgo: 0,
    day: 13,
  },
  {
    amount: 88,
    description: "Gas - work truck",
    type: "expense" as const,
    category: "Transportation - Fuel",
    monthsAgo: 0,
    day: 20,
  },
  {
    amount: 95,
    description: "Gas - work truck",
    type: "expense" as const,
    category: "Transportation - Fuel",
    monthsAgo: 0,
    day: 27,
  },

  {
    amount: 180,
    description: "Auto insurance - 2 vehicles",
    type: "expense" as const,
    category: "Car Insurance",
    monthsAgo: 0,
    day: 15,
  },
  {
    amount: 180,
    description: "Auto insurance - 2 vehicles",
    type: "expense" as const,
    category: "Car Insurance",
    monthsAgo: 1,
    day: 15,
  },
  {
    amount: 180,
    description: "Auto insurance - 2 vehicles",
    type: "expense" as const,
    category: "Car Insurance",
    monthsAgo: 2,
    day: 15,
  },

  {
    amount: 245,
    description: "Truck maintenance - oil change & inspection",
    type: "expense" as const,
    category: "Car Maintenance & Repairs",
    monthsAgo: 1,
    day: 20,
  },

  // Family & children
  {
    amount: 850,
    description: "Childcare - daycare",
    type: "expense" as const,
    category: "Childcare",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 850,
    description: "Childcare - daycare",
    type: "expense" as const,
    category: "Childcare",
    monthsAgo: 1,
    day: 1,
  },
  {
    amount: 850,
    description: "Childcare - daycare",
    type: "expense" as const,
    category: "Childcare",
    monthsAgo: 2,
    day: 1,
  },

  {
    amount: 120,
    description: "Kids clothing - Target",
    type: "expense" as const,
    category: "Clothing & Apparel",
    monthsAgo: 0,
    day: 14,
  },
  {
    amount: 85,
    description: "School supplies",
    type: "expense" as const,
    category: "Education / Tuition",
    monthsAgo: 2,
    day: 5,
  },

  // Health
  {
    amount: 450,
    description: "Family health insurance",
    type: "expense" as const,
    category: "Health Insurance",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 450,
    description: "Family health insurance",
    type: "expense" as const,
    category: "Health Insurance",
    monthsAgo: 1,
    day: 1,
  },
  {
    amount: 450,
    description: "Family health insurance",
    type: "expense" as const,
    category: "Health Insurance",
    monthsAgo: 2,
    day: 1,
  },

  {
    amount: 65,
    description: "Kids doctor visit copay",
    type: "expense" as const,
    category: "Medical Expenses",
    monthsAgo: 1,
    day: 18,
  },
  {
    amount: 35,
    description: "Prescription medication",
    type: "expense" as const,
    category: "Pharmacy",
    monthsAgo: 0,
    day: 22,
  },
];

// Persona 3: Software Engineer
const softwareEngineerTransactions = [
  // INCOME
  {
    amount: 6500,
    description: "Salary - Tech Corp",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 6500,
    description: "Salary - Tech Corp",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 0,
    day: 15,
  },
  {
    amount: 6500,
    description: "Salary - Tech Corp",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 1,
    day: 1,
  },
  {
    amount: 6500,
    description: "Salary - Tech Corp",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 1,
    day: 15,
  },
  {
    amount: 6500,
    description: "Salary - Tech Corp",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 2,
    day: 1,
  },
  {
    amount: 6500,
    description: "Salary - Tech Corp",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 2,
    day: 15,
  },

  {
    amount: 8000,
    description: "Q4 Performance bonus",
    type: "income" as const,
    category: "Bonus",
    monthsAgo: 2,
    day: 10,
  },
  {
    amount: 250,
    description: "Stock dividend payout",
    type: "income" as const,
    category: "Dividend Income",
    monthsAgo: 1,
    day: 20,
  },

  // EXPENSES - Housing
  {
    amount: 2400,
    description: "Downtown apartment rent",
    type: "expense" as const,
    category: "Rent / Mortgage",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 2400,
    description: "Downtown apartment rent",
    type: "expense" as const,
    category: "Rent / Mortgage",
    monthsAgo: 1,
    day: 1,
  },
  {
    amount: 2400,
    description: "Downtown apartment rent",
    type: "expense" as const,
    category: "Rent / Mortgage",
    monthsAgo: 2,
    day: 1,
  },

  {
    amount: 110,
    description: "Electric bill",
    type: "expense" as const,
    category: "Utilities - Electricity",
    monthsAgo: 0,
    day: 8,
  },
  {
    amount: 95,
    description: "Internet - Gigabit fiber",
    type: "expense" as const,
    category: "Internet",
    monthsAgo: 0,
    day: 12,
  },
  {
    amount: 95,
    description: "Internet - Gigabit fiber",
    type: "expense" as const,
    category: "Internet",
    monthsAgo: 1,
    day: 12,
  },
  {
    amount: 95,
    description: "Internet - Gigabit fiber",
    type: "expense" as const,
    category: "Internet",
    monthsAgo: 2,
    day: 12,
  },

  // Food
  {
    amount: 280,
    description: "Whole Foods",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 5,
  },
  {
    amount: 195,
    description: "Trader Joe's",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 12,
  },
  {
    amount: 220,
    description: "Weekly groceries",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 19,
  },
  {
    amount: 165,
    description: "Fresh market shopping",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 26,
  },

  {
    amount: 125,
    description: "Team lunch - sushi",
    type: "expense" as const,
    category: "Dining Out",
    monthsAgo: 0,
    day: 8,
  },
  {
    amount: 85,
    description: "Date night - Italian restaurant",
    type: "expense" as const,
    category: "Dining Out",
    monthsAgo: 0,
    day: 14,
  },
  {
    amount: 65,
    description: "Dinner with friends",
    type: "expense" as const,
    category: "Dining Out",
    monthsAgo: 0,
    day: 21,
  },
  {
    amount: 45,
    description: "Coffee shop - remote work",
    type: "expense" as const,
    category: "Coffee & Snacks",
    monthsAgo: 0,
    day: 11,
  },

  // Transportation
  {
    amount: 120,
    description: "Uber & Lyft rides",
    type: "expense" as const,
    category: "Transportation - Public Transit",
    monthsAgo: 0,
    day: 28,
  },
  {
    amount: 95,
    description: "Monthly subway pass",
    type: "expense" as const,
    category: "Transportation - Public Transit",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 95,
    description: "Monthly subway pass",
    type: "expense" as const,
    category: "Transportation - Public Transit",
    monthsAgo: 1,
    day: 1,
  },

  // Health & fitness
  {
    amount: 180,
    description: "Health insurance",
    type: "expense" as const,
    category: "Health Insurance",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 180,
    description: "Health insurance",
    type: "expense" as const,
    category: "Health Insurance",
    monthsAgo: 1,
    day: 1,
  },
  {
    amount: 180,
    description: "Health insurance",
    type: "expense" as const,
    category: "Health Insurance",
    monthsAgo: 2,
    day: 1,
  },

  {
    amount: 85,
    description: "Gym membership - Equinox",
    type: "expense" as const,
    category: "Subscriptions & Memberships",
    monthsAgo: 0,
    day: 5,
  },
  {
    amount: 85,
    description: "Gym membership - Equinox",
    type: "expense" as const,
    category: "Subscriptions & Memberships",
    monthsAgo: 1,
    day: 5,
  },

  // Tech & subscriptions
  {
    amount: 29.99,
    description: "GitHub Pro",
    type: "expense" as const,
    category: "Software & Apps",
    monthsAgo: 0,
    day: 3,
  },
  {
    amount: 19.99,
    description: "ChatGPT Plus",
    type: "expense" as const,
    category: "Software & Apps",
    monthsAgo: 0,
    day: 10,
  },
  {
    amount: 9.99,
    description: "Medium subscription",
    type: "expense" as const,
    category: "Subscriptions & Memberships",
    monthsAgo: 0,
    day: 15,
  },
  {
    amount: 16.99,
    description: "YouTube Premium",
    type: "expense" as const,
    category: "Subscriptions & Memberships",
    monthsAgo: 0,
    day: 18,
  },
  {
    amount: 11.99,
    description: "Spotify Premium",
    type: "expense" as const,
    category: "Subscriptions & Memberships",
    monthsAgo: 0,
    day: 20,
  },

  {
    amount: 1200,
    description: "New MacBook Pro accessories",
    type: "expense" as const,
    category: "Business Expenses",
    monthsAgo: 1,
    day: 12,
  },

  // Investments
  {
    amount: 2000,
    description: "401k contribution",
    type: "expense" as const,
    category: "Investments - Contributions",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 2000,
    description: "401k contribution",
    type: "expense" as const,
    category: "Investments - Contributions",
    monthsAgo: 1,
    day: 1,
  },
  {
    amount: 2000,
    description: "401k contribution",
    type: "expense" as const,
    category: "Investments - Contributions",
    monthsAgo: 2,
    day: 1,
  },

  {
    amount: 500,
    description: "Roth IRA contribution",
    type: "expense" as const,
    category: "Investments - Contributions",
    monthsAgo: 0,
    day: 5,
  },

  // Entertainment & travel
  {
    amount: 1200,
    description: "Weekend trip to Miami",
    type: "expense" as const,
    category: "Travel & Vacation",
    monthsAgo: 1,
    day: 22,
  },
  {
    amount: 85,
    description: "Concert tickets",
    type: "expense" as const,
    category: "Entertainment",
    monthsAgo: 0,
    day: 16,
  },
];

// Persona 4: Nurse (Single Parent)
const nurseTransactions = [
  // INCOME
  {
    amount: 3200,
    description: "Paycheck - City Hospital",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 0,
    day: 7,
  },
  {
    amount: 3200,
    description: "Paycheck - City Hospital",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 0,
    day: 21,
  },
  {
    amount: 3200,
    description: "Paycheck - City Hospital",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 1,
    day: 7,
  },
  {
    amount: 3200,
    description: "Paycheck - City Hospital",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 1,
    day: 21,
  },
  {
    amount: 3200,
    description: "Paycheck - City Hospital",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 2,
    day: 7,
  },
  {
    amount: 3200,
    description: "Paycheck - City Hospital",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 2,
    day: 21,
  },

  {
    amount: 650,
    description: "Overtime pay - extra shifts",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 0,
    day: 28,
  },
  {
    amount: 500,
    description: "Overtime pay",
    type: "income" as const,
    category: "Salary",
    monthsAgo: 1,
    day: 28,
  },

  {
    amount: 800,
    description: "Child support payment",
    type: "income" as const,
    category: "Child Support",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 800,
    description: "Child support payment",
    type: "income" as const,
    category: "Child Support",
    monthsAgo: 1,
    day: 1,
  },
  {
    amount: 800,
    description: "Child support payment",
    type: "income" as const,
    category: "Child Support",
    monthsAgo: 2,
    day: 1,
  },

  // EXPENSES - Housing
  {
    amount: 1450,
    description: "Rent - 2 bedroom apartment",
    type: "expense" as const,
    category: "Rent / Mortgage",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 1450,
    description: "Rent - 2 bedroom apartment",
    type: "expense" as const,
    category: "Rent / Mortgage",
    monthsAgo: 1,
    day: 1,
  },
  {
    amount: 1450,
    description: "Rent - 2 bedroom apartment",
    type: "expense" as const,
    category: "Rent / Mortgage",
    monthsAgo: 2,
    day: 1,
  },

  {
    amount: 95,
    description: "Electric bill",
    type: "expense" as const,
    category: "Utilities - Electricity",
    monthsAgo: 0,
    day: 10,
  },
  {
    amount: 110,
    description: "Electric bill",
    type: "expense" as const,
    category: "Utilities - Electricity",
    monthsAgo: 1,
    day: 10,
  },

  {
    amount: 70,
    description: "Internet",
    type: "expense" as const,
    category: "Internet",
    monthsAgo: 0,
    day: 15,
  },
  {
    amount: 70,
    description: "Internet",
    type: "expense" as const,
    category: "Internet",
    monthsAgo: 1,
    day: 15,
  },
  {
    amount: 70,
    description: "Internet",
    type: "expense" as const,
    category: "Internet",
    monthsAgo: 2,
    day: 15,
  },

  // Food
  {
    amount: 380,
    description: "Grocery shopping - family",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 5,
  },
  {
    amount: 295,
    description: "Weekly groceries",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 12,
  },
  {
    amount: 320,
    description: "Costco run",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 19,
  },
  {
    amount: 270,
    description: "Grocery shopping",
    type: "expense" as const,
    category: "Groceries",
    monthsAgo: 0,
    day: 26,
  },

  {
    amount: 55,
    description: "Dinner with kids - Chili's",
    type: "expense" as const,
    category: "Dining Out",
    monthsAgo: 0,
    day: 11,
  },
  {
    amount: 35,
    description: "Pizza delivery",
    type: "expense" as const,
    category: "Dining Out",
    monthsAgo: 0,
    day: 18,
  },

  // Transportation
  {
    amount: 320,
    description: "Car payment",
    type: "expense" as const,
    category: "Car Payment",
    monthsAgo: 0,
    day: 8,
  },
  {
    amount: 320,
    description: "Car payment",
    type: "expense" as const,
    category: "Car Payment",
    monthsAgo: 1,
    day: 8,
  },
  {
    amount: 320,
    description: "Car payment",
    type: "expense" as const,
    category: "Car Payment",
    monthsAgo: 2,
    day: 8,
  },

  {
    amount: 65,
    description: "Gas station",
    type: "expense" as const,
    category: "Transportation - Fuel",
    monthsAgo: 0,
    day: 6,
  },
  {
    amount: 70,
    description: "Gas station",
    type: "expense" as const,
    category: "Transportation - Fuel",
    monthsAgo: 0,
    day: 15,
  },
  {
    amount: 68,
    description: "Gas station",
    type: "expense" as const,
    category: "Transportation - Fuel",
    monthsAgo: 0,
    day: 24,
  },

  {
    amount: 150,
    description: "Auto insurance",
    type: "expense" as const,
    category: "Car Insurance",
    monthsAgo: 0,
    day: 12,
  },
  {
    amount: 150,
    description: "Auto insurance",
    type: "expense" as const,
    category: "Car Insurance",
    monthsAgo: 1,
    day: 12,
  },
  {
    amount: 150,
    description: "Auto insurance",
    type: "expense" as const,
    category: "Car Insurance",
    monthsAgo: 2,
    day: 12,
  },

  // Childcare & children
  {
    amount: 950,
    description: "After-school care",
    type: "expense" as const,
    category: "Childcare",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 950,
    description: "After-school care",
    type: "expense" as const,
    category: "Childcare",
    monthsAgo: 1,
    day: 1,
  },
  {
    amount: 950,
    description: "After-school care",
    type: "expense" as const,
    category: "Childcare",
    monthsAgo: 2,
    day: 1,
  },

  {
    amount: 95,
    description: "Kids clothing - Old Navy",
    type: "expense" as const,
    category: "Clothing & Apparel",
    monthsAgo: 0,
    day: 16,
  },
  {
    amount: 65,
    description: "School supplies and fees",
    type: "expense" as const,
    category: "Education / Tuition",
    monthsAgo: 2,
    day: 8,
  },
  {
    amount: 45,
    description: "Kids birthday gift",
    type: "expense" as const,
    category: "Gifts & Donations",
    monthsAgo: 1,
    day: 20,
  },

  // Health
  {
    amount: 320,
    description: "Health insurance premium",
    type: "expense" as const,
    category: "Health Insurance",
    monthsAgo: 0,
    day: 1,
  },
  {
    amount: 320,
    description: "Health insurance premium",
    type: "expense" as const,
    category: "Health Insurance",
    monthsAgo: 1,
    day: 1,
  },
  {
    amount: 320,
    description: "Health insurance premium",
    type: "expense" as const,
    category: "Health Insurance",
    monthsAgo: 2,
    day: 1,
  },

  {
    amount: 40,
    description: "Pediatrician copay",
    type: "expense" as const,
    category: "Medical Expenses",
    monthsAgo: 1,
    day: 14,
  },
  {
    amount: 28,
    description: "Prescription - antibiotics",
    type: "expense" as const,
    category: "Pharmacy",
    monthsAgo: 1,
    day: 15,
  },

  // Personal & subscriptions
  {
    amount: 15.99,
    description: "Netflix",
    type: "expense" as const,
    category: "Subscriptions & Memberships",
    monthsAgo: 0,
    day: 10,
  },
  {
    amount: 50,
    description: "Haircut and personal care",
    type: "expense" as const,
    category: "Personal Care",
    monthsAgo: 1,
    day: 12,
  },
  {
    amount: 85,
    description: "Kids haircuts and clothes",
    type: "expense" as const,
    category: "Personal Care",
    monthsAgo: 2,
    day: 18,
  },
];

// Main seeder mutation that can be called for each persona
export const seedTransactions = internalMutation({
  args: {
    userId: v.id("users"),
    persona: v.union(
      v.literal("freelance_writer"),
      v.literal("construction_worker"),
      v.literal("software_engineer"),
      v.literal("nurse")
    ),
  },
  handler: async (ctx, args) => {
    const { userId, persona } = args;

    // Select the appropriate transaction set
    let transactions;
    switch (persona) {
      case "freelance_writer":
        transactions = freelanceWriterTransactions;
        break;
      case "construction_worker":
        transactions = constructionWorkerTransactions;
        break;
      case "software_engineer":
        transactions = softwareEngineerTransactions;
        break;
      case "nurse":
        transactions = nurseTransactions;
        break;
    }

    console.log(
      `Seeding ${transactions.length} transactions for ${persona}...`
    );

    // Insert all transactions
    for (const txn of transactions) {
      const date = getDateInMonth(txn.monthsAgo, txn.day);
      const amount = vary(txn.amount, 0.05); // Add 5% variance

      await ctx.db.insert("transactions", {
        userId,
        amount,
        description: txn.description,
        type: txn.type,
        category: txn.category as TransactionCategory,
        date,
        source: "manual",
      });
    }

    console.log(
      `✅ Successfully seeded ${transactions.length} transactions for ${persona}`
    );
    return {
      success: true,
      count: transactions.length,
      persona,
    };
  },
});

// Convenience mutation to seed all personas at once (if you have 4 different user accounts)
export const seedAllPersonas = internalMutation({
  args: {
    freelanceWriterUserId: v.id("users"),
    constructionWorkerUserId: v.id("users"),
    softwareEngineerUserId: v.id("users"),
    nurseUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const results = [];

    // Seed freelance writer
    const writerResult = await ctx.db.insert("transactions", {
      userId: args.freelanceWriterUserId,
      amount: 0,
      description: "Seeding started",
      type: "income",
      category: "Miscellaneous",
      date: Date.now(),
      source: "manual",
    });
    await ctx.db.delete(writerResult);

    for (const txn of freelanceWriterTransactions) {
      const date = getDateInMonth(txn.monthsAgo, txn.day);
      const amount = vary(txn.amount, 0.05);
      await ctx.db.insert("transactions", {
        userId: args.freelanceWriterUserId,
        amount,
        description: txn.description,
        type: txn.type,
        category: txn.category as TransactionCategory,
        date,
        source: "manual",
      });
    }
    results.push({
      persona: "freelance_writer",
      count: freelanceWriterTransactions.length,
    });

    // Seed construction worker
    for (const txn of constructionWorkerTransactions) {
      const date = getDateInMonth(txn.monthsAgo, txn.day);
      const amount = vary(txn.amount, 0.05);
      await ctx.db.insert("transactions", {
        userId: args.constructionWorkerUserId,
        amount,
        description: txn.description,
        type: txn.type,
        category: txn.category as TransactionCategory,
        date,
        source: "manual",
      });
    }
    results.push({
      persona: "construction_worker",
      count: constructionWorkerTransactions.length,
    });

    // Seed software engineer
    for (const txn of softwareEngineerTransactions) {
      const date = getDateInMonth(txn.monthsAgo, txn.day);
      const amount = vary(txn.amount, 0.05);
      await ctx.db.insert("transactions", {
        userId: args.softwareEngineerUserId,
        amount,
        description: txn.description,
        type: txn.type,
        category: txn.category as TransactionCategory,
        date,
        source: "manual",
      });
    }
    results.push({
      persona: "software_engineer",
      count: softwareEngineerTransactions.length,
    });

    // Seed nurse
    for (const txn of nurseTransactions) {
      const date = getDateInMonth(txn.monthsAgo, txn.day);
      const amount = vary(txn.amount, 0.05);
      await ctx.db.insert("transactions", {
        userId: args.nurseUserId,
        amount,
        description: txn.description,
        type: txn.type,
        category: txn.category as TransactionCategory,
        date,
        source: "manual",
      });
    }
    results.push({ persona: "nurse", count: nurseTransactions.length });

    console.log("✅ All personas seeded successfully!");
    return results;
  },
});
