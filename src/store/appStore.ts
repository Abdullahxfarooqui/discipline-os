// Global State Management with Zustand
// Manages application state, user data, and real-time subscriptions

import { create } from 'zustand';
import { User } from 'firebase/auth';
import {
  UserProfile,
  DailyRecord,
  Penalty,
  Reward,
  CouplesCircle,
  PartnerProgress,
  DayStatus,
} from '@/types';
import {
  subscribeToAuthChanges,
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signOut as firebaseSignOut,
  signInWithGoogle,
} from '@/lib/firebase/auth';
import {
  getUserProfile,
  createUserProfile,
  subscribeToUserProfile,
  subscribeToDailyRecord,
  getPendingPenalties,
  getClaimableRewards,
  getCouplesCircle,
  getPartnerProfile,
  getDailyRecord,
  updateTaskCompletion as updateTaskInDB,
  createDailyRecord,
  updateDailyRecord,
  getDailyRecordsRange,
} from '@/lib/firebase/database';
import {
  createEmptyDailyRecord,
} from '@/lib/engines/taskEngine';
import {
  calculateEarnedPoints,
  updateDailyRecordScores,
  generateDailyVerdict,
} from '@/lib/engines/scoringEngine';
import { format, subDays } from 'date-fns';

// ============================================
// STORE TYPES
// ============================================

interface AppStore {
  // Auth state
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Daily state
  todayRecord: DailyRecord | null;
  todayDate: string;
  
  // Penalties & Rewards
  pendingPenalties: Penalty[];
  claimableRewards: Reward[];
  
  // Couples
  couplesCircle: CouplesCircle | null;
  partnerProgress: PartnerProgress | null;
  
  // Weekly data
  weeklyRecords: DailyRecord[];
  
  // Actions - Auth
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // Setters
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setCouplesCircle: (circle: CouplesCircle | null) => void;
  
  // Actions - Daily Record
  loadTodayRecord: () => Promise<void>;
  updateTaskCompletion: (taskId: string, completed: boolean, value?: number) => Promise<void>;
  refreshDailyScores: () => void;
  endDay: () => Promise<void>;
  
  // Actions - Data Loading
  loadPenalties: () => Promise<void>;
  loadRewards: () => Promise<void>;
  loadCouplesData: () => Promise<void>;
  loadWeeklyRecords: () => Promise<void>;
  
  // Subscriptions
  unsubscribers: (() => void)[];
  cleanup: () => void;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  user: null,
  userProfile: null,
  isLoading: true,
  isInitialized: false,
  
  todayRecord: null,
  todayDate: format(new Date(), 'yyyy-MM-dd'),
  
  pendingPenalties: [],
  claimableRewards: [],
  
  couplesCircle: null,
  partnerProgress: null,
  
  weeklyRecords: [],
  
  unsubscribers: [],
  
