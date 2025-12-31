// Core Type Definitions for Discipline OS
// Comprehensive type system for the entire platform

// ============================================
// USER & PROFILE TYPES
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt?: Date;
  settings: UserSettings;
  streak: StreakData;
  couplesCircle: string | null; // Circle ID or null
  level?: number;
  currentStreak?: number;
  totalXP?: number;
}

export interface UserSettings {
  // Time settings
  fajrTime: string; // HH:mm format
  sleepTarget: string; // HH:mm format
  targetSleepTime?: string; // HH:mm format (alias)
  targetWakeTime?: string; // HH:mm format
  wakeTarget?: string; // HH:mm format
  
  // Health targets
  dailyCalorieTarget: number;
  dailyWaterTarget: number; // glasses
  dailyStepsTarget: number;
  
  // Digital discipline
  screenTimeLimit: number; // minutes
  phoneAfterIshaAllowed?: boolean;
  
  // Notifications
  notificationsEnabled?: boolean;
  reminderTimes?: string[]; // Array of HH:mm
  notifications?: {
    morning: boolean;
    evening: boolean;
    reminders: boolean;
    partnerUpdates: boolean;
  };
  
  // Customization
  theme?: 'dark' | 'light' | 'system';
  timezone?: string;
}

export interface StreakData {
  current: number;
  longest: number;
  lastSafeDate: string | null; // YYYY-MM-DD format
}

// ============================================
// TASK TYPES
// ============================================

export type TaskCategory =
  | 'deen'
  | 'health'
  | 'sleep'
  | 'nutrition'
  | 'productivity'
  | 'mental'
  | 'digital'
  | 'deen_upgrade';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface TaskDefinition {
  id: string;
  category: TaskCategory;
  name: string;
  description: string;
  weight: number; // Points value
  priority: TaskPriority;
  isDaily: boolean;
  isOptional: boolean; // For upgrade tasks
  icon: string;
  requiresValue?: boolean; // For tasks that need numeric input
  valueLabel?: string; // e.g., "glasses", "minutes", "steps"
  targetValue?: number; // Default target if applicable
}

export interface TaskCompletion {
  taskId: string;
  completed: boolean;
  completedAt?: Date;
  value?: number; // For numeric tasks
  notes?: string;
  skipped?: boolean;
  skipReason?: string;
  updatedAt?: Date;
}

// ============================================
// DAILY RECORD TYPES
// ============================================

export type DayStatus = 'safe' | 'warning' | 'failure' | 'pending';

export interface DailyRecord {
  id: string; // YYYY-MM-DD format
  userId: string;
  date: string; // YYYY-MM-DD format
  tasks: Record<string, TaskCompletion>;
  
  // Calculated fields
  totalPoints: number;
  earnedPoints: number;
  completionPercentage: number;
  status: DayStatus;
  
  // Metadata
  dayStartedAt?: Date;
  dayEndedAt?: Date;
  verdictGeneratedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  
  // Penalty/Reward assignment
  penaltyAssigned?: string; // Penalty ID
  rewardEarned?: string; // Reward ID
}

export interface DailyVerdict {
  date: string;
  status: DayStatus;
  score: number;
  threshold: number;
  message: string;
  penaltyType?: PenaltyType;
  rewardType?: RewardType;
  breakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: TaskCategory;
  completed: number;
  total: number;
  points: number;
  maxPoints: number;
}

// ============================================
// PENALTY TYPES
// ============================================

export type PenaltySeverity = 'minor' | 'major';

export type PenaltyType =
  | 'extra_cardio'
  | 'cold_shower'
  | 'entertainment_restriction'
  | 'social_media_lockout'
  | 'full_entertainment_ban'
  | 'extra_workout'
  | 'charity_donation'
  | 'earlier_wakeup';

export type PenaltyStatus = 'pending' | 'completed' | 'waived';

export interface Penalty {
  id: string;
  userId: string;
  date: string; // Date penalty was assigned
  type: PenaltyType;
  severity: PenaltySeverity;
  description: string;
  status: PenaltyStatus;
  dueBy?: Date;
  completedAt?: Date;
  waivedAt?: Date;
  waivedReason?: string;
  
