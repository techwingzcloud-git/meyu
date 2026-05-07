export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
  "Andaman & Nicobar", "Dadra & Nagar Haveli and Daman & Diu", "Lakshadweep",
];

export const WOMEN_CATEGORIES = [
  { slug: "new-arrivals", label: "New Arrivals" },
  { slug: "dresses", label: "Dresses" },
  { slug: "co-ord-sets", label: "Co-ord Sets" },
  { slug: "tops", label: "Tops" },
  { slug: "ethnic-wear", label: "Ethnic Wear" },
  { slug: "sale", label: "Sale" },
];

export const MEN_CATEGORIES = [
  { slug: "new-arrivals", label: "New Arrivals" },
  { slug: "shirts", label: "Shirts" },
  { slug: "suits", label: "Suits" },
  { slug: "blazers", label: "Blazers" },
  { slug: "ethnic-wear", label: "Ethnic Wear" },
  { slug: "bottoms", label: "Bottoms" },
  { slug: "sale", label: "Sale" },
];

// Backwards compatibility — default = women (legacy code paths)
export const CATEGORIES = WOMEN_CATEGORIES;

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

// EMI bank interest rates (annualised)
export const EMI_OPTIONS = [
  { months: 3, rate: 13 },
  { months: 6, rate: 14 },
  { months: 9, rate: 15 },
  { months: 12, rate: 15 },
  { months: 18, rate: 16 },
  { months: 24, rate: 16 },
];

export const calcEmi = (principal: number, months: number, annualRate: number) => {
  const r = annualRate / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return Math.round(emi);
};

// Pincode → city/state hints (subset, fast offline)
export const PINCODE_HINTS: Record<string, { city: string; state: string; days: number }> = {
  "1": { city: "Delhi", state: "Delhi", days: 3 },
  "2": { city: "Lucknow", state: "Uttar Pradesh", days: 4 },
  "3": { city: "Jaipur", state: "Rajasthan", days: 4 },
  "4": { city: "Mumbai", state: "Maharashtra", days: 3 },
  "5": { city: "Hyderabad", state: "Telangana", days: 4 },
  "6": { city: "Chennai", state: "Tamil Nadu", days: 5 },
  "7": { city: "Kolkata", state: "West Bengal", days: 5 },
  "8": { city: "Patna", state: "Bihar", days: 6 },
};

export const estimateDelivery = (pincode: string) => {
  const first = pincode?.[0];
  const hint = PINCODE_HINTS[first] || { city: "", state: "", days: 6 };
  const eta = new Date();
  eta.setDate(eta.getDate() + hint.days);
  return {
    ...hint,
    date: eta.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" }),
    express: hint.days <= 4,
  };
};