  // Initialize app and auth listener
  initialize: async () => {
    const unsubAuth = subscribeToAuthChanges(async (user) => {
      if (user) {
        console.log('Auth state changed: User logged in', user.uid);
        set({ user, isLoading: true });
        
        try {
          // Load user profile
          let profile = await getUserProfile(user.uid);
          console.log('User profile loaded:', profile ? 'found' : 'not found');
          
          // Create profile if it doesn't exist
          if (!profile) {
            console.log('Creating new user profile...');
            const newProfile: Omit<UserProfile, 'id'> = {
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              couplesCircle: null,
              streak: {
                current: 0,
                longest: 0,
                lastSafeDate: null,
              },
              settings: {
                fajrTime: '05:30',
                sleepTarget: '22:30',
                targetWakeTime: '05:30',
                dailyCalorieTarget: 2000,
                dailyWaterTarget: 8,
                dailyStepsTarget: 10000,
                screenTimeLimit: 120,
                notifications: {
                  morning: true,
                  evening: true,
                  reminders: true,
                  partnerUpdates: true,
                },
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
              createdAt: new Date(),
            };
            // Only add photoURL if it exists (Firebase RTDB doesn't allow undefined)
            if (user.photoURL) {
              (newProfile as any).photoURL = user.photoURL;
            }
            await createUserProfile(user.uid, newProfile);
            profile = { id: user.uid, ...newProfile };
            console.log('User profile created successfully');
          }
          
          set({ userProfile: profile });
          
          // Load today's record (don't fail if this errors)
          try {
            await get().loadTodayRecord();
          } catch (e) {
            console.error('Failed to load today record:', e);
          }
          
          // Load penalties and rewards (non-critical)
          try {
            await get().loadPenalties();
          } catch (e) {
            console.error('Failed to load penalties:', e);
          }
          
          try {
            await get().loadRewards();
          } catch (e) {
            console.error('Failed to load rewards:', e);
          }
          
          // Load couples data if applicable
          if (profile?.couplesCircle) {
            try {
              await get().loadCouplesData();
            } catch (e) {
              console.error('Failed to load couples data:', e);
            }
          }
          
          // Load weekly records (non-critical)
          try {
            await get().loadWeeklyRecords();
          } catch (e) {
            console.error('Failed to load weekly records:', e);
          }
          
          // Subscribe to profile updates
          try {
            const unsubProfile = subscribeToUserProfile(user.uid, (updatedProfile) => {
              set({ userProfile: updatedProfile });
            });
            
            // Subscribe to today's record
            const todayDate = format(new Date(), 'yyyy-MM-dd');
            const unsubDaily = subscribeToDailyRecord(user.uid, todayDate, (record) => {
              if (record) {
                set({ todayRecord: record });
              }
            });
            
            set((state) => ({
              unsubscribers: [...state.unsubscribers, unsubProfile, unsubDaily],
            }));
          } catch (e) {
            console.error('Failed to set up subscriptions:', e);
          }
        } catch (e) {
          console.error('Error during initialization:', e);
        }
        
        console.log('Initialization complete');
        set({ isLoading: false, isInitialized: true });
      } else {
        // User signed out
        get().cleanup();
        set({
          user: null,
          userProfile: null,
          todayRecord: null,
          pendingPenalties: [],
          claimableRewards: [],
          couplesCircle: null,
          partnerProgress: null,
          weeklyRecords: [],
          isLoading: false,
          isInitialized: true,
        });
      }
    });
    
    set((state) => ({
      unsubscribers: [...state.unsubscribers, unsubAuth],
    }));
  },
  
  // Auth actions
  signIn: async (email, password) => {
    try {
      await firebaseSignIn(email, password);
      // Auth state change will trigger initialize() which handles loading state
    } catch (error) {
      throw error;
    }
  },
  
  signUp: async (email, password, displayName) => {
    try {
      await firebaseSignUp(email, password, displayName);
      // Auth state change will trigger initialize() which handles loading state
    } catch (error) {
      throw error;
    }
  },
  
  signInWithGoogle: async () => {
    try {
      await signInWithGoogle();
      // Auth state change will trigger initialize() which handles loading state
    } catch (error) {
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      await firebaseSignOut();
      // Auth state change will trigger initialize() which handles loading state
    } catch (error) {
      throw error;
    }
  },
  
  // Setters
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setCouplesCircle: (circle) => set({ couplesCircle: circle }),
  
  // Daily record actions
  loadTodayRecord: async () => {
    const { user } = get();
    if (!user) {
      console.log('loadTodayRecord: No user');
      return;
    }
    
    const todayDate = format(new Date(), 'yyyy-MM-dd');
    set({ todayDate });
    
    console.log('Loading today record for:', todayDate);
    
    try {
      let record = await getDailyRecord(user.uid, todayDate);
      console.log('Existing record:', record ? 'found' : 'not found');
      
      if (!record) {
        // Create new daily record
        console.log('Creating new daily record');
        const newRecord = createEmptyDailyRecord(user.uid, new Date());
        await createDailyRecord(user.uid, todayDate, newRecord);
        record = await getDailyRecord(user.uid, todayDate);
        console.log('New record created:', record ? 'success' : 'failed');
      }
      
      set({ todayRecord: record });
    } catch (error) {
      console.error('loadTodayRecord error:', error);
      // Set empty record to prevent UI issues
      set({ todayRecord: null });
    }
  },
  
  updateTaskCompletion: async (taskId, completed, value) => {
    const { user, todayRecord, todayDate } = get();
    if (!user || !todayRecord) return;
    
    // Optimistic update
    const updatedTasks = {
      ...todayRecord.tasks,
      [taskId]: {
        ...todayRecord.tasks[taskId],
        taskId,
        completed,
        value,
        completedAt: completed ? new Date() : undefined,
        updatedAt: new Date(),
      },
    };
    
    const updatedRecord = updateDailyRecordScores({
      ...todayRecord,
      tasks: updatedTasks,
    });
    
    set({ todayRecord: updatedRecord });
    
    // Persist to database
    await updateTaskInDB(user.uid, todayDate, taskId, {
      taskId,
      completed,
      value,
      completedAt: completed ? new Date() : undefined,
    });
    
    // Update scores in database
    await updateDailyRecord(user.uid, todayDate, {
      earnedPoints: updatedRecord.earnedPoints,
      completionPercentage: updatedRecord.completionPercentage,
    });
  },
  
  refreshDailyScores: () => {
    const { todayRecord } = get();
    if (!todayRecord) return;
    
    const updatedRecord = updateDailyRecordScores(todayRecord);
    set({ todayRecord: updatedRecord });
  },
  
  endDay: async () => {
    const { user, todayRecord, todayDate } = get();
    if (!user || !todayRecord) return;
    
    // Generate verdict
    const verdict = generateDailyVerdict(todayRecord);
    
    // Update record with final status
    const finalRecord: Partial<DailyRecord> = {
      status: verdict.status,
      dayEndedAt: new Date(),
      verdictGeneratedAt: new Date(),
    };
    
    await updateDailyRecord(user.uid, todayDate, finalRecord);
    
    // Handle penalties/rewards based on verdict
    // This will be handled by cloud functions in production
    // For now, we'll update locally
    
    set((state) => ({
      todayRecord: state.todayRecord ? { ...state.todayRecord, ...finalRecord } : null,
    }));
  },
  
  // Data loading actions
  loadPenalties: async () => {
    const { user } = get();
    if (!user) return;
    
    const penalties = await getPendingPenalties(user.uid);
    set({ pendingPenalties: penalties });
  },
  
  loadRewards: async () => {
    const { user } = get();
    if (!user) return;
    
    const rewards = await getClaimableRewards(user.uid);
    set({ claimableRewards: rewards });
  },
  
  loadCouplesData: async () => {
    const { user, userProfile } = get();
    if (!user || !userProfile?.couplesCircle) return;
    
    const circle = await getCouplesCircle(userProfile.couplesCircle);
    if (!circle) return;
    
    set({ couplesCircle: circle });
    
    // Load partner data
    const partnerId = circle.members.find((id) => id !== user.uid);
    if (partnerId) {
      const partnerProfile = await getUserProfile(partnerId);
      const partnerTodayRecord = await getDailyRecord(
        partnerId,
        format(new Date(), 'yyyy-MM-dd')
      );
      
      if (partnerProfile) {
        const partnerProgress: PartnerProgress = {
          partnerId,
          displayName: partnerProfile.displayName,
          photoURL: partnerProfile.photoURL,
          todayScore: partnerTodayRecord?.completionPercentage || 0,
          todayStatus: partnerTodayRecord?.status || 'pending',
          currentStreak: partnerProfile.streak.current,
          longestStreak: partnerProfile.streak.longest,
          weeklyAverage: 0, // Calculate from records
          tasksCompleted: Object.values(partnerTodayRecord?.tasks || {}).filter(
            (t) => t.completed
          ).length,
          totalTasks: Object.keys(partnerTodayRecord?.tasks || {}).length,
        };
        
        set({ partnerProgress });
      }
    }
  },
  
  loadWeeklyRecords: async () => {
    const { user } = get();
    if (!user) return;
    
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');
    
    const records = await getDailyRecordsRange(user.uid, startDate, endDate);
    set({ weeklyRecords: records });
  },
  
  // Cleanup
  cleanup: () => {
    const { unsubscribers } = get();
    unsubscribers.forEach((unsub) => unsub());
    set({ unsubscribers: [] });
  },
}));

