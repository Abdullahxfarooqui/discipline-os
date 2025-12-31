// Dashboard Page - Main daily view
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { Navigation } from '@/components/layout/Navigation';
import { DailyScoreCard, StreakCard, PenaltyCard, WeeklyOverview, PartnerCard } from '@/components/dashboard';
import { DailyTasksList } from '@/components/tasks';
import { getGreeting } from '@/lib/utils';
import { completePenalty } from '@/lib/firebase/database';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const {
    user,
    userProfile,
    todayRecord,
    todayDate,
    pendingPenalties,
    weeklyRecords,
    couplesCircle,
    partnerProgress,
    updateTaskCompletion,
    loadPenalties,
    initialize,
  } = useAppStore();
  
  // Initialize data when dashboard loads
  useEffect(() => {
    console.log('Dashboard: Initializing store');
    initialize();
  }, [initialize]);
  
  const handleTaskToggle = async (taskId: string, completed: boolean, value?: number) => {
    await updateTaskCompletion(taskId, completed, value);
    if (completed) {
      toast.success('Task completed!', { icon: '✅' });
    }
  };
  
  const handleCompletePenalty = async (penaltyId: string) => {
    if (!user) return;
    
    try {
      await completePenalty(user.uid, penaltyId);
      await loadPenalties();
      toast.success('Penalty completed. Keep going!', { icon: '💪' });
    } catch (error) {
      toast.error('Failed to complete penalty');
    }
  };
  
  if (!todayRecord || !userProfile) {
    return (
      <div className="min-h-screen bg-discipline-darker flex items-center justify-center">
        <div className="animate-pulse text-discipline-muted">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-discipline-darker">
      <Navigation />
      
      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {getGreeting()}, {userProfile.displayName?.split(' ')[0]}
            </h1>
            <p className="text-discipline-muted mt-1">
              Day starts at Fajr. No shortcuts. No excuses.
            </p>
          </motion.div>
          
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Daily Score */}
              <DailyScoreCard record={todayRecord} date={new Date()} />
              
              {/* Pending Penalties */}
              {pendingPenalties.length > 0 && (
                <PenaltyCard
                  penalties={pendingPenalties}
                  onCompletePenalty={handleCompletePenalty}
                />
              )}
              
              {/* Tasks */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-white mb-4">Today's Tasks</h2>
                <DailyTasksList
                  record={todayRecord}
                  onTaskToggle={handleTaskToggle}
                />
              </motion.div>
            </div>
            
            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Streak */}
              <StreakCard streak={userProfile.streak} />
              
              {/* Weekly Overview */}
              <WeeklyOverview records={weeklyRecords} />
              
              {/* Partner Progress */}
              <PartnerCard
                circle={couplesCircle}
                partner={partnerProgress}
                userScore={todayRecord.completionPercentage}
                userStreak={userProfile.streak.current}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
