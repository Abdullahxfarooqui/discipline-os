// Task Engine - Task Definitions & Daily Population
// Defines all mandatory tasks, categories, weights, and daily generation logic

import { TaskDefinition, TaskCategory, TaskCompletion, DailyRecord } from '@/types';
import { format } from 'date-fns';

// ============================================
// TASK DEFINITIONS
// ============================================

export const TASK_DEFINITIONS: TaskDefinition[] = [
  // ============================================
  // DEEN - MANDATORY PRAYERS
  // ============================================
  {
    id: 'fajr',
    category: 'deen',
    name: 'Fajr Prayer',
    description: 'Performed Fajr prayer on time',
    weight: 15,
    priority: 'critical',
    isDaily: true,
    isOptional: false,
    icon: '🌅',
  },
  {
    id: 'zuhr',
    category: 'deen',
    name: 'Zuhr Prayer',
    description: 'Performed Zuhr prayer on time',
    weight: 12,
    priority: 'critical',
    isDaily: true,
    isOptional: false,
    icon: '☀️',
  },
  {
    id: 'asr',
    category: 'deen',
    name: 'Asr Prayer',
    description: 'Performed Asr prayer on time',
    weight: 12,
    priority: 'critical',
    isDaily: true,
    isOptional: false,
    icon: '🌤️',
  },
  {
    id: 'maghrib',
    category: 'deen',
    name: 'Maghrib Prayer',
    description: 'Performed Maghrib prayer on time',
    weight: 12,
    priority: 'critical',
    isDaily: true,
    isOptional: false,
    icon: '🌅',
  },
  {
    id: 'isha',
    category: 'deen',
    name: 'Isha Prayer',
    description: 'Performed Isha prayer on time',
    weight: 12,
    priority: 'critical',
    isDaily: true,
    isOptional: false,
    icon: '🌙',
  },

  // ============================================
  // HEALTH & FITNESS
  // ============================================
  {
    id: 'workout',
    category: 'health',
    name: 'Workout',
    description: 'Completed workout session',
    weight: 12,
    priority: 'high',
    isDaily: true,
    isOptional: false,
    icon: '💪',
  },
  {
    id: 'steps',
    category: 'health',
    name: 'Steps Goal',
    description: 'Reached daily steps target',
    weight: 8,
    priority: 'high',
    isDaily: true,
    isOptional: false,
    icon: '👟',
    requiresValue: true,
    valueLabel: 'steps',
    targetValue: 10000,
  },
  {
    id: 'mobility',
    category: 'health',
    name: 'Mobility/Stretching',
    description: 'Completed mobility or stretching routine',
    weight: 6,
    priority: 'medium',
    isDaily: true,
    isOptional: false,
    icon: '🧘',
  },

  // ============================================
  // SLEEP DISCIPLINE
  // ============================================
  {
    id: 'sleep_time',
    category: 'sleep',
    name: 'Sleep Before Target',
    description: 'Went to bed before target time',
    weight: 10,
    priority: 'high',
    isDaily: true,
    isOptional: false,
    icon: '🛏️',
  },
  {
    id: 'sleep_duration',
    category: 'sleep',
    name: '7-8 Hours Sleep',
    description: 'Got 7-8 hours of quality sleep',
    weight: 10,
    priority: 'high',
    isDaily: true,
    isOptional: false,
    icon: '😴',
    requiresValue: true,
    valueLabel: 'hours',
    targetValue: 7.5,
  },
  {
    id: 'no_phone_before_bed',
    category: 'sleep',
    name: 'No Phone 30min Before Bed',
    description: 'No phone usage 30 minutes before sleep',
    weight: 8,
    priority: 'high',
    isDaily: true,
    isOptional: false,
    icon: '📵',
  },

  // ============================================
  // NUTRITION
  // ============================================
  {
    id: 'calories_logged',
    category: 'nutrition',
    name: 'Calories Logged',
    description: 'Tracked all food intake for the day',
    weight: 6,
    priority: 'medium',
    isDaily: true,
    isOptional: false,
    icon: '📝',
  },
  {
    id: 'calories_target',
    category: 'nutrition',
    name: 'Within Calorie Target',
    description: 'Stayed within daily calorie target',
    weight: 8,
    priority: 'high',
    isDaily: true,
    isOptional: false,
    icon: '🎯',
    requiresValue: true,
    valueLabel: 'calories',
  },
  {
    id: 'no_junk',
    category: 'nutrition',
    name: 'No Junk Food',
    description: 'Avoided junk food and processed snacks',
    weight: 8,
    priority: 'high',
    isDaily: true,
    isOptional: false,
    icon: '🚫',
  },
  {
    id: 'water',
    category: 'nutrition',
    name: 'Water Goal Met',
    description: 'Drank target amount of water',
    weight: 6,
    priority: 'medium',
    isDaily: true,
    isOptional: false,
    icon: '💧',
    requiresValue: true,
    valueLabel: 'glasses',
    targetValue: 8,
  },

  // ============================================
  // PRODUCTIVITY
  // ============================================
  {
    id: 'top_3_tasks',
    category: 'productivity',
    name: 'Top 3 Tasks Done',
    description: 'Completed all 3 priority tasks for the day',
    weight: 12,
    priority: 'critical',
    isDaily: true,
    isOptional: false,
    icon: '✅',
  },
  {
    id: 'todo_70',
    category: 'productivity',
    name: '≥70% To-Do List',
    description: 'Completed at least 70% of to-do list',
    weight: 8,
    priority: 'high',
    isDaily: true,
    isOptional: false,
    icon: '📋',
  },
  {
    id: 'deep_work',
    category: 'productivity',
    name: 'Deep Work Session',
    description: 'Completed focused deep work session',
    weight: 10,
    priority: 'high',
    isDaily: true,
    isOptional: false,
    icon: '🎯',
    requiresValue: true,
    valueLabel: 'minutes',
    targetValue: 90,
  },
  {
    id: 'learning',
    category: 'productivity',
    name: 'Learning/Reading',
    description: 'Spent time learning or reading',
    weight: 6,
    priority: 'medium',
    isDaily: true,
    isOptional: false,
    icon: '📚',
    requiresValue: true,
    valueLabel: 'minutes',
    targetValue: 30,
  },

  // ============================================
  // MENTAL CONTROL
  // ============================================
  {
    id: 'mood_check',
    category: 'mental',
    name: 'Mood Check-in',
    description: 'Completed mood check-in and reflection',
    weight: 4,
    priority: 'medium',
    isDaily: true,
    isOptional: false,
    icon: '🧠',
  },
  {
    id: 'gratitude',
    category: 'mental',
    name: 'Gratitude Practice',
    description: 'Listed 3 things grateful for',
    weight: 4,
    priority: 'medium',
    isDaily: true,
    isOptional: false,
    icon: '🙏',
  },
  {
    id: 'journaling',
    category: 'mental',
    name: 'Journaling',
    description: 'Completed daily journal entry',
    weight: 6,
    priority: 'medium',
    isDaily: true,
    isOptional: false,
    icon: '📔',
  },

  // ============================================
  // DIGITAL DISCIPLINE
  // ============================================
  {
    id: 'screen_time',
    category: 'digital',
    name: 'Screen Time Under Limit',
    description: 'Kept screen time under daily limit',
    weight: 8,
    priority: 'high',
    isDaily: true,
    isOptional: false,
    icon: '📱',
    requiresValue: true,
    valueLabel: 'minutes',
  },
  {
    id: 'no_phone_after_isha',
    category: 'digital',
    name: 'No Phone After Isha',
    description: 'No unnecessary phone use after Isha',
    weight: 8,
    priority: 'high',
    isDaily: true,
    isOptional: false,
    icon: '🔕',
  },
  {
    id: 'social_media_fast',
    category: 'digital',
    name: 'Social Media Fast',
    description: 'Avoided social media for the day',
    weight: 6,
    priority: 'medium',
    isDaily: true,
    isOptional: true, // Optional challenge
    icon: '🚷',
  },

  // ============================================
  // DEEN UPGRADE (OPTIONAL/REWARDED)
  // ============================================
  {
    id: 'quran',
    category: 'deen_upgrade',
    name: 'Quran Reading',
    description: 'Read Quran today',
    weight: 8,
    priority: 'high',
    isDaily: true,
    isOptional: true,
    icon: '📖',
    requiresValue: true,
    valueLabel: 'pages',
    targetValue: 5,
  },
  {
    id: 'dhikr',
    category: 'deen_upgrade',
    name: 'Dhikr/Adhkar',
    description: 'Completed morning/evening adhkar',
    weight: 6,
    priority: 'medium',
    isDaily: true,
    isOptional: true,
    icon: '📿',
  },
  {
    id: 'charity',
    category: 'deen_upgrade',
    name: 'Daily Charity/Sadaqah',
    description: 'Gave charity or helped someone',
    weight: 6,
    priority: 'medium',
    isDaily: true,
    isOptional: true,
    icon: '💝',
  },
];

