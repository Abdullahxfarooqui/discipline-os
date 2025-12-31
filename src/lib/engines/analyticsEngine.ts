// Analytics Engine - Weekly/Monthly Analytics, Heatmaps, Behavioral Patterns
// Generates insights, trends, and improvement suggestions

import {
  DailyRecord,
  WeeklyAnalytics,
  MonthlyAnalytics,
  TaskCategory,
  CategoryStats,
  TaskMissCount,
  DayStatus,
} from '@/types';
import { TASK_DEFINITIONS, CATEGORY_INFO, getTaskById } from './taskEngine';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  eachDayOfInterval,
  getDay,
  subMonths,
} from 'date-fns';

// ============================================
// WEEKLY ANALYTICS
// ============================================

/**
 * Generate weekly analytics from daily records
 */
export function generateWeeklyAnalytics(
  userId: string,
  records: DailyRecord[],
  weekDate: Date = new Date()
): WeeklyAnalytics {
  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
  const weekId = format(weekStart, "yyyy-'W'ww");
  
  // Filter records for this week
  const weekRecords = records.filter((r) => {
    const recordDate = new Date(r.date);
    return recordDate >= weekStart && recordDate <= weekEnd;
  });
  
  // Calculate aggregates
  const totalDays = weekRecords.length;
  const scores = weekRecords.map((r) => r.completionPercentage);
  const averageScore = totalDays > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / totalDays) 
    : 0;
  
  const statusCounts = countStatuses(weekRecords);
  
  // Category breakdown
  const categoryBreakdown = calculateCategoryBreakdown(weekRecords);
  
  // Find weakest and strongest categories
  const categories = Object.entries(categoryBreakdown)
    .filter(([cat]) => cat !== 'deen_upgrade')
    .sort((a, b) => a[1].completionRate - b[1].completionRate);
  
  const weakestCategory = categories[0]?.[0] as TaskCategory;
  const strongestCategory = categories[categories.length - 1]?.[0] as TaskCategory;
  
  // Most missed tasks
  const missedTasks = calculateMostMissedTasks(weekRecords);
  
  // Streak at week end
  const lastRecord = weekRecords.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
  
  return {
    id: weekId,
    userId,
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    weekEnd: format(weekEnd, 'yyyy-MM-dd'),
    averageScore,
    totalSafeDays: statusCounts.safe,
    totalWarningDays: statusCounts.warning,
    totalFailureDays: statusCounts.failure,
    categoryBreakdown,
    missedTasks,
    weakestCategory,
    strongestCategory,
    streakMaintained: statusCounts.failure === 0,
    streakAtWeekEnd: 0, // Will be filled from user profile
  };
}

/**
 * Count day statuses
 */
function countStatuses(records: DailyRecord[]): {
  safe: number;
  warning: number;
  failure: number;
} {
  return records.reduce(
    (acc, r) => {
      if (r.status === 'safe') acc.safe++;
      else if (r.status === 'warning') acc.warning++;
      else if (r.status === 'failure') acc.failure++;
      return acc;
    },
    { safe: 0, warning: 0, failure: 0 }
  );
}

/**
 * Calculate category-level statistics
 */
function calculateCategoryBreakdown(
  records: DailyRecord[]
): Record<TaskCategory, CategoryStats> {
  const breakdown: Record<TaskCategory, CategoryStats> = {
    deen: { totalTasks: 0, completedTasks: 0, completionRate: 0, averagePoints: 0 },
    health: { totalTasks: 0, completedTasks: 0, completionRate: 0, averagePoints: 0 },
    sleep: { totalTasks: 0, completedTasks: 0, completionRate: 0, averagePoints: 0 },
    nutrition: { totalTasks: 0, completedTasks: 0, completionRate: 0, averagePoints: 0 },
    productivity: { totalTasks: 0, completedTasks: 0, completionRate: 0, averagePoints: 0 },
    mental: { totalTasks: 0, completedTasks: 0, completionRate: 0, averagePoints: 0 },
    digital: { totalTasks: 0, completedTasks: 0, completionRate: 0, averagePoints: 0 },
    deen_upgrade: { totalTasks: 0, completedTasks: 0, completionRate: 0, averagePoints: 0 },
  };
  
  records.forEach((record) => {
    Object.entries(record.tasks).forEach(([taskId, completion]) => {
      const task = getTaskById(taskId);
      if (!task) return;
      
      breakdown[task.category].totalTasks++;
      if (completion.completed) {
        breakdown[task.category].completedTasks++;
        breakdown[task.category].averagePoints += task.weight;
      }
    });
  });
  
  // Calculate rates
  Object.keys(breakdown).forEach((cat) => {
    const category = cat as TaskCategory;
    if (breakdown[category].totalTasks > 0) {
      breakdown[category].completionRate = Math.round(
        (breakdown[category].completedTasks / breakdown[category].totalTasks) * 100
      );
      breakdown[category].averagePoints = Math.round(
        breakdown[category].averagePoints / records.length
      );
    }
  });
  
  return breakdown;
}

