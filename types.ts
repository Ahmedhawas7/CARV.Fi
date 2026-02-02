
export type Language = 'ar' | 'en';

export interface User {
  walletAddress: string | null;
  username: string;
  avatar: string;
  points: number;
  streak: number;
  level: number;
  lastCheckIn: string | null;
  tasksCompleted: string[];
  carvUid?: string;
  playDomain?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  // Referral System Fields
  referralCode: string;
  referredBy?: string;
  referralsCount: number;
  isNewUser?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'daily' | 'twitter' | 'chat';
  icon: string;
}

export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  username: string;
  points: number;
  level: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
