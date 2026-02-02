
export type Language = 'ar' | 'en';

export interface User {
  walletAddress: string | null;
  username: string;
  avatar: string;
  points: number;
  streak: number;
  level: number;
  lastCheckIn: string | null;
  tasksCompleted: string[]; // Deprecated, use UserTaskProgress in DB
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

export type TaskType = 'social' | 'daily' | 'referral' | 'youtube';
export type TaskPlatform = 'twitter' | 'discord' | 'youtube' | 'telegram' | 'website';
export type TaskAction = 'like' | 'share' | 'follow' | 'subscribe' | 'join' | 'visit';
export type TaskFrequency = 'once' | 'daily' | 'weekly';

export interface TaskConfig {
  id: string;
  type: TaskType;
  platform: TaskPlatform;
  action: TaskAction;
  title: string;
  description: string;
  points: number;
  url?: string;
  frequency: TaskFrequency;
  icon: string;
  isActive: boolean;
  waitTimestamp?: number; // Optional wait time in seconds before verification
}

export interface UserTaskProgress {
  userId: string;
  taskId: string;
  status: 'pending' | 'completed';
  completedAt: number;
  lastClaimedAt?: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'reward';
  message: string;
  timestamp: number;
  read: boolean;
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
