// Streak & Reward Engine - Streak Tracking, Milestones, Rewards
// Handles streak calculation, milestone detection, and reward assignment

import {
  Reward,
  RewardType,
  RewardStatus,
  RewardDefinition,
  StreakData,
  DailyRecord,
  DayStatus,
} from '@/types';
import { createReward, claimReward as claimRewardDB, updateStreak } from '../firebase/database';

// ============================================
// REWARD DEFINITIONS
// ============================================

export const REWARD_DEFINITIONS: RewardDefinition[] = [
  {
    type: 'minor',
    streakRequired: 3,
    name: '3-Day Streak Reward',
    description: 'Earned for maintaining 3 consecutive safe days',
    suggestions: [
      'Favorite snack or treat',
      'Extra 30 minutes of leisure time',
      'Watch an episode of favorite show',
      'Small purchase under $10',
    ],
  },
  {
    type: 'medium',
    streakRequired: 7,
    name: '7-Day Streak Reward',
    description: 'Earned for maintaining 7 consecutive safe days (1 week)',
    suggestions: [
      'Nice meal at favorite restaurant',
      'Purchase something under $30',
      'Half-day off from extra tasks',
      'Movie night or gaming session',
      'Spa treatment or massage',
    ],
  },
  {
    type: 'major',
    streakRequired: 30,
    name: '30-Day Streak Reward',
    description: 'Earned for maintaining 30 consecutive safe days (1 month)',
    suggestions: [
      'Significant purchase you\'ve been wanting',
      'Weekend trip or staycation',
      'Premium subscription for a month',
      'New equipment or gear',
      'Special experience (concert, event, etc.)',
      'Charity donation in your name',
    ],
  },
];

// Additional milestone definitions
export const STREAK_MILESTONES = [3, 7, 14, 21, 30, 60, 90, 180, 365];

// ============================================
// STREAK FUNCTIONS
// ============================================

/**
 * Calculate streak from daily records
 */
export function calculateStreakFromRecords(
  records: DailyRecord[],
  currentStreak: number = 0
): number {
  if (records.length === 0) return currentStreak;
  
  // Sort records by date descending (most recent first)
  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  
  for (const record of sorted) {
    if (record.status === 'safe') {
      streak++;
    } else if (record.status === 'failure') {
      break;
    }
    // Warning days don't break streak but don't add to it
  }
  
  return streak;
}

/**
 * Check if streak is broken
 */
export function isStreakBroken(todayStatus: DayStatus): boolean {
  return todayStatus === 'failure';
}

/**
 * Update streak based on today's performance
 */
export async function processStreakUpdate(
  userId: string,
  currentStreak: StreakData,
  todayStatus: DayStatus,
  todayDate: string
): Promise<{
  newStreak: StreakData;
  milestone?: number;
  reward?: RewardDefinition;
}> {
  const isSafe = todayStatus === 'safe';
  
  // Update streak in database and get new values
  const newStreak = await updateStreak(userId, isSafe, todayDate);
  
  // Check for milestone
  const milestone = isSafe ? checkMilestone(newStreak.current) : undefined;
  
  // Get reward definition if milestone reached
  const reward = milestone ? getRewardForStreak(newStreak.current) : undefined;
  
  return {
    newStreak: {
      current: newStreak.current,
      longest: newStreak.longest,
      lastSafeDate: isSafe ? todayDate : null,
    },
    milestone,
    reward,
  };
}

/**
 * Check if current streak hits a milestone
 */
export function checkMilestone(streakCount: number): number | undefined {
  return STREAK_MILESTONES.find((m) => m === streakCount);
}

/**
 * Get the next milestone to aim for
 */
export function getNextMilestone(currentStreak: number): number {
  return STREAK_MILESTONES.find((m) => m > currentStreak) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
}

/**
 * Get progress percentage to next milestone
 */
export function getMilestoneProgress(currentStreak: number): {
  current: number;
  next: number;
  progress: number;
  previousMilestone: number;
} {
  const nextMilestone = getNextMilestone(currentStreak);
  const previousMilestone = STREAK_MILESTONES.filter((m) => m < currentStreak).pop() || 0;
  
  const range = nextMilestone - previousMilestone;
  const progress = ((currentStreak - previousMilestone) / range) * 100;
  
  return {
    current: currentStreak,
    next: nextMilestone,
    progress: Math.min(100, Math.max(0, progress)),
    previousMilestone,
  };
}

