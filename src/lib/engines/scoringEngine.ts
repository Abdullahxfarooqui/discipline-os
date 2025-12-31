// Scoring Engine - Weighted Scoring, Thresholds, Day Classification
// Implements the compliance scoring system and day verdicts

import {
  DailyRecord,
  DayStatus,
  DailyVerdict,
  CategoryBreakdown,
  TaskCategory,
  TaskCompletion,
} from '@/types';
import {
  TASK_DEFINITIONS,
  getMandatoryTasks,
  getTaskById,
  getCategoryStats,
  getUncompletedMandatoryTasks,
  CATEGORY_INFO,
} from './taskEngine';

// ============================================
// SCORING CONSTANTS
// ============================================

// Base threshold percentages
const SAFE_THRESHOLD_BASE = 65; // 65% minimum for safe day
const WARNING_THRESHOLD_BASE = 50; // 50-65% is warning zone
// Below 50% is failure

// Threshold adjustment based on task count
// More tasks = slightly more lenient threshold
const THRESHOLD_ADJUSTMENT_FACTOR = 0.5;

// Critical task penalty multiplier
// Missing critical tasks has extra impact
const CRITICAL_MISS_PENALTY = 1.2;

// ============================================
// SCORING FUNCTIONS
// ============================================

/**
 * Calculate the dynamic safe threshold based on task count
 * More tasks = slightly lower percentage required to account for difficulty
 */
export function calculateSafeThreshold(taskCount: number): number {
  const baseThreshold = SAFE_THRESHOLD_BASE;
  // Reduce threshold by 0.5% per task above 20
  const adjustment = Math.max(0, (taskCount - 20) * THRESHOLD_ADJUSTMENT_FACTOR);
  const threshold = baseThreshold - adjustment;
  // Cap at minimum 55%
  return Math.max(55, Math.round(threshold));
}

/**
 * Calculate the warning threshold
 */
export function calculateWarningThreshold(taskCount: number): number {
  const safeThreshold = calculateSafeThreshold(taskCount);
  return safeThreshold - 15; // Warning is 15% below safe
}

/**
 * Calculate total points possible (mandatory tasks only)
 */
export function calculateTotalPoints(): number {
  return getMandatoryTasks().reduce((sum, task) => sum + task.weight, 0);
}

/**
 * Calculate earned points from task completions
 */
export function calculateEarnedPoints(tasks: Record<string, TaskCompletion>): number {
  let points = 0;
  
  getMandatoryTasks().forEach((task) => {
    if (tasks[task.id]?.completed) {
      points += task.weight;
    }
  });
  
  return points;
}

/**
 * Calculate bonus points from optional tasks
 */
