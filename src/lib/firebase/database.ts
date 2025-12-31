// Firebase Realtime Database Operations
// All database read/write operations for the discipline system

import {
  ref,
  get,
  set,
  update,
  remove,
  push,
  query,
  orderByChild,
  equalTo,
  onValue,
  off,
  DataSnapshot,
} from 'firebase/database';
import { rtdb } from './config';
import {
  UserProfile,
  DailyRecord,
  TaskCompletion,
  Penalty,
  Reward,
  CouplesCircle,
  WeeklyAnalytics,
  MonthlyAnalytics,
} from '@/types';

// ============================================
// USER PROFILE OPERATIONS
// ============================================

export async function createUserProfile(
  userId: string,
  profile: Omit<UserProfile, 'id'>
): Promise<void> {
  const userRef = ref(rtdb, `users/${userId}`);
  await set(userRef, {
    ...profile,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = ref(rtdb, `users/${userId}`);
  const snapshot = await get(userRef);
  
  if (!snapshot.exists()) return null;
  
  const data = snapshot.val();
  return {
    id: userId,
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
  } as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = ref(rtdb, `users/${userId}`);
  await update(userRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeToUserProfile(
  userId: string,
  callback: (profile: UserProfile | null) => void
): () => void {
  const userRef = ref(rtdb, `users/${userId}`);
  
  const listener = onValue(userRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    const data = snapshot.val();
    callback({
      id: userId,
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    } as UserProfile);
  });
  
  return () => off(userRef, 'value', listener);
}

// ============================================
// DAILY RECORD OPERATIONS
// ============================================

export async function getDailyRecord(
  userId: string,
  date: string
): Promise<DailyRecord | null> {
  const recordRef = ref(rtdb, `dailyRecords/${userId}/${date}`);
  const snapshot = await get(recordRef);
  
  if (!snapshot.exists()) return null;
  
  const data = snapshot.val();
  return {
    id: date,
    ...data,
  } as DailyRecord;
}

export async function createDailyRecord(
  userId: string,
  date: string,
  record: Omit<DailyRecord, 'id'>
): Promise<void> {
  const recordRef = ref(rtdb, `dailyRecords/${userId}/${date}`);
  await set(recordRef, {
    ...record,
    createdAt: new Date().toISOString(),
  });
}

export async function updateDailyRecord(
  userId: string,
  date: string,
  updates: Partial<DailyRecord>
): Promise<void> {
  const recordRef = ref(rtdb, `dailyRecords/${userId}/${date}`);
  await update(recordRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeToDailyRecord(
  userId: string,
  date: string,
  callback: (record: DailyRecord | null) => void
): () => void {
  const recordRef = ref(rtdb, `dailyRecords/${userId}/${date}`);
  
  const listener = onValue(recordRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({
      id: date,
      ...snapshot.val(),
    } as DailyRecord);
  });
  
  return () => off(recordRef, 'value', listener);
}

export async function getDailyRecordsRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyRecord[]> {
  const recordsRef = ref(rtdb, `dailyRecords/${userId}`);
  const snapshot = await get(recordsRef);
  
  if (!snapshot.exists()) return [];
  
  const records: DailyRecord[] = [];
  snapshot.forEach((child) => {
    const date = child.key;
    if (date && date >= startDate && date <= endDate) {
      records.push({
        id: date,
        ...child.val(),
      } as DailyRecord);
    }
  });
  
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

// ============================================
// TASK COMPLETION OPERATIONS
// ============================================

// Helper function to remove undefined values from an object
function removeUndefined(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
}

export async function updateTaskCompletion(
  userId: string,
  date: string,
  taskId: string,
  completion: Partial<TaskCompletion>
): Promise<void> {
  const taskRef = ref(rtdb, `dailyRecords/${userId}/${date}/tasks/${taskId}`);
  const cleanData = removeUndefined({
    ...completion,
    updatedAt: new Date().toISOString(),
  });
  await update(taskRef, cleanData);
}

export async function batchUpdateTaskCompletions(
  userId: string,
  date: string,
  completions: Record<string, Partial<TaskCompletion>>
): Promise<void> {
  const updates: Record<string, any> = {};
  
  Object.entries(completions).forEach(([taskId, completion]) => {
    updates[`dailyRecords/${userId}/${date}/tasks/${taskId}`] = removeUndefined({
      ...completion,
      updatedAt: new Date().toISOString(),
    });
  });
  
  await update(ref(rtdb), updates);
}

// ============================================
// PENALTY OPERATIONS
// ============================================

export async function createPenalty(
  userId: string,
  penalty: Omit<Penalty, 'id'>
): Promise<string> {
  const penaltiesRef = ref(rtdb, `penalties/${userId}`);
  const newPenaltyRef = push(penaltiesRef);
  await set(newPenaltyRef, {
    ...penalty,
    createdAt: new Date().toISOString(),
  });
  return newPenaltyRef.key!;
}

export async function getPendingPenalties(userId: string): Promise<Penalty[]> {
  const penaltiesRef = ref(rtdb, `penalties/${userId}`);
  const snapshot = await get(penaltiesRef);
  
  if (!snapshot.exists()) return [];
  
  const penalties: Penalty[] = [];
  snapshot.forEach((child) => {
    const data = child.val();
    if (data.status === 'pending') {
      penalties.push({
        id: child.key!,
        ...data,
        createdAt: new Date(data.createdAt),
      } as Penalty);
    }
  });
  
  return penalties.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function completePenalty(
  userId: string,
  penaltyId: string
): Promise<void> {
  const penaltyRef = ref(rtdb, `penalties/${userId}/${penaltyId}`);
  await update(penaltyRef, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
}

export async function getPenaltyHistory(
  userId: string,
  limitCount: number = 50
): Promise<Penalty[]> {
  const penaltiesRef = ref(rtdb, `penalties/${userId}`);
  const snapshot = await get(penaltiesRef);
  
  if (!snapshot.exists()) return [];
  
  const penalties: Penalty[] = [];
  snapshot.forEach((child) => {
    penalties.push({
      id: child.key!,
      ...child.val(),
      createdAt: new Date(child.val().createdAt),
    } as Penalty);
  });
  
  return penalties
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limitCount);
}

// ============================================
// REWARD OPERATIONS
// ============================================

export async function createReward(
  userId: string,
  reward: Omit<Reward, 'id'>
): Promise<string> {
  const rewardsRef = ref(rtdb, `rewards/${userId}`);
  const newRewardRef = push(rewardsRef);
  await set(newRewardRef, {
    ...reward,
    createdAt: new Date().toISOString(),
  });
  return newRewardRef.key!;
}

export async function getClaimableRewards(userId: string): Promise<Reward[]> {
  const rewardsRef = ref(rtdb, `rewards/${userId}`);
  const snapshot = await get(rewardsRef);
  
  if (!snapshot.exists()) return [];
  
  const rewards: Reward[] = [];
  snapshot.forEach((child) => {
    const data = child.val();
    if (data.status === 'claimable') {
      rewards.push({
        id: child.key!,
        ...data,
        createdAt: new Date(data.createdAt),
      } as Reward);
    }
  });
  
  return rewards.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function claimReward(
  userId: string,
  rewardId: string
): Promise<void> {
  const rewardRef = ref(rtdb, `rewards/${userId}/${rewardId}`);
  await update(rewardRef, {
    status: 'claimed',
    claimedAt: new Date().toISOString(),
  });
}

// ============================================
// COUPLES CIRCLE OPERATIONS
// ============================================

export async function createCouplesCircle(
  creatorId: string,
  name: string
): Promise<string> {
  // Generate 6-character invite code
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const circlesRef = ref(rtdb, 'couplesCircles');
  const newCircleRef = push(circlesRef);
  const circleId = newCircleRef.key!;
  
  await set(newCircleRef, {
    name,
    members: { [creatorId]: true },
    membersList: [creatorId],
    inviteCode,
    createdAt: new Date().toISOString(),
    createdBy: creatorId,
    sharedStreak: 0,
  });
  
  // Update creator's profile
  await updateUserProfile(creatorId, { couplesCircle: circleId });
  
  return circleId;
}

export async function joinCouplesCircle(
  userId: string,
  inviteCode: string
): Promise<string> {
  // Find circle by invite code
  const circlesRef = ref(rtdb, 'couplesCircles');
  const snapshot = await get(circlesRef);
  
  if (!snapshot.exists()) {
    throw new Error('Invalid invite code');
  }
  
  let foundCircleId: string | null = null;
  let foundCircleData: any = null;
  
  snapshot.forEach((child) => {
    const data = child.val();
    if (data.inviteCode === inviteCode) {
      foundCircleId = child.key;
      foundCircleData = data;
    }
  });
  
  if (!foundCircleId || !foundCircleData) {
    throw new Error('Invalid invite code');
  }
  
  const membersList = foundCircleData.membersList || [];
  
  if (membersList.length >= 2) {
    throw new Error('Circle is already full');
  }
  
  if (membersList.includes(userId)) {
    throw new Error('You are already in this circle');
  }
  
  // Add user to circle
  const circleRef = ref(rtdb, `couplesCircles/${foundCircleId}`);
  await update(circleRef, {
    [`members/${userId}`]: true,
    membersList: [...membersList, userId],
  });
  
  // Update user's profile
  await updateUserProfile(userId, { couplesCircle: foundCircleId });
  
  return foundCircleId;
}

export async function getCouplesCircle(
  circleId: string
): Promise<CouplesCircle | null> {
  const circleRef = ref(rtdb, `couplesCircles/${circleId}`);
  const snapshot = await get(circleRef);
  
  if (!snapshot.exists()) return null;
  
  const data = snapshot.val();
  return {
    id: circleId,
    name: data.name,
    members: data.membersList || [],
    inviteCode: data.inviteCode,
    createdAt: new Date(data.createdAt),
    createdBy: data.createdBy,
    sharedStreak: data.sharedStreak || 0,
    mutualChallenges: data.mutualChallenges || [],
  } as CouplesCircle;
}

export function subscribeToCouplesCircle(
  circleId: string,
  callback: (circle: CouplesCircle | null) => void
): () => void {
  const circleRef = ref(rtdb, `couplesCircles/${circleId}`);
  
  const listener = onValue(circleRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    const data = snapshot.val();
    callback({
      id: circleId,
      name: data.name,
      members: data.membersList || [],
      inviteCode: data.inviteCode,
      createdAt: new Date(data.createdAt),
      createdBy: data.createdBy,
      sharedStreak: data.sharedStreak || 0,
      mutualChallenges: data.mutualChallenges || [],
    } as CouplesCircle);
  });
  
  return () => off(circleRef, 'value', listener);
}

export async function getPartnerProfile(
  userId: string,
  circleId: string
): Promise<UserProfile | null> {
  const circle = await getCouplesCircle(circleId);
  if (!circle) return null;
  
  const partnerId = circle.members.find((id) => id !== userId);
  if (!partnerId) return null;
  
  return getUserProfile(partnerId);
}

export async function editPartnerPenalty(
  circleId: string,
  penaltyId: string,
  partnerId: string,
  edits: { type?: string; description?: string }
): Promise<void> {
  // Verify circle membership
  const circle = await getCouplesCircle(circleId);
  if (!circle) throw new Error('Circle not found');
  
  const penaltyRef = ref(rtdb, `penalties/${partnerId}/${penaltyId}`);
  await update(penaltyRef, {
    ...edits,
    editedBy: 'partner',
    editedAt: new Date().toISOString(),
  });
}

export async function leaveCouplesCircle(
  userId: string,
  circleId: string
): Promise<void> {
  const circleRef = ref(rtdb, `couplesCircles/${circleId}`);
  const snapshot = await get(circleRef);
  
  if (!snapshot.exists()) throw new Error('Circle not found');
  
  const data = snapshot.val();
  const membersList = data.membersList || [];
  
  // Remove user from circle
  const newMembersList = membersList.filter((id: string) => id !== userId);
  
  if (newMembersList.length === 0) {
    // Delete circle if empty
    await remove(circleRef);
  } else {
    await update(circleRef, {
      [`members/${userId}`]: null,
      membersList: newMembersList,
    });
  }
  
  // Update user's profile
  await updateUserProfile(userId, { couplesCircle: null });
}

// ============================================
// ANALYTICS OPERATIONS
// ============================================

export async function saveWeeklyAnalytics(
  userId: string,
  weekId: string,
  analytics: Omit<WeeklyAnalytics, 'id'>
): Promise<void> {
  const analyticsRef = ref(rtdb, `analytics/${userId}/weekly/${weekId}`);
  await set(analyticsRef, analytics);
}

export async function getWeeklyAnalytics(
  userId: string,
  weekId: string
): Promise<WeeklyAnalytics | null> {
  const analyticsRef = ref(rtdb, `analytics/${userId}/weekly/${weekId}`);
  const snapshot = await get(analyticsRef);
  
  if (!snapshot.exists()) return null;
  
  return {
    id: weekId,
    ...snapshot.val(),
  } as WeeklyAnalytics;
}

export async function saveMonthlyAnalytics(
  userId: string,
  monthId: string,
  analytics: Omit<MonthlyAnalytics, 'id'>
): Promise<void> {
  const analyticsRef = ref(rtdb, `analytics/${userId}/monthly/${monthId}`);
  await set(analyticsRef, analytics);
}

export async function getMonthlyAnalytics(
  userId: string,
  monthId: string
): Promise<MonthlyAnalytics | null> {
  const analyticsRef = ref(rtdb, `analytics/${userId}/monthly/${monthId}`);
  const snapshot = await get(analyticsRef);
  
  if (!snapshot.exists()) return null;
  
  return {
    id: monthId,
    ...snapshot.val(),
  } as MonthlyAnalytics;
}

// ============================================
// STREAK OPERATIONS
// ============================================

export async function updateStreak(
  userId: string,
  isSafeDay: boolean,
  date: string
): Promise<{ current: number; longest: number }> {
  const userRef = ref(rtdb, `users/${userId}`);
  const snapshot = await get(userRef);
  
  if (!snapshot.exists()) throw new Error('User not found');
  
  const userData = snapshot.val();
  const currentStreak = userData.streak || { current: 0, longest: 0, lastSafeDate: null };
  
  let newStreak = { ...currentStreak };
  
  if (isSafeDay) {
    newStreak.current = currentStreak.current + 1;
    newStreak.lastSafeDate = date;
    if (newStreak.current > newStreak.longest) {
      newStreak.longest = newStreak.current;
    }
  } else {
    newStreak.current = 0;
    newStreak.lastSafeDate = null;
  }
  
  await update(userRef, { streak: newStreak });
  
  return newStreak;
}
