// Penalty Engine - Penalty Assignment, Tracking, and Enforcement
// Handles automatic penalty assignment and enforcement logic

import {
  Penalty,
  PenaltyType,
  PenaltySeverity,
  PenaltyDefinition,
  PenaltyStatus,
  DayStatus,
  DailyRecord,
} from '@/types';
import { createPenalty, getPendingPenalties, completePenalty } from '../firebase/database';
import { findWeakestCategory } from './scoringEngine';

// ============================================
// PENALTY DEFINITIONS
// ============================================

export const PENALTY_DEFINITIONS: PenaltyDefinition[] = [
  // MINOR PENALTIES
  {
    type: 'extra_cardio',
    severity: 'minor',
    name: 'Extra Cardio',
    description: '30 minutes of additional cardio exercise',
    duration: 'Same day or next morning',
    icon: '🏃',
  },
  {
    type: 'cold_shower',
    severity: 'minor',
    name: 'Cold Shower',
    description: '3-minute cold shower (no warm water)',
    duration: 'Next morning',
    icon: '🚿',
  },
  {
    type: 'entertainment_restriction',
    severity: 'minor',
    name: 'Entertainment Restriction',
    description: 'No entertainment (TV, games, streaming) for 24 hours',
    duration: '24 hours',
    icon: '📺',
  },
  {
    type: 'social_media_lockout',
    severity: 'minor',
    name: 'Social Media Lockout',
    description: 'No social media access for 24 hours',
    duration: '24 hours',
    icon: '📱',
  },
  
  // MAJOR PENALTIES
  {
    type: 'full_entertainment_ban',
    severity: 'major',
    name: 'Full Entertainment Ban',
    description: 'Complete ban on all entertainment for 48 hours',
    duration: '48 hours',
    icon: '🚫',
  },
  {
    type: 'extra_workout',
    severity: 'major',
    name: 'Extra Full Workout',
    description: 'Additional full workout session (not just cardio)',
    duration: 'Within 24 hours',
    icon: '💪',
  },
  {
    type: 'charity_donation',
    severity: 'major',
    name: 'Mandatory Charity',
    description: 'Donate predetermined amount to charity',
    duration: 'Same day',
    icon: '💝',
  },
  {
    type: 'earlier_wakeup',
    severity: 'major',
    name: 'Earlier Wake-up',
    description: 'Wake up 1 hour earlier than usual for 3 days',
    duration: '3 days',
    icon: '⏰',
  },
];

// ============================================
// PENALTY SELECTION LOGIC
// ============================================

/**
 * Get available penalties by severity
 */
export function getPenaltiesBySeverity(severity: PenaltySeverity): PenaltyDefinition[] {
  return PENALTY_DEFINITIONS.filter((p) => p.severity === severity);
}

/**
 * Select appropriate penalty based on failure severity and context
 */
export function selectPenalty(
  severity: PenaltySeverity,
  record: DailyRecord,
  recentPenalties: Penalty[] = []
): PenaltyDefinition {
  const availablePenalties = getPenaltiesBySeverity(severity);
  
  // Avoid repeating the same penalty consecutively
  const recentTypes = recentPenalties
    .slice(0, 3)
    .map((p) => p.type);
  
  const nonRepeatedPenalties = availablePenalties.filter(
    (p) => !recentTypes.includes(p.type)
  );
  
  // If all penalties have been used recently, use any
  const penaltyPool = nonRepeatedPenalties.length > 0 
    ? nonRepeatedPenalties 
    : availablePenalties;
  
  // Weight selection based on weakest category
  const weakestCategory = findWeakestCategory(record.tasks);
  
  // Prefer relevant penalties
  let selectedPenalty: PenaltyDefinition;
  
  if (weakestCategory === 'health' || weakestCategory === 'sleep') {
    // Physical penalties for health/sleep failures
    selectedPenalty = penaltyPool.find(
      (p) => p.type === 'extra_cardio' || p.type === 'extra_workout' || p.type === 'earlier_wakeup'
    ) || penaltyPool[0];
  } else if (weakestCategory === 'digital') {
    // Digital penalties for digital discipline failures
    selectedPenalty = penaltyPool.find(
      (p) => p.type === 'social_media_lockout' || p.type === 'entertainment_restriction'
    ) || penaltyPool[0];
  } else if (weakestCategory === 'deen') {
    // Charity for deen-related failures
    selectedPenalty = penaltyPool.find(
      (p) => p.type === 'charity_donation'
    ) || penaltyPool[0];
  } else {
    // Random selection for other categories
    const randomIndex = Math.floor(Math.random() * penaltyPool.length);
    selectedPenalty = penaltyPool[randomIndex];
  }
  
  return selectedPenalty;
}