/**
 * Find most frequently missed tasks
 */
function calculateMostMissedTasks(
  records: DailyRecord[],
  limit: number = 5
): TaskMissCount[] {
  const missCount: Record<string, number> = {};
  
  records.forEach((record) => {
    Object.entries(record.tasks).forEach(([taskId, completion]) => {
      if (!completion.completed) {
        missCount[taskId] = (missCount[taskId] || 0) + 1;
      }
    });
  });
  
  return Object.entries(missCount)
    .map(([taskId, count]) => {
      const task = getTaskById(taskId);
      return {
        taskId,
        taskName: task?.name || taskId,
        missCount: count,
        category: task?.category || 'productivity',
      };
    })
    .sort((a, b) => b.missCount - a.missCount)
    .slice(0, limit);
}

// ============================================
// MONTHLY ANALYTICS
// ============================================

/**
 * Generate monthly analytics from daily records
 */
export function generateMonthlyAnalytics(
  userId: string,
  records: DailyRecord[],
  monthDate: Date = new Date(),
  previousMonthRecords: DailyRecord[] = []
): MonthlyAnalytics {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const monthId = format(monthDate, 'yyyy-MM');
  
  // Filter records for this month
  const monthRecords = records.filter((r) => {
    const recordDate = new Date(r.date);
    return recordDate >= monthStart && recordDate <= monthEnd;
  });
  
  // Calculate aggregates
  const totalDays = monthRecords.length;
  const scores = monthRecords.map((r) => r.completionPercentage);
  const averageScore = totalDays > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / totalDays) 
    : 0;
  
  const statusCounts = countStatuses(monthRecords);
  
  // Category breakdown
  const categoryBreakdown = calculateCategoryBreakdown(monthRecords);
  
  // Find weakest category
  const categories = Object.entries(categoryBreakdown)
    .filter(([cat]) => cat !== 'deen_upgrade')
    .sort((a, b) => a[1].completionRate - b[1].completionRate);
  
  const focusArea = categories[0]?.[0] as TaskCategory;
  
  // Compliance trend
  const trend = calculateComplianceTrend(monthRecords);
  
  // Best/worst day of week
  const dayPerformance = calculateDayOfWeekPerformance(monthRecords);
  
  // Failure frequency
  const failureFrequency = statusCounts.failure / Math.max(1, Math.ceil(totalDays / 7));
  
  // Comparison with last month
  let vsLastMonth: { scoreDiff: number; streakDiff: number } | undefined;
  if (previousMonthRecords.length > 0) {
    const lastMonthScores = previousMonthRecords.map((r) => r.completionPercentage);
    const lastMonthAvg = lastMonthScores.reduce((a, b) => a + b, 0) / lastMonthScores.length;
    vsLastMonth = {
      scoreDiff: Math.round(averageScore - lastMonthAvg),
      streakDiff: 0, // Would need streak data from both months
    };
  }
  
  // Generate improvement suggestion
  const enforcedSuggestion = generateImprovementSuggestion(
    focusArea,
    categoryBreakdown[focusArea]
  );
  
  return {
    id: monthId,
    userId,
    month: format(monthDate, 'MMMM yyyy'),
    averageScore,
    totalSafeDays: statusCounts.safe,
    totalWarningDays: statusCounts.warning,
    totalFailureDays: statusCounts.failure,
    complianceTrend: trend,
    failureFrequency: Math.round(failureFrequency * 10) / 10,
    bestDayOfWeek: dayPerformance.best,
    worstDayOfWeek: dayPerformance.worst,
    categoryBreakdown,
    enforcedSuggestion,
    focusArea,
    vsLastMonth,
  };
}

/**
 * Calculate compliance trend over the month
 */
function calculateComplianceTrend(
  records: DailyRecord[]
): 'improving' | 'declining' | 'stable' {
  if (records.length < 7) return 'stable';
  
  // Compare first half vs second half
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);
  
  const firstAvg = firstHalf.reduce((sum, r) => sum + r.completionPercentage, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, r) => sum + r.completionPercentage, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  
  if (difference > 5) return 'improving';
  if (difference < -5) return 'declining';
  return 'stable';
}

/**
 * Calculate performance by day of week
 */
function calculateDayOfWeekPerformance(
  records: DailyRecord[]
): { best: string; worst: string } {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayScores: Record<number, number[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
  };
  
  records.forEach((record) => {
    const dayOfWeek = getDay(new Date(record.date));
    dayScores[dayOfWeek].push(record.completionPercentage);
  });
  
  const dayAverages = Object.entries(dayScores).map(([day, scores]) => ({
    day: parseInt(day),
    average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
  }));
  
  const sorted = dayAverages.filter((d) => d.average > 0).sort((a, b) => b.average - a.average);
  
  return {
    best: dayNames[sorted[0]?.day || 0],
    worst: dayNames[sorted[sorted.length - 1]?.day || 0],
  };
}

