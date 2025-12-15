import { Cleanup, RewardTransaction, UserProfile } from "@/types/cleanup";

// Removed unused mock data: sampleCleanups, sampleRewardTransactions, sampleUserProfile
// These are now fetched from the subgraph

export interface BankAccountInfo {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

// Removed defaultWallets - now using connected wallet address directly

export const defaultBankAccounts: BankAccountInfo[] = [
  {
    id: "b1",
    bankName: "First Bank Nigeria",
    accountNumber: "3045678901",
    accountName: "GreenEarth Foundation",
    isDefault: true,
  },
  {
    id: "b2",
    bankName: "GTBank",
    accountNumber: "0123456789",
    accountName: "GreenEarth Foundation",
    isDefault: false,
  },
];

// Currency conversion rates (B3TR to local currencies)
export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rateToB3TR: number; // How many units of currency per 1 B3TR
}

export const currencyRates: CurrencyRate[] = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", rateToB3TR: 450 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵", rateToB3TR: 5.5 },
];

export const defaultNGOProfile = {
  name: "GreenEarth Foundation",
  registrationNumber: "NGO-2021-45678",
  foundedYear: "2018",
  teamSize: "11-25",
  description:
    "GreenEarth Foundation is dedicated to environmental conservation and community development through cleanup initiatives.",
  mission:
    "To create a cleaner, greener world through community-driven cleanup initiatives.",
  vision:
    "A world where every community takes pride in maintaining a clean and healthy environment.",
  focusAreas: [
    "Beach Cleanup",
    "Urban Sanitation",
    "Recycling",
    "Community Education",
  ],
  email: "contact@greenearth.org",
  phone: "+234 123 456 7890",
  website: "https://greenearth.org",
  country: "Nigeria",
  city: "Lagos",
  address: "Victoria Island",
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  socialLinks: {
    twitter: "@greenearth_ng",
    linkedin: "greenearth-foundation",
    facebook: "greenearthng",
  },
};

export const insightsData = {
  totalRewards: 425,
  cleanupsCompleted: 12,
  activeCleanupsNearby: 5,
  participantsHelped: 156,
  monthlyData: [
    { month: "Jan", cleanups: 2, rewards: 150 },
    { month: "Feb", cleanups: 3, rewards: 225 },
    { month: "Mar", cleanups: 4, rewards: 300 },
    { month: "Apr", cleanups: 2, rewards: 175 },
    { month: "May", cleanups: 5, rewards: 400 },
    { month: "Jun", cleanups: 3, rewards: 250 },
  ],
  categoryData: [
    { name: "Beach", value: 35, fill: "hsl(var(--chart-1))" },
    { name: "Urban", value: 25, fill: "hsl(var(--chart-2))" },
    { name: "Park", value: 20, fill: "hsl(var(--chart-3))" },
    { name: "Waterfront", value: 15, fill: "hsl(var(--chart-4))" },
    { name: "Other", value: 5, fill: "hsl(var(--chart-5))" },
  ],
};
