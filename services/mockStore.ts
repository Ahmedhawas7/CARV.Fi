
import { User, LeaderboardEntry } from '../types';

const MASTER_KEY = 'carvfi_global_v5';

// Generates exactly 6 numeric digits for referral
const generateRefCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const mockStore = {
  getRegistry: () => {
    const data = localStorage.getItem(MASTER_KEY);
    return data ? JSON.parse(data) : {};
  },

  saveRegistry: (registry: any) => {
    localStorage.setItem(MASTER_KEY, JSON.stringify(registry));
  },

  getUserByWallet: (address: string): User => {
    const registry = mockStore.getRegistry();
    if (registry[address]) {
      return registry[address];
    }
    
    const newUser: User = {
      walletAddress: address,
      username: `Agent_${address.slice(0, 4)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
      points: 0,
      streak: 0,
      level: 1,
      lastCheckIn: null,
      tasksCompleted: [],
      carvUid: '',
      playDomain: '',
      twitter: '',
      discord: '',
      telegram: '',
      referralCode: generateRefCode(),
      referralsCount: 0,
      isNewUser: true
    };
    
    registry[address] = newUser;
    mockStore.saveRegistry(registry);
    return newUser;
  },

  updateUser: (user: User) => {
    if (!user.walletAddress) return;
    const registry = mockStore.getRegistry();
    registry[user.walletAddress] = user;
    mockStore.saveRegistry(registry);
  },

  getLeaderboard: (): LeaderboardEntry[] => {
    return [
      { rank: 1, walletAddress: '0xCARV...777', username: 'SuperAgent', points: 35000, level: 25 },
      { rank: 2, walletAddress: '0xPLAY...111', username: 'Alpha_User', points: 28400, level: 21 },
      { rank: 3, walletAddress: '0xSOL...000', username: 'SolanaWhale', points: 19200, level: 18 },
    ];
  }
};