// ============================================
// CATEGORY METADATA
// ============================================

export const CATEGORY_INFO: Record<TaskCategory, { name: string; icon: string; color: string }> = {
  deen: {
    name: 'Deen',
    icon: '🕌',
    color: '#8b5cf6', // purple
  },
  health: {
    name: 'Health & Fitness',
    icon: '💪',
    color: '#22c55e', // green
  },
  sleep: {
    name: 'Sleep Discipline',
    icon: '🌙',
    color: '#3b82f6', // blue
  },
  nutrition: {
    name: 'Nutrition',
    icon: '🥗',
    color: '#f59e0b', // amber
  },
  productivity: {
    name: 'Productivity',
    icon: '🚀',
    color: '#ef4444', // red
  },
  mental: {
    name: 'Mental Control',
    icon: '🧠',
    color: '#06b6d4', // cyan
  },
  digital: {
    name: 'Digital Discipline',
    icon: '📵',
    color: '#f97316', // orange
  },
  deen_upgrade: {
    name: 'Deen Upgrade',
    icon: '⭐',
    color: '#a855f7', // violet
  },
};

// ============================================
// TASK ENGINE FUNCTIONS
// ============================================

/**
 * Get all task definitions for a specific category
 */
export function getTasksByCategory(category: TaskCategory): TaskDefinition[] {
  return TASK_DEFINITIONS.filter((task) => task.category === category);
}

