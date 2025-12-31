// Firestore Database Operations
// All database read/write operations for the discipline system

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { db } from './config';
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
import { format } from 'date-fns';

// ============================================
// USER PROFILE OPERATIONS
// ============================================

export async function createUserProfile(
  userId: string,
  profile: Omit<UserProfile, 'id'>
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...profile,
    createdAt: Timestamp.fromDate(profile.createdAt),
    updatedAt: Timestamp.now(),
  });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', userId);
  const snapshot = await getDoc(userRef);
  
  if (!snapshot.exists()) return null;
  
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export function subscribeToUserProfile(
  userId: string,
  callback: (profile: UserProfile | null) => void
): () => void {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    const data = snapshot.data();
    callback({
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UserProfile);
  });
}

// ============================================
// DAILY RECORD OPERATIONS
// ============================================

export async function getDailyRecord(
  userId: string,
  date: string
): Promise<DailyRecord | null> {
  const recordRef = doc(db, 'users', userId, 'dailyRecords', date);
  const snapshot = await getDoc(recordRef);
  
  if (!snapshot.exists()) return null;
  
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as DailyRecord;
}

export async function createDailyRecord(
  userId: string,
  date: string,
  record: Omit<DailyRecord, 'id'>
): Promise<void> {
  const recordRef = doc(db, 'users', userId, 'dailyRecords', date);
  await setDoc(recordRef, {
    ...record,
    createdAt: Timestamp.now(),
  });
}

