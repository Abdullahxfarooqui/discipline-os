// Weekly Overview Card - Shows last 7 days progress
'use client';

import { motion } from 'framer-motion';
import { DailyRecord, DayStatus } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { getStatusEmoji, getStatusBackground } from '@/lib/engines/scoringEngine';
import { cn } from '@/lib/utils';
import { format, subDays, isSameDay } from 'date-fns';

interface WeeklyOverviewProps {
  records: DailyRecord[];
}

export function WeeklyOverview({ records }: WeeklyOverviewProps) {
  // Generate last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = records.find((r) => r.date === dateStr);
    
    return {
      date,
      dateStr,
      dayName: format(date, 'EEE'),
      dayNum: format(date, 'd'),
      record,
      isToday: isSameDay(date, new Date()),
    };
  });
  
  const safeDays = records.filter((r) => r.status === 'safe').length;
  const avgScore = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + r.completionPercentage, 0) / records.length)
    : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
      </CardHeader>
      
      {/* Day Boxes */}
      <div className="flex justify-between gap-2">
        {days.map((day, i) => (
          <motion.div
            key={day.dateStr}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'flex-1 flex flex-col items-center p-2 rounded-lg border',
              day.isToday && 'ring-2 ring-accent-primary',
              day.record
                ? getStatusBackground(day.record.status)
                : 'bg-discipline-dark border-discipline-border'
            )}
          >
            <span className="text-xs text-discipline-muted">{day.dayName}</span>
            <span className="text-lg font-semibold text-white mt-1">{day.dayNum}</span>
            <span className="text-lg mt-1">
              {day.record ? getStatusEmoji(day.record.status) : '⚪'}
            </span>
            {day.record && (
              <span className="text-xs text-discipline-muted mt-1">
                {day.record.completionPercentage}%
              </span>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-discipline-dark rounded-lg text-center">
          <p className="text-2xl font-bold text-safe">{safeDays}</p>
          <p className="text-xs text-discipline-muted">Safe Days</p>
        </div>
        <div className="p-3 bg-discipline-dark rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{avgScore}%</p>
          <p className="text-xs text-discipline-muted">Avg Score</p>
        </div>
      </div>
    </Card>
  );
}
