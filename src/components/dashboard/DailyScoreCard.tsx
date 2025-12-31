// Daily Score Card - Shows current day's progress and status
'use client';

import { motion } from 'framer-motion';
import { DailyRecord, DayStatus } from '@/types';
import { CircularProgress } from '@/components/ui/Progress';
import { Card } from '@/components/ui/Card';
import { getStatusEmoji, getStatusColor, calculateSafeThreshold } from '@/lib/engines/scoringEngine';
import { getMandatoryTasks } from '@/lib/engines/taskEngine';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

interface DailyScoreCardProps {
  record: DailyRecord;
  date: Date;
}

export function DailyScoreCard({ record, date }: DailyScoreCardProps) {
  const mandatoryTasks = getMandatoryTasks();
  const threshold = calculateSafeThreshold(mandatoryTasks.length);
  
  const completedTasks = Object.values(record.tasks).filter((t) => t.completed).length;
  const totalTasks = Object.keys(record.tasks).length;
  
  const getVariant = (status: DayStatus) => {
    switch (status) {
      case 'safe': return 'safe';
      case 'warning': return 'warning';
      case 'failure': return 'failure';
      default: return 'default';
    }
  };
  
  const statusMessages = {
    safe: 'Day Passed',
    warning: 'Warning Zone',
    failure: 'Day Failed',
    pending: 'In Progress',
  };
  
  return (
    <Card className="relative overflow-hidden">
      {/* Background Gradient */}
      <div
        className={cn(
          'absolute inset-0 opacity-10',
          record.status === 'safe' && 'bg-gradient-to-br from-safe to-transparent',
          record.status === 'warning' && 'bg-gradient-to-br from-warning to-transparent',
          record.status === 'failure' && 'bg-gradient-to-br from-failure to-transparent'
        )}
      />
      
      <div className="relative flex flex-col sm:flex-row items-center gap-6">
        {/* Circular Progress */}
        <CircularProgress
          value={record.completionPercentage}
          variant={getVariant(record.status)}
          size={140}
          strokeWidth={10}
          label="Complete"
        />
        
        {/* Stats */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-discipline-muted text-sm">{formatDate(date)}</p>
          
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
            <span className="text-2xl">{getStatusEmoji(record.status)}</span>
            <h2 className={cn('text-2xl font-bold', getStatusColor(record.status))}>
              {statusMessages[record.status]}
            </h2>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-white">{completedTasks}</p>
              <p className="text-xs text-discipline-muted">Tasks Done</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{record.earnedPoints}</p>
              <p className="text-xs text-discipline-muted">Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{threshold}%</p>
              <p className="text-xs text-discipline-muted">Safe Threshold</p>
            </div>
          </div>
          
          {/* Progress to Safe */}
          {record.status === 'pending' && record.completionPercentage < threshold && (
            <div className="mt-4 p-3 bg-discipline-dark rounded-lg">
              <p className="text-sm text-discipline-muted">
                Need <span className="text-white font-medium">{threshold - record.completionPercentage}%</span> more to reach safe zone
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