  // Couples feature
  editedBy?: 'self' | 'partner';
  editedAt?: Date;
  originalType?: PenaltyType;
  originalDescription?: string;
  
  createdAt: Date;
}

export interface PenaltyDefinition {
  type: PenaltyType;
  severity: PenaltySeverity;
  name: string;
  description: string;
  duration?: string; // e.g., "24 hours", "1 day"
  icon: string;
}

// ============================================
// REWARD TYPES
// ============================================

export type RewardType = 'minor' | 'medium' | 'major';
export type RewardStatus = 'claimable' | 'claimed' | 'expired';

export interface Reward {
  id: string;
  userId: string;
  type: RewardType;
  milestone: number; // Streak count that triggered reward
  name: string;
  description: string;
  status: RewardStatus;
  claimedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface RewardDefinition {
  type: RewardType;
  streakRequired: number;
  name: string;
  description: string;
  suggestions: string[];
}

// ============================================
// COUPLES CIRCLE TYPES
// ============================================

export interface CouplesCircle {
  id: string;
  name?: string;
  members: string[]; // Array of 2 user IDs
  inviteCode: string;
  createdAt: Date;
  createdBy: string;
  sharedStreak?: number;
  mutualChallenges?: Array<{ id: string; name: string; completed: boolean }>;
}

export interface PartnerProgress {
  partnerId: string;
  displayName: string;
  photoURL?: string;
  todayScore: number;
  todayStatus: DayStatus;
  currentStreak: number;
  longestStreak: number;
  weeklyAverage: number;
  tasksCompleted: number;
  totalTasks: number;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface WeeklyAnalytics {
  id: string; // YYYY-WXX format
  userId: string;
  weekStart: string;
  weekEnd: string;
  
  // Aggregates
  averageScore: number;
  totalSafeDays: number;
  totalWarningDays: number;
  totalFailureDays: number;
  
  // Category performance
  categoryBreakdown: Record<TaskCategory, CategoryStats>;
  
  // Task-level analysis
  missedTasks: TaskMissCount[];
  weakestCategory: TaskCategory;
  strongestCategory: TaskCategory;
  
  // Streak
  streakMaintained: boolean;
  streakAtWeekEnd: number;
}

export interface MonthlyAnalytics {
  id: string; // YYYY-MM format
  userId: string;
  month: string;
  
  // Aggregates
  averageScore: number;
  totalSafeDays: number;
  totalWarningDays: number;
  totalFailureDays: number;
  
  // Trends
  complianceTrend: 'improving' | 'declining' | 'stable';
  failureFrequency: number; // failures per week average
  
  // Patterns
  bestDayOfWeek: string;
  worstDayOfWeek: string;
  
  // Category performance
  categoryBreakdown: Record<TaskCategory, CategoryStats>;
  
  // Improvement suggestion
  enforcedSuggestion: string;
  focusArea: TaskCategory;
  
  // Historical comparison
  vsLastMonth?: {
    scoreDiff: number;
    streakDiff: number;
  };
}

export interface CategoryStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averagePoints: number;
}

export interface TaskMissCount {
  taskId: string;
  taskName: string;
  missCount: number;
  category: TaskCategory;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface AppState {
  user: UserProfile | null;
  isLoading: boolean;
  todayRecord: DailyRecord | null;
  pendingPenalties: Penalty[];
  claimableRewards: Reward[];
  couplesCircle: CouplesCircle | null;
  partnerProgress: PartnerProgress | null;
}

export interface DashboardData {
  todayRecord: DailyRecord;
  streak: StreakData;
  pendingPenalties: Penalty[];
  claimableRewards: Reward[];
  weeklyProgress: DailyRecord[];
  partnerProgress?: PartnerProgress;
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TaskUpdatePayload {
  taskId: string;
  completed: boolean;
  value?: number;
  notes?: string;
}

export interface DayEndPayload {
  date: string;
  forceEnd?: boolean;
}