// ============================================
// SELECTORS
// ============================================

export const selectUser = (state: AppStore) => state.user;
export const selectUserProfile = (state: AppStore) => state.userProfile;
export const selectIsLoading = (state: AppStore) => state.isLoading;
export const selectIsInitialized = (state: AppStore) => state.isInitialized;
export const selectTodayRecord = (state: AppStore) => state.todayRecord;
export const selectPendingPenalties = (state: AppStore) => state.pendingPenalties;
export const selectClaimableRewards = (state: AppStore) => state.claimableRewards;
export const selectCouplesCircle = (state: AppStore) => state.couplesCircle;
export const selectPartnerProgress = (state: AppStore) => state.partnerProgress;
export const selectWeeklyRecords = (state: AppStore) => state.weeklyRecords;

// Computed selectors
export const selectTodayProgress = (state: AppStore) => {
  const record = state.todayRecord;
  if (!record) return { completed: 0, total: 0, percentage: 0 };
  
  const completed = Object.values(record.tasks).filter((t) => t.completed).length;
  const total = Object.keys(record.tasks).length;
  const percentage = record.completionPercentage;
  
  return { completed, total, percentage };
};

export const selectStreakData = (state: AppStore) => {
  return state.userProfile?.streak || { current: 0, longest: 0, lastSafeDate: null };
};

export const selectHasPendingPenalties = (state: AppStore) => {
  return state.pendingPenalties.length > 0;
};