export async function updateDailyRecord(
  userId: string,
  date: string,
  updates: Partial<DailyRecord>
): Promise<void> {
  const recordRef = doc(db, 'users', userId, 'dailyRecords', date);
  await updateDoc(recordRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export function subscribeToDailyRecord(
  userId: string,
  date: string,
  callback: (record: DailyRecord | null) => void
): () => void {
  const recordRef = doc(db, 'users', userId, 'dailyRecords', date);
  return onSnapshot(recordRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({
      id: snapshot.id,
      ...snapshot.data(),
    } as DailyRecord);
  });
}

export async function getDailyRecordsRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyRecord[]> {
  const recordsRef = collection(db, 'users', userId, 'dailyRecords');
  const q = query(
    recordsRef,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as DailyRecord[];
}

// ============================================
// TASK COMPLETION OPERATIONS
// ============================================

export async function updateTaskCompletion(
  userId: string,
  date: string,
  taskId: string,
  completion: Partial<TaskCompletion>
): Promise<void> {
  const recordRef = doc(db, 'users', userId, 'dailyRecords', date);
  const record = await getDoc(recordRef);
  
  if (!record.exists()) {
    throw new Error('Daily record not found');
  }
  
  const tasks = record.data().tasks || {};
  tasks[taskId] = {
    ...tasks[taskId],
    ...completion,
    updatedAt: Timestamp.now(),
  };
  
  await updateDoc(recordRef, { tasks, updatedAt: Timestamp.now() });
}

export async function batchUpdateTaskCompletions(
  userId: string,
  date: string,
  completions: Record<string, Partial<TaskCompletion>>
): Promise<void> {
  const recordRef = doc(db, 'users', userId, 'dailyRecords', date);
  const record = await getDoc(recordRef);
  
  if (!record.exists()) {
    throw new Error('Daily record not found');
  }
  
  const tasks = record.data().tasks || {};
  
  Object.entries(completions).forEach(([taskId, completion]) => {
    tasks[taskId] = {
      ...tasks[taskId],
      ...completion,
      updatedAt: Timestamp.now(),
    };
  });
  
  await updateDoc(recordRef, { tasks, updatedAt: Timestamp.now() });
}

// ============================================
// PENALTY OPERATIONS
// ============================================

export async function createPenalty(
  userId: string,
  penalty: Omit<Penalty, 'id'>
): Promise<string> {
  const penaltiesRef = collection(db, 'users', userId, 'penalties');
  const penaltyRef = doc(penaltiesRef);
  await setDoc(penaltyRef, {
    ...penalty,
    createdAt: Timestamp.now(),
  });
  return penaltyRef.id;
}

export async function getPendingPenalties(userId: string): Promise<Penalty[]> {
  const penaltiesRef = collection(db, 'users', userId, 'penalties');
  const q = query(
    penaltiesRef,
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Penalty[];
}

export async function completePenalty(
  userId: string,
  penaltyId: string
): Promise<void> {
  const penaltyRef = doc(db, 'users', userId, 'penalties', penaltyId);
  await updateDoc(penaltyRef, {
    status: 'completed',
    completedAt: Timestamp.now(),
  });
}

export async function getPenaltyHistory(
  userId: string,
  limitCount: number = 50
): Promise<Penalty[]> {
  const penaltiesRef = collection(db, 'users', userId, 'penalties');
  const q = query(penaltiesRef, orderBy('createdAt', 'desc'), limit(limitCount));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Penalty[];
}

// ============================================
// REWARD OPERATIONS
// ============================================

export async function createReward(
  userId: string,
  reward: Omit<Reward, 'id'>
): Promise<string> {
  const rewardsRef = collection(db, 'users', userId, 'rewards');
  const rewardRef = doc(rewardsRef);
  await setDoc(rewardRef, {
    ...reward,
    createdAt: Timestamp.now(),
  });
  return rewardRef.id;
}

export async function getClaimableRewards(userId: string): Promise<Reward[]> {
  const rewardsRef = collection(db, 'users', userId, 'rewards');
  const q = query(
    rewardsRef,
    where('status', '==', 'claimable'),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Reward[];
}

export async function claimReward(
  userId: string,
  rewardId: string
): Promise<void> {
  const rewardRef = doc(db, 'users', userId, 'rewards', rewardId);
  await updateDoc(rewardRef, {
    status: 'claimed',
    claimedAt: Timestamp.now(),
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
  
  const circleRef = doc(collection(db, 'couplesCircles'));
  await setDoc(circleRef, {
    name,
    members: [creatorId],
    inviteCode,
    createdAt: Timestamp.now(),
    createdBy: creatorId,
    sharedStreak: 0,
  });
  
  // Update creator's profile
  await updateUserProfile(creatorId, { couplesCircle: circleRef.id });
  
  return circleRef.id;
}

export async function joinCouplesCircle(
  userId: string,
  inviteCode: string
): Promise<string> {
  // Find circle by invite code
  const circlesRef = collection(db, 'couplesCircles');
  const q = query(circlesRef, where('inviteCode', '==', inviteCode));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    throw new Error('Invalid invite code');
  }
  
  const circleDoc = snapshot.docs[0];
  const circleData = circleDoc.data();
  
  if (circleData.members.length >= 2) {
    throw new Error('Circle is already full');
  }
  
  if (circleData.members.includes(userId)) {
    throw new Error('You are already in this circle');
  }
  
  // Add user to circle
  await updateDoc(circleDoc.ref, {
    members: arrayUnion(userId),
  });
  
  // Update user's profile
  await updateUserProfile(userId, { couplesCircle: circleDoc.id });
  
  return circleDoc.id;
}

export async function getCouplesCircle(
  circleId: string
): Promise<CouplesCircle | null> {
  const circleRef = doc(db, 'couplesCircles', circleId);
  const snapshot = await getDoc(circleRef);
  
  if (!snapshot.exists()) return null;
  
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as CouplesCircle;
}

export function subscribeToCouplesCircle(
  circleId: string,
  callback: (circle: CouplesCircle | null) => void
): () => void {
  const circleRef = doc(db, 'couplesCircles', circleId);
  return onSnapshot(circleRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({
      id: snapshot.id,
      ...snapshot.data(),
    } as CouplesCircle);
  });
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
  
  const penaltyRef = doc(db, 'users', partnerId, 'penalties', penaltyId);
  const penalty = await getDoc(penaltyRef);
  
  if (!penalty.exists()) throw new Error('Penalty not found');
  
  await updateDoc(penaltyRef, {
    ...edits,
    editedBy: 'partner',
    editedAt: Timestamp.now(),
  });
}

export async function leaveCouplesCircle(
  userId: string,
  circleId: string
): Promise<void> {
  const circleRef = doc(db, 'couplesCircles', circleId);
  const circle = await getDoc(circleRef);
  
  if (!circle.exists()) throw new Error('Circle not found');
  
  const members = circle.data().members;
  
  // Remove user from circle
  await updateDoc(circleRef, {
    members: arrayRemove(userId),
  });
  
  // Update user's profile
  await updateUserProfile(userId, { couplesCircle: null });
  
  // If circle is empty, delete it
  if (members.length <= 1) {
    await deleteDoc(circleRef);
  }
}

// ============================================
// ANALYTICS OPERATIONS
// ============================================

export async function saveWeeklyAnalytics(
  userId: string,
  weekId: string,
  analytics: Omit<WeeklyAnalytics, 'id'>
): Promise<void> {
  const analyticsRef = doc(db, 'users', userId, 'weeklyAnalytics', weekId);
  await setDoc(analyticsRef, analytics);
}

export async function getWeeklyAnalytics(
  userId: string,
  weekId: string
): Promise<WeeklyAnalytics | null> {
  const analyticsRef = doc(db, 'users', userId, 'weeklyAnalytics', weekId);
  const snapshot = await getDoc(analyticsRef);
  
  if (!snapshot.exists()) return null;
  
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as WeeklyAnalytics;
}

export async function saveMonthlyAnalytics(
  userId: string,
  monthId: string,
  analytics: Omit<MonthlyAnalytics, 'id'>
): Promise<void> {
  const analyticsRef = doc(db, 'users', userId, 'monthlyAnalytics', monthId);
  await setDoc(analyticsRef, analytics);
}

export async function getMonthlyAnalytics(
  userId: string,
  monthId: string
): Promise<MonthlyAnalytics | null> {
  const analyticsRef = doc(db, 'users', userId, 'monthlyAnalytics', monthId);
  const snapshot = await getDoc(analyticsRef);
  
  if (!snapshot.exists()) return null;
  
  return {
    id: snapshot.id,
    ...snapshot.data(),
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
  const userRef = doc(db, 'users', userId);
  const user = await getDoc(userRef);
  
  if (!user.exists()) throw new Error('User not found');
  
  const currentStreak = user.data().streak || { current: 0, longest: 0, lastSafeDate: null };
  
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
  
  await updateDoc(userRef, { streak: newStreak });
  
  return newStreak;
}
