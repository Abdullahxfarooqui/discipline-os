// Partner Card - Couples accountability display
'use client';

import { motion } from 'framer-motion';
import { Users, Flame, TrendingUp, Trophy } from 'lucide-react';
import { PartnerProgress, CouplesCircle } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { getStatusEmoji } from '@/lib/engines/scoringEngine';
import { cn } from '@/lib/utils';

interface PartnerCardProps {
  circle: CouplesCircle | null;
  partner: PartnerProgress | null;
  userScore: number;
  userStreak: number;
}

export function PartnerCard({ circle, partner, userScore, userStreak }: PartnerCardProps) {
  if (!circle || !partner) {
    return (
      <Card>
        <div className="text-center py-6">
          <Users className="w-12 h-12 text-discipline-muted mx-auto mb-3" />
          <h3 className="font-semibold text-white">Couples Accountability</h3>
          <p className="text-sm text-discipline-muted mt-1">
            Invite your partner to join your accountability circle
          </p>
        </div>
      </Card>
    );
  }
  
  const isAhead = userScore > partner.todayScore;
  const isTied = userScore === partner.todayScore;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent-primary" />
          Partner Progress
        </CardTitle>
      </CardHeader>
      
      <div className="space-y-4">
        {/* Partner Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <span className="text-xl font-bold text-accent-primary">
              {partner.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-white">{partner.displayName}</h4>
            <div className="flex items-center gap-2 text-sm text-discipline-muted">
              {getStatusEmoji(partner.todayStatus)}
              <span>Today's Status</span>
            </div>
          </div>
        </div>
        
        {/* Comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* You */}
          <div className={cn(
            'p-3 rounded-lg border text-center',
            isAhead ? 'bg-safe-bg/50 border-safe-muted' : 'bg-discipline-dark border-discipline-border'
          )}>
            <p className="text-xs text-discipline-muted mb-1">You</p>
            <p className="text-2xl font-bold text-white">{userScore}%</p>
            <div className="flex items-center justify-center gap-1 text-xs text-discipline-muted mt-1">
              <Flame className="w-3 h-3" />
              {userStreak} day streak
            </div>
          </div>
          
          {/* Partner */}
          <div className={cn(
            'p-3 rounded-lg border text-center',
            !isAhead && !isTied ? 'bg-safe-bg/50 border-safe-muted' : 'bg-discipline-dark border-discipline-border'
          )}>
            <p className="text-xs text-discipline-muted mb-1">{partner.displayName}</p>
            <p className="text-2xl font-bold text-white">{partner.todayScore}%</p>
            <div className="flex items-center justify-center gap-1 text-xs text-discipline-muted mt-1">
              <Flame className="w-3 h-3" />
              {partner.currentStreak} day streak
            </div>
          </div>
        </div>
        
        {/* Status Message */}
        <div className={cn(
          'p-3 rounded-lg',
          isAhead
            ? 'bg-safe-bg/30 border border-safe-muted/30'
            : isTied
              ? 'bg-accent-primary/10 border border-accent-primary/30'
              : 'bg-warning-bg/30 border border-warning-muted/30'
        )}>
          <p className="text-sm">
            {isAhead ? (
              <span className="text-safe">You're ahead today! Keep pushing 💪</span>
            ) : isTied ? (
              <span className="text-accent-primary">Neck and neck! Both doing great 🤝</span>
            ) : (
              <span className="text-warning">Partner is ahead! Time to catch up 🔥</span>
            )}
          </p>
        </div>
        
        {/* Partner Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-discipline-dark rounded">
            <p className="text-lg font-semibold text-white">{partner.tasksCompleted}</p>
            <p className="text-xs text-discipline-muted">Tasks Done</p>
          </div>
          <div className="p-2 bg-discipline-dark rounded">
            <p className="text-lg font-semibold text-white">{partner.currentStreak}</p>
            <p className="text-xs text-discipline-muted">Current</p>
          </div>
          <div className="p-2 bg-discipline-dark rounded">
            <p className="text-lg font-semibold text-white">{partner.longestStreak}</p>
            <p className="text-xs text-discipline-muted">Best</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