// ============================================
// REWARD FUNCTIONS
// ============================================

/**
 * Get reward definition for a streak count
 */
export function getRewardForStreak(streakCount: number): RewardDefinition | undefined {
  return REWARD_DEFINITIONS.find((r) => r.streakRequired === streakCount);
}

/**
 * Get reward type based on streak
 */
export function getRewardType(streakCount: number): RewardType | undefined {
  if (streakCount >= 30) return 'major';
  if (streakCount >= 7) return 'medium';
  if (streakCount >= 3) return 'minor';
  return undefined;
}

/**
 * Create and assign a reward for reaching a milestone
 */
export async function assignReward(
  userId: string,
  milestone: number
): Promise<Reward | null> {
  const rewardDef = getRewardForStreak(milestone);
  if (!rewardDef) return null;
  
  const reward: Omit<Reward, 'id'> = {
    userId,
    type: rewardDef.type,
    milestone,
    name: rewardDef.name,
    description: rewardDef.description,
    status: 'claimable',
    createdAt: new Date(),
    // Rewards expire after 7 days if not claimed
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  
  const rewardId = await createReward(userId, reward);
  
  return {
    id: rewardId,
    ...reward,
  };
}

/**
 * Claim a reward
 */
export async function claimReward(
  userId: string,
  rewardId: string
): Promise<void> {
  await claimRewardDB(userId, rewardId);
}

/**
 * Check if a reward has expired
 */
export function isRewardExpired(reward: Reward): boolean {
  if (!reward.expiresAt) return false;
  return new Date(reward.expiresAt) < new Date();
}

/**
 * Get reward suggestions based on type
 */
export function getRewardSuggestions(type: RewardType): string[] {
  const def = REWARD_DEFINITIONS.find((r) => r.type === type);
  return def?.suggestions || [];
}

/**
 * Format streak for display
 */
export function formatStreakDisplay(streak: number): {
  value: string;
  label: string;
  emoji: string;
} {
  if (streak === 0) {
    return { value: '0', label: 'days', emoji: '🔄' };
  } else if (streak === 1) {
    return { value: '1', label: 'day', emoji: '🔥' };
  } else if (streak < 7) {
    return { value: streak.toString(), label: 'days', emoji: '🔥' };
  } else if (streak < 30) {
    return { value: streak.toString(), label: 'days', emoji: '🔥🔥' };
  } else if (streak < 100) {
    return { value: streak.toString(), label: 'days', emoji: '🔥🔥🔥' };
  } else {
    return { value: streak.toString(), label: 'days', emoji: '👑' };
  }
}

/**
 * Get streak status message
 */
export function getStreakStatusMessage(streak: number): string {
  if (streak === 0) {
    return 'Start your streak today. One safe day at a time.';
  } else if (streak < 3) {
    return `${3 - streak} more day(s) until your first reward.`;
  } else if (streak < 7) {
    return `${7 - streak} more day(s) until the 7-day milestone.`;
  } else if (streak < 14) {
    return `Strong week! ${14 - streak} more days to 2-week milestone.`;
  } else if (streak < 30) {
    return `Impressive discipline! ${30 - streak} more days to monthly reward.`;
  } else if (streak < 60) {
    return `Outstanding! ${60 - streak} more days to 2-month milestone.`;
  } else if (streak < 90) {
    return `Elite discipline! ${90 - streak} more days to quarterly milestone.`;
  } else {
    return `Legendary streak! You are building something permanent.`;
  }
}

/**
 * Get color class based on streak
 */
export function getStreakColor(streak: number): string {
  if (streak >= 30) return 'text-amber-400';
  if (streak >= 7) return 'text-orange-500';
  if (streak >= 3) return 'text-safe';
  return 'text-discipline-muted';
}

/**
 * Calculate streak value (for analytics/comparison)
 */
export function calculateStreakValue(streak: number): number {
  // Exponential value increase for longer streaks
  return Math.pow(streak, 1.2);
}

/**
 * Get all earned rewards for a streak length
 */
export function getAllEarnedRewards(streakCount: number): RewardDefinition[] {
  return REWARD_DEFINITIONS.filter((r) => streakCount >= r.streakRequired);
}