export function calculateBonusPoints(tasks: Record<string, TaskCompletion>): number {
  let points = 0;
  
  TASK_DEFINITIONS.filter((t) => t.isOptional).forEach((task) => {
    if (tasks[task.id]?.completed) {
      points += task.weight;
    }
  });
  
  return points;
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionPercentage(
  earnedPoints: number,
  totalPoints: number
): number {
  if (totalPoints === 0) return 0;
  return Math.round((earnedPoints / totalPoints) * 100);
}

/**
 * Calculate critical task penalty
 * If critical tasks are missed, apply penalty to score
 */
export function calculateCriticalPenalty(tasks: Record<string, TaskCompletion>): number {
  const criticalTasks = TASK_DEFINITIONS.filter(
    (t) => t.priority === 'critical' && !t.isOptional
  );
  
  let missedCritical = 0;
  criticalTasks.forEach((task) => {
    if (!tasks[task.id]?.completed) {
      missedCritical++;
    }
  });
  
  // Each missed critical task reduces score by penalty factor
  return missedCritical * CRITICAL_MISS_PENALTY;
}

/**
 * Determine day status based on completion percentage
 */
export function determineDayStatus(
  completionPercentage: number,
  taskCount: number,
  tasks: Record<string, TaskCompletion>
): DayStatus {
  const safeThreshold = calculateSafeThreshold(taskCount);
  const warningThreshold = calculateWarningThreshold(taskCount);
  
  // Apply critical task penalty to percentage
  const criticalPenalty = calculateCriticalPenalty(tasks);
  const adjustedPercentage = completionPercentage - criticalPenalty;
  
  if (adjustedPercentage >= safeThreshold) {
    return 'safe';
  } else if (adjustedPercentage >= warningThreshold) {
    return 'warning';
  } else {
    return 'failure';
  }
}

/**
 * Generate category breakdown for the day
 */
export function generateCategoryBreakdown(
  tasks: Record<string, TaskCompletion>
): CategoryBreakdown[] {
  const stats = getCategoryStats(tasks);
  
  return Object.entries(stats)
    .filter(([category]) => category !== 'deen_upgrade') // Exclude optional category
    .map(([category, data]) => ({
      category: category as TaskCategory,
      completed: data.completed,
      total: data.total,
      points: data.points,
      maxPoints: data.maxPoints,
    }));
}

/**
 * Generate verdict message based on day status
 */
function generateVerdictMessage(
  status: DayStatus,
  completionPercentage: number,
  weakestCategory?: TaskCategory
): string {
  switch (status) {
    case 'safe':
      if (completionPercentage >= 90) {
        return 'Exceptional discipline. You have earned this day.';
      } else if (completionPercentage >= 80) {
        return 'Strong performance. Maintain this standard.';
      } else {
        return 'Day passed. Safe, but room for improvement.';
      }
    
    case 'warning':
      const categoryName = weakestCategory ? CATEGORY_INFO[weakestCategory].name : 'multiple areas';
      return `Warning zone. Focus needed on ${categoryName}. No penalty today, but consecutive warnings become failures.`;
    
    case 'failure':
      return 'Day failed. Penalty will be assigned. Reflect on what went wrong and commit to tomorrow.';
    
    default:
      return 'Day pending evaluation.';
  }
}

/**
 * Find the weakest category (lowest completion rate)
 */
export function findWeakestCategory(
  tasks: Record<string, TaskCompletion>
): TaskCategory | undefined {
  const stats = getCategoryStats(tasks);
  let weakest: TaskCategory | undefined;
  let lowestRate = 100;
  
  Object.entries(stats).forEach(([category, data]) => {
    if (category !== 'deen_upgrade' && data.total > 0) {
      const rate = (data.completed / data.total) * 100;
      if (rate < lowestRate) {
        lowestRate = rate;
        weakest = category as TaskCategory;
      }
    }
  });
  
  return weakest;
}

/**
 * Generate complete daily verdict
 */
export function generateDailyVerdict(record: DailyRecord): DailyVerdict {
  const tasks = record.tasks;
  const mandatoryTasks = getMandatoryTasks();
  const taskCount = mandatoryTasks.length;
  
  const totalPoints = calculateTotalPoints();
  const earnedPoints = calculateEarnedPoints(tasks);
  const bonusPoints = calculateBonusPoints(tasks);
  const completionPercentage = calculateCompletionPercentage(earnedPoints, totalPoints);
  
  const safeThreshold = calculateSafeThreshold(taskCount);
  const status = determineDayStatus(completionPercentage, taskCount, tasks);
  const weakestCategory = findWeakestCategory(tasks);
  const breakdown = generateCategoryBreakdown(tasks);
  const message = generateVerdictMessage(status, completionPercentage, weakestCategory);
  
  return {
    date: record.date,
    status,
    score: completionPercentage,
    threshold: safeThreshold,
    message,
    breakdown,
    penaltyType: status === 'failure' ? determineFailureSeverity(completionPercentage) : undefined,
    rewardType: undefined, // Set by streak engine if applicable
  };
}

/**
 * Determine failure severity based on how far below threshold
 */
function determineFailureSeverity(percentage: number): undefined {
  // Penalty type is determined by penaltyEngine, not here
  return undefined;
}

/**
 * Calculate and update a daily record with current scores
 */
export function updateDailyRecordScores(record: DailyRecord): DailyRecord {
  const totalPoints = calculateTotalPoints();
  const earnedPoints = calculateEarnedPoints(record.tasks);
  const completionPercentage = calculateCompletionPercentage(earnedPoints, totalPoints);
  const status = determineDayStatus(
    completionPercentage,
    getMandatoryTasks().length,
    record.tasks
  );
  
  return {
    ...record,
    totalPoints,
    earnedPoints,
    completionPercentage,
    status: record.dayEndedAt ? status : 'pending', // Only set status if day has ended
    updatedAt: new Date(),
  };
}

/**
 * Check if day can be considered complete (after Isha or midnight)
 */
export function isDayComplete(fajrTime: string = '05:00'): boolean {
  const now = new Date();
  const hours = now.getHours();
  
  // Day is complete after 11 PM (23:00)
  // This gives time after Isha for final check-ins
  return hours >= 23;
}

/**
 * Get score status color class
 */
export function getStatusColor(status: DayStatus): string {
  switch (status) {
    case 'safe':
      return 'text-safe';
    case 'warning':
      return 'text-warning';
    case 'failure':
      return 'text-failure';
    default:
      return 'text-discipline-muted';
  }
}

/**
 * Get score status background class
 */
export function getStatusBackground(status: DayStatus): string {
  switch (status) {
    case 'safe':
      return 'bg-safe-bg border-safe-muted';
    case 'warning':
      return 'bg-warning-bg border-warning-muted';
    case 'failure':
      return 'bg-failure-bg border-failure-muted';
    default:
      return 'bg-discipline-card border-discipline-border';
  }
}

/**
 * Get status emoji
 */
export function getStatusEmoji(status: DayStatus): string {
  switch (status) {
    case 'safe':
      return '🟢';
    case 'warning':
      return '🟡';
    case 'failure':
      return '🔴';
    default:
      return '⚪';
  }
}
