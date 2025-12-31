// Streak Card - Displays current streak and progress to next milestone
'use client';

import { motion } from 'framer-motion';
import { Flame, Trophy, Target } from 'lucide-react';
import { StreakData } from '@/types';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import {
  formatStreakDisplay,
  getMilestoneProgress,
  getStreakStatusMessage,
  getStreakColor,
} from '@/lib/engines/streakEngine';
import { cn } from '@/lib/utils';

interface StreakCardProps {
  streak: StreakData;
}

export function StreakCard({ streak }: StreakCardProps) {
  const display = formatStreakDisplay(streak.current);
  const milestoneProgress = getMilestoneProgress(streak.current);
  const statusMessage = getStreakStatusMessage(streak.current);
  const streakColor = getStreakColor(streak.current);
  
  return (
    <Card className="relative overflow-hidden">
      {/* Fire Background Effect */}
      {streak.current > 0 && (
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full h-full bg-gradient-radial from-orange-500 to-transparent rounded-full"
          />
        </div>
      )}
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-discipline-muted flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Current Streak
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <motion.span
                className={cn('text-4xl font-bold', streakColor)}
                key={streak.current}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {display.value}
              </motion.span>
              <span className="text-discipline-muted">{display.label}</span>
              <span className="text-2xl">{display.emoji}</span>
            </div>
          </div>
          
          {/* Longest Streak */}
          <div className="text-right">
            <p className="text-xs text-discipline-muted flex items-center gap-1 justify-end">
              <Trophy className="w-3 h-3" />
              Best
            </p>
            <p className="text-lg font-semibold text-white">
              {streak.longest} days
            </p>
          </div>
        </div>
        
        {/* Milestone Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-discipline-muted flex items-center gap-1">
              <Target className="w-4 h-4" />
              Next Milestone
            </span>
            <span className="text-white font-medium">
              {milestoneProgress.current}/{milestoneProgress.next} days
            </span>
          </div>
          <Progress
            value={milestoneProgress.progress}
            variant={streak.current >= 7 ? 'safe' : 'default'}
          />
        </div>
        
        {/* Status Message */}
        <div className="mt-4 p-3 bg-discipline-dark rounded-lg">
          <p className="text-sm text-discipline-muted">{statusMessage}</p>
        </div>
        
        {/* Milestone Markers */}
        <div className="mt-4 flex items-center justify-between">
          {[3, 7, 14, 30].map((milestone) => (
            <div
              key={milestone}
              className={cn(
                'flex flex-col items-center',
                streak.current >= milestone
                  ? 'text-safe'
                  : 'text-discipline-muted'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                  streak.current >= milestone
                    ? 'bg-safe-bg border border-safe'
                    : 'bg-discipline-border border border-discipline-border'
                )}
              >
                {milestone}
              </div>
              <span className="text-xs mt-1">days</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