/**
 * Generate improvement suggestion based on weakest area
 */
function generateImprovementSuggestion(
  category: TaskCategory,
  stats: CategoryStats
): string {
  const categoryName = CATEGORY_INFO[category]?.name || category;
  const completionRate = stats.completionRate;
  
  const suggestions: Record<TaskCategory, string[]> = {
    deen: [
      'Set phone alarms 15 minutes before each prayer time',
      'Keep prayer mat in visible location as reminder',
      'Partner with someone to check prayer accountability',
    ],
    health: [
      'Schedule workouts at fixed times each day',
      'Prepare workout clothes the night before',
      'Start with shorter workouts and build up',
    ],
    sleep: [
      'Set a "wind down" alarm 1 hour before sleep target',
      'Move phone charger outside bedroom',
      'Use blue light filter after sunset',
    ],
    nutrition: [
      'Meal prep on weekends for the week',
      'Keep water bottle visible at all times',
      'Remove junk food from home environment',
    ],
    productivity: [
      'Write top 3 tasks the night before',
      'Block deep work time in calendar',
      'Use website blockers during focus hours',
    ],
    mental: [
      'Set fixed times for journaling (morning/evening)',
      'Use gratitude prompts if stuck',
      'Keep journal by bedside table',
    ],
    digital: [
      'Enable screen time limits on devices',
      'Delete social media apps, use only browser',
      'Charge phone in another room overnight',
    ],
    deen_upgrade: [
      'Start with just 1 page of Quran daily',
      'Listen to Quran during commute',
      'Set small daily Sadaqah automation',
    ],
  };
  
  const categorySuggestions = suggestions[category] || suggestions.productivity;
  const randomSuggestion = categorySuggestions[Math.floor(Math.random() * categorySuggestions.length)];
  
  return `Focus Area: ${categoryName} (${completionRate}% completion). Enforced Action: ${randomSuggestion}`;
}

// ============================================
// HEATMAP DATA
// ============================================

/**
 * Generate heatmap data for visualization
 */
export function generateHeatmapData(
  records: DailyRecord[],
  days: number = 90
): { date: string; score: number; status: DayStatus }[] {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const recordMap = new Map(records.map((r) => [r.date, r]));
  const allDays = eachDayOfInterval({ start: startDate, end: new Date() });
  
  return allDays.map((date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = recordMap.get(dateStr);
    
    return {
      date: dateStr,
      score: record?.completionPercentage || 0,
      status: record?.status || 'pending',
    };
  });
}

/**
 * Get color for heatmap cell based on score
 */
export function getHeatmapColor(score: number, status: DayStatus): string {
  if (status === 'pending') return '#1f1f23'; // discipline-border
  
  if (score >= 80) return '#22c55e'; // safe
  if (score >= 65) return '#4ade80'; // safe-light
  if (score >= 50) return '#f59e0b'; // warning
  if (score >= 35) return '#ef4444'; // failure
  return '#991b1b'; // failure-dark
}

// ============================================
// COMPARATIVE ANALYTICS (COUPLES)
// ============================================

/**
 * Generate comparative analytics for couples
 */
export function generateComparativeAnalytics(
  userRecords: DailyRecord[],
  partnerRecords: DailyRecord[],
  period: 'week' | 'month' = 'week'
): {
  userAverage: number;
  partnerAverage: number;
  difference: number;
  leader: 'user' | 'partner' | 'tie';
  sharedSafeDays: number;
  sharedFailureDays: number;
} {
  const userScores = userRecords.map((r) => r.completionPercentage);
  const partnerScores = partnerRecords.map((r) => r.completionPercentage);
  
  const userAverage = userScores.length > 0 
    ? Math.round(userScores.reduce((a, b) => a + b, 0) / userScores.length)
    : 0;
  const partnerAverage = partnerScores.length > 0 
    ? Math.round(partnerScores.reduce((a, b) => a + b, 0) / partnerScores.length)
    : 0;
  
  const difference = Math.abs(userAverage - partnerAverage);
  const leader = userAverage > partnerAverage 
    ? 'user' 
    : partnerAverage > userAverage 
      ? 'partner' 
      : 'tie';
  
  // Count shared outcomes
  const userDates = new Map(userRecords.map((r) => [r.date, r.status]));
  let sharedSafeDays = 0;
  let sharedFailureDays = 0;
  
  partnerRecords.forEach((pr) => {
    const userStatus = userDates.get(pr.date);
    if (userStatus === 'safe' && pr.status === 'safe') sharedSafeDays++;
    if (userStatus === 'failure' && pr.status === 'failure') sharedFailureDays++;
  });
  
  return {
    userAverage,
    partnerAverage,
    difference,
    leader,
    sharedSafeDays,
    sharedFailureDays,
  };
}
