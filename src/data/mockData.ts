import { Cleanup, RewardTransaction, UserProfile } from '@/types/cleanup';

export const mockCleanups: Cleanup[] = [
  {
    id: '1',
    title: 'Lagos Beach Cleanup Drive',
    description: 'Join us for a community beach cleanup at Bar Beach. We will be collecting plastic waste and debris to help protect marine life.',
    category: 'Beach',
    status: 'open',
    location: {
      address: 'Bar Beach, Victoria Island',
      city: 'Lagos',
      country: 'Nigeria',
      latitude: 6.4281,
      longitude: 3.4219,
    },
    date: '2024-03-15',
    startTime: '08:00',
    endTime: '12:00',
    maxParticipants: 50,
    createdAt: '2024-02-20',
    updatedAt: '2024-02-20',
    organizer: {
      id: 'org-1',
      name: 'GreenEarth Foundation',
      avatar: undefined,
    },
    participants: [
      { id: 'p1', name: 'Adaeze Okonkwo', email: 'ada@email.com', status: 'accepted', appliedAt: '2024-02-21', isKyced: true },
      { id: 'p2', name: 'Chidi Emeka', email: 'chidi@email.com', status: 'pending', appliedAt: '2024-02-22', isKyced: false },
      { id: 'p3', name: 'Funke Adeyemi', email: 'funke@email.com', status: 'accepted', appliedAt: '2024-02-22', isKyced: true },
    ],
    proofMedia: [],
  },
  {
    id: '2',
    title: 'Lekki Conservation Cleanup',
    description: 'Help us maintain the beauty of Lekki Conservation Centre by participating in our monthly cleanup event.',
    category: 'Nature Reserve',
    status: 'in_progress',
    location: {
      address: 'Lekki Conservation Centre',
      city: 'Lagos',
      country: 'Nigeria',
      latitude: 6.4355,
      longitude: 3.5361,
    },
    date: '2024-03-10',
    startTime: '07:00',
    endTime: '11:00',
    maxParticipants: 30,
    createdAt: '2024-02-15',
    updatedAt: '2024-03-10',
    organizer: {
      id: 'org-2',
      name: 'EcoWarriors Nigeria',
      avatar: undefined,
    },
    participants: [
      { id: 'p4', name: 'Oluwaseun Bakare', email: 'seun@email.com', status: 'accepted', appliedAt: '2024-02-16', rating: 5, isKyced: true },
      { id: 'p5', name: 'Ngozi Eze', email: 'ngozi@email.com', status: 'accepted', appliedAt: '2024-02-17', rating: 4, isKyced: false },
    ],
    proofMedia: [
      { id: 'm1', name: 'cleanup-before.jpg', type: 'image', url: '/placeholder.svg', size: '2.1 MB', uploadedAt: '2024-03-10' },
    ],
  },
  {
    id: '3',
    title: 'Third Mainland Bridge Area Cleanup',
    description: 'Community cleanup initiative focusing on the areas around Third Mainland Bridge.',
    category: 'Urban',
    status: 'completed',
    location: {
      address: 'Third Mainland Bridge',
      city: 'Lagos',
      country: 'Nigeria',
      latitude: 6.4698,
      longitude: 3.3890,
    },
    date: '2024-02-28',
    startTime: '06:00',
    endTime: '10:00',
    maxParticipants: 40,
    createdAt: '2024-02-10',
    updatedAt: '2024-02-28',
    organizer: {
      id: 'org-1',
      name: 'GreenEarth Foundation',
      avatar: undefined,
    },
    participants: [
      { id: 'p6', name: 'Tunde Afolabi', email: 'tunde@email.com', status: 'accepted', appliedAt: '2024-02-11', rating: 5, isKyced: true },
      { id: 'p7', name: 'Amaka Nwosu', email: 'amaka@email.com', status: 'accepted', appliedAt: '2024-02-12', rating: 4, isKyced: true },
      { id: 'p8', name: 'Yusuf Ibrahim', email: 'yusuf@email.com', status: 'accepted', appliedAt: '2024-02-13', rating: 5, isKyced: false },
    ],
    proofMedia: [
      { id: 'm2', name: 'bridge-cleanup-1.jpg', type: 'image', url: '/placeholder.svg', size: '1.8 MB', uploadedAt: '2024-02-28' },
      { id: 'm3', name: 'bridge-cleanup-2.jpg', type: 'image', url: '/placeholder.svg', size: '2.3 MB', uploadedAt: '2024-02-28' },
    ],
    rewardAmount: 150,
  },
  {
    id: '4',
    title: 'Ikoyi Park Green Initiative',
    description: 'Weekend cleanup and tree planting event at Ikoyi Park.',
    category: 'Park',
    status: 'rewarded',
    location: {
      address: 'Ikoyi Park',
      city: 'Lagos',
      country: 'Nigeria',
      latitude: 6.4541,
      longitude: 3.4346,
    },
    date: '2024-02-20',
    startTime: '08:00',
    endTime: '13:00',
    maxParticipants: 25,
    createdAt: '2024-02-05',
    updatedAt: '2024-02-25',
    organizer: {
      id: 'org-3',
      name: 'Clean Lagos Initiative',
      avatar: undefined,
    },
    participants: [
      { id: 'p9', name: 'Chioma Obi', email: 'chioma@email.com', status: 'accepted', appliedAt: '2024-02-06', rating: 5 },
      { id: 'p10', name: 'Emeka Onu', email: 'emeka@email.com', status: 'accepted', appliedAt: '2024-02-07', rating: 4 },
    ],
    proofMedia: [
      { id: 'm4', name: 'park-cleanup.jpg', type: 'image', url: '/placeholder.svg', size: '1.5 MB', uploadedAt: '2024-02-20' },
      { id: 'm5', name: 'tree-planting.mp4', type: 'video', url: '/placeholder.svg', size: '45 MB', uploadedAt: '2024-02-20' },
    ],
    rewardAmount: 200,
  },
  {
    id: '5',
    title: 'Makoko Waterfront Cleanup',
    description: 'Help clean the waterfront areas of Makoko community.',
    category: 'Waterfront',
    status: 'open',
    location: {
      address: 'Makoko Community',
      city: 'Lagos',
      country: 'Nigeria',
      latitude: 6.4961,
      longitude: 3.3870,
    },
    date: '2024-03-20',
    startTime: '07:00',
    endTime: '11:00',
    maxParticipants: 35,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01',
    organizer: {
      id: 'org-2',
      name: 'EcoWarriors Nigeria',
      avatar: undefined,
    },
    participants: [
      { id: 'p11', name: 'Kemi Adeleke', email: 'kemi@email.com', status: 'pending', appliedAt: '2024-03-02' },
    ],
    proofMedia: [],
  },
];