/**
 * Get mandatory tasks (excludes optional tasks)
 */
export function getMandatoryTasks(): TaskDefinition[] {
  return TASK_DEFINITIONS.filter((task) => !task.isOptional);
}

/**
 * Get optional/upgrade tasks
 */
export function getOptionalTasks(): TaskDefinition[] {
  return TASK_DEFINITIONS.filter((task) => task.isOptional);
}

/**
 * Get task by ID
 */
export function getTaskById(taskId: string): TaskDefinition | undefined {
  return TASK_DEFINITIONS.find((task) => task.id === taskId);
}

/**
 * Calculate total possible points for mandatory tasks
 */
export function getTotalMandatoryPoints(): number {
  return getMandatoryTasks().reduce((sum, task) => sum + task.weight, 0);
}

/**
 * Calculate total possible points including optional tasks
 */
export function getTotalPossiblePoints(): number {
  return TASK_DEFINITIONS.reduce((sum, task) => sum + task.weight, 0);
}

/**
 * Generate empty task completions for a new day
 */
export function generateEmptyTaskCompletions(): Record<string, TaskCompletion> {
  const completions: Record<string, TaskCompletion> = {};
  
  TASK_DEFINITIONS.forEach((task) => {
    completions[task.id] = {
      taskId: task.id,
      completed: false,
    };
  });
  
  return completions;
}

/**
 * Create a new daily record for a given date
 */
export function createEmptyDailyRecord(userId: string, date: Date): Omit<DailyRecord, 'id'> {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  return {
    userId,
    date: dateStr,
    tasks: generateEmptyTaskCompletions(),
    totalPoints: getTotalMandatoryPoints(),
    earnedPoints: 0,
    completionPercentage: 0,
    status: 'pending',
    createdAt: new Date(),
  };
}