/**
 * Create and assign a penalty for a failed day
 */
export async function assignPenalty(
  userId: string,
  record: DailyRecord,
  recentPenalties: Penalty[] = []
): Promise<Penalty> {
  // Determine severity based on score
  const severity: PenaltySeverity = record.completionPercentage < 35 ? 'major' : 'minor';
  
  // Select appropriate penalty
  const penaltyDef = selectPenalty(severity, record, recentPenalties);
  
  // Create penalty object
  const penalty: Omit<Penalty, 'id'> = {
    userId,
    date: record.date,
    type: penaltyDef.type,
    severity,
    description: penaltyDef.description,
    status: 'pending',
    createdAt: new Date(),
  };
  
  // Save to database
  const penaltyId = await createPenalty(userId, penalty);
  
  return {
    id: penaltyId,
    ...penalty,
  };
}

/**
 * Check if user has pending penalties that block certain actions
 */
export async function hasPendingPenalties(userId: string): Promise<boolean> {
  const pending = await getPendingPenalties(userId);
  return pending.length > 0;
}

/**
 * Get penalty definition by type
 */
export function getPenaltyDefinition(type: PenaltyType): PenaltyDefinition | undefined {
  return PENALTY_DEFINITIONS.find((p) => p.type === type);
}

/**
 * Mark a penalty as completed
 */
export async function markPenaltyComplete(
  userId: string,
  penaltyId: string
): Promise<void> {
  await completePenalty(userId, penaltyId);
}

/**
 * Calculate penalty streak (consecutive days with penalties)
 */
export function calculatePenaltyStreak(penalties: Penalty[]): number {
  if (penalties.length === 0) return 0;
  
  // Sort by date descending
  const sorted = [...penalties].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const currentDate = new Date(sorted[i].date);
    const prevDate = new Date(sorted[i - 1].date);
    const diffDays = Math.floor(
      (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Check if penalties are escalating (multiple consecutive failures)
 */
export function shouldEscalatePenalty(penalties: Penalty[]): boolean {
  const recentPenalties = penalties.filter((p) => {
    const penaltyDate = new Date(p.date);
    const daysAgo = Math.floor(
      (Date.now() - penaltyDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysAgo <= 7; // Last 7 days
  });
  
  return recentPenalties.length >= 3;
}

/**
 * Get penalty status display info
 */
export function getPenaltyStatusInfo(status: PenaltyStatus): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        color: 'text-warning',
        bgColor: 'bg-warning-bg',
      };
    case 'completed':
      return {
        label: 'Completed',
        color: 'text-safe',
        bgColor: 'bg-safe-bg',
      };
    case 'waived':
      return {
        label: 'Waived',
        color: 'text-discipline-muted',
        bgColor: 'bg-discipline-card',
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-discipline-muted',
        bgColor: 'bg-discipline-card',
      };
  }
}

/**
 * Format penalty for display
 */
export function formatPenaltyDisplay(penalty: Penalty): {
  title: string;
  description: string;
  icon: string;
  severity: string;
  duration: string;
} {
  const definition = getPenaltyDefinition(penalty.type);
  
  return {
    title: definition?.name || penalty.type,
    description: penalty.description,
    icon: definition?.icon || '⚠️',
    severity: penalty.severity === 'major' ? 'Major' : 'Minor',
    duration: definition?.duration || 'As specified',
  };
}

/**
 * Validate if a penalty can be edited by partner
 */
export function canPartnerEditPenalty(penalty: Penalty): boolean {
  // Can only edit pending penalties
  if (penalty.status !== 'pending') return false;
  
  // Can only edit once
  if (penalty.editedBy === 'partner') return false;
  
  return true;
}

/**
 * Get suggested alternative penalties (for couples editing)
 */
export function getSuggestedAlternatives(
  currentPenalty: Penalty
): PenaltyDefinition[] {
  // Get penalties of same severity that are different
  return PENALTY_DEFINITIONS.filter(
    (p) => p.severity === currentPenalty.severity && p.type !== currentPenalty.type
  );
}