export const mockRewardTransactions: RewardTransaction[] = [
  {
    id: 't1',
    type: 'earned',
    amount: 150,
    cleanupId: '3',
    cleanupTitle: 'Third Mainland Bridge Area Cleanup',
    date: '2024-02-28',
    status: 'completed',
  },
  {
    id: 't2',
    type: 'earned',
    amount: 200,
    cleanupId: '4',
    cleanupTitle: 'Ikoyi Park Green Initiative',
    date: '2024-02-25',
    status: 'completed',
  },
  {
    id: 't3',
    type: 'claimed',
    amount: 100,
    cleanupId: '3',
    cleanupTitle: 'Third Mainland Bridge Area Cleanup',
    date: '2024-03-01',
    txHash: '0x1234...5678',
    status: 'completed',
  },
  {
    id: 't4',
    type: 'earned',
    amount: 75,
    cleanupId: '2',
    cleanupTitle: 'Lekki Conservation Cleanup',
    date: '2024-03-10',
    status: 'pending',
  },
];

export const mockUserProfile: UserProfile = {
  id: 'user-1',
  name: 'GreenEarth Foundation',
  email: 'contact@greenearth.org',
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  totalRewards: 425,
  claimedRewards: 100,
  pendingRewards: 325,
  cleanupsOrganized: 8,
  cleanupsParticipated: 15,
  averageRating: 4.7,
  isEmailVerified: true,
  kycStatus: 'verified',
  referralCode: 'GREEN2024',
  referralCount: 5,
};

export interface WalletInfo {
  id: string;
  name: string;
  address: string;
  type: 'vechain' | 'metamask' | 'walletconnect' | 'coinbase';
  isDefault: boolean;
}

export interface BankAccountInfo {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

export const mockWallets: WalletInfo[] = [
  {
    id: 'w1',
    name: 'Main VeChain Wallet',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    type: 'vechain',
    isDefault: true,
  },
  {
    id: 'w2',
    name: 'Secondary Wallet',
    address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
    type: 'metamask',
    isDefault: false,
  },
  {
    id: 'w3',
    name: 'Savings Wallet',
    address: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
    type: 'walletconnect',
    isDefault: false,
  },
];

export const mockBankAccounts: BankAccountInfo[] = [
  {
    id: 'b1',
    bankName: 'First Bank Nigeria',
    accountNumber: '3045678901',
    accountName: 'GreenEarth Foundation',
    isDefault: true,
  },
  {
    id: 'b2',
    bankName: 'GTBank',
    accountNumber: '0123456789',
    accountName: 'GreenEarth Foundation',
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
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rateToB3TR: 450 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', rateToB3TR: 5.5 },
];

export const mockNGOProfile = {
  name: 'GreenEarth Foundation',
  registrationNumber: 'NGO-2021-45678',
  foundedYear: '2018',
  teamSize: '11-25',
  description: 'GreenEarth Foundation is dedicated to environmental conservation and community development through cleanup initiatives.',
  mission: 'To create a cleaner, greener world through community-driven cleanup initiatives.',
  vision: 'A world where every community takes pride in maintaining a clean and healthy environment.',
  focusAreas: ['Beach Cleanup', 'Urban Sanitation', 'Recycling', 'Community Education'],
  email: 'contact@greenearth.org',
  phone: '+234 123 456 7890',
  website: 'https://greenearth.org',
  country: 'Nigeria',
  city: 'Lagos',
  address: 'Victoria Island',
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  socialLinks: {
    twitter: '@greenearth_ng',
    linkedin: 'greenearth-foundation',
    facebook: 'greenearthng',
  },
};

export const insightsData = {
  totalRewards: 425,
  cleanupsCompleted: 12,
  activeCleanupsNearby: 5,
  participantsHelped: 156,
  monthlyData: [
    { month: 'Jan', cleanups: 2, rewards: 150 },
    { month: 'Feb', cleanups: 3, rewards: 225 },
    { month: 'Mar', cleanups: 4, rewards: 300 },
    { month: 'Apr', cleanups: 2, rewards: 175 },
    { month: 'May', cleanups: 5, rewards: 400 },
    { month: 'Jun', cleanups: 3, rewards: 250 },
  ],
  categoryData: [
    { name: 'Beach', value: 35, fill: 'hsl(var(--chart-1))' },
    { name: 'Urban', value: 25, fill: 'hsl(var(--chart-2))' },
    { name: 'Park', value: 20, fill: 'hsl(var(--chart-3))' },
    { name: 'Waterfront', value: 15, fill: 'hsl(var(--chart-4))' },
    { name: 'Other', value: 5, fill: 'hsl(var(--chart-5))' },
  ],
};