/**
 * Calculate earned points from task completions
 */
export function calculateEarnedPoints(
  tasks: Record<string, TaskCompletion>,
  includeOptional: boolean = true
): number {
  let points = 0;
  
  Object.values(tasks).forEach((completion) => {
    if (completion.completed) {
      const taskDef = getTaskById(completion.taskId);
      if (taskDef && (includeOptional || !taskDef.isOptional)) {
        points += taskDef.weight;
      }
    }
  });
  
  return points;
}

/**
 * Calculate completion percentage for mandatory tasks
 */
export function calculateMandatoryCompletion(tasks: Record<string, TaskCompletion>): number {
  const mandatoryTasks = getMandatoryTasks();
  let completedCount = 0;
  
  mandatoryTasks.forEach((task) => {
    if (tasks[task.id]?.completed) {
      completedCount++;
    }
  });
  
  return Math.round((completedCount / mandatoryTasks.length) * 100);
}

/**
 * Get tasks grouped by category
 */
export function getTasksGroupedByCategory(): Record<TaskCategory, TaskDefinition[]> {
  const grouped: Record<TaskCategory, TaskDefinition[]> = {
    deen: [],
    health: [],
    sleep: [],
    nutrition: [],
    productivity: [],
    mental: [],
    digital: [],
    deen_upgrade: [],
  };
  
  TASK_DEFINITIONS.forEach((task) => {
    grouped[task.category].push(task);
  });
  
  return grouped;
}

/**
 * Get category completion stats
 */
export function getCategoryStats(
  tasks: Record<string, TaskCompletion>
): Record<TaskCategory, { completed: number; total: number; points: number; maxPoints: number }> {
  const stats: Record<TaskCategory, { completed: number; total: number; points: number; maxPoints: number }> = {
    deen: { completed: 0, total: 0, points: 0, maxPoints: 0 },
    health: { completed: 0, total: 0, points: 0, maxPoints: 0 },
    sleep: { completed: 0, total: 0, points: 0, maxPoints: 0 },
    nutrition: { completed: 0, total: 0, points: 0, maxPoints: 0 },
    productivity: { completed: 0, total: 0, points: 0, maxPoints: 0 },
    mental: { completed: 0, total: 0, points: 0, maxPoints: 0 },
    digital: { completed: 0, total: 0, points: 0, maxPoints: 0 },
    deen_upgrade: { completed: 0, total: 0, points: 0, maxPoints: 0 },
  };
  
  TASK_DEFINITIONS.forEach((task) => {
    if (!task.isOptional) { // Only count mandatory tasks for stats
      stats[task.category].total++;
      stats[task.category].maxPoints += task.weight;
      
      if (tasks[task.id]?.completed) {
        stats[task.category].completed++;
        stats[task.category].points += task.weight;
      }
    }
  });
  
  return stats;
}

/**
 * Get uncompleted mandatory tasks
 */
export function getUncompletedMandatoryTasks(
  tasks: Record<string, TaskCompletion>
): TaskDefinition[] {
  return getMandatoryTasks().filter((task) => !tasks[task.id]?.completed);
}

/**
 * Validate task completion (for tasks requiring numeric values)
 */
export function validateTaskCompletion(
  task: TaskDefinition,
  value?: number
): { valid: boolean; message?: string } {
  if (task.requiresValue && task.targetValue) {
    if (value === undefined || value === null) {
      return { valid: false, message: `Please enter ${task.valueLabel}` };
    }
    if (value < 0) {
      return { valid: false, message: 'Value cannot be negative' };
    }
    // For steps, we need to meet the target
    if (task.id === 'steps' && value < task.targetValue) {
      return { valid: false, message: `Need at least ${task.targetValue} steps` };
    }
    // For sleep, we need 7-8 hours
    if (task.id === 'sleep_duration' && (value < 7 || value > 9)) {
      return { valid: false, message: 'Sleep should be between 7-8 hours' };
    }
  }
  
  return { valid: true };
}
