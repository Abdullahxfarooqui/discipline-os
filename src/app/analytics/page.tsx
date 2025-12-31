// Analytics Page - Weekly and monthly insights
'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { DailyRecord, TaskCategory } from '@/types';
import { CATEGORY_INFO } from '@/lib/engines/taskEngine';
import {
  generateWeeklyAnalytics,
  generateHeatmapData,
  getHeatmapColor,
} from '@/lib/engines/analyticsEngine';
import { getDailyRecordsRange } from '@/lib/firebase/database';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

type TimeRange = 'week' | 'month' | '90days';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user, userProfile, weeklyRecords } = useAppStore();
  
  // Load historical records
  useEffect(() => {
    async function loadRecords() {
      if (!user) return;
      
      setLoading(true);
      const endDate = format(new Date(), 'yyyy-MM-dd');
      let startDate: string;
      
      switch (timeRange) {
        case 'week':
          startDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');
          break;
        case 'month':
          startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
          break;
        case '90days':
          startDate = format(subDays(new Date(), 89), 'yyyy-MM-dd');
          break;
      }
      
      try {
        const data = await getDailyRecordsRange(user.uid, startDate, endDate);
        setRecords(data);
      } catch (error) {
        console.error('Failed to load records:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadRecords();
  }, [user, timeRange]);
  
  // Calculate analytics
  const analytics = useMemo(() => {
    if (records.length === 0) {
      return {
        averageScore: 0,
        safeDays: 0,
        warningDays: 0,
        failureDays: 0,
        totalDays: 0,
        trend: 'stable' as const,
        categoryBreakdown: {} as Record<TaskCategory, { completed: number; total: number; rate: number }>,
        weakestCategory: null as TaskCategory | null,
        strongestCategory: null as TaskCategory | null,
      };
    }
    
    const scores = records.map((r) => r.completionPercentage);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    const safeDays = records.filter((r) => r.status === 'safe').length;
    const warningDays = records.filter((r) => r.status === 'warning').length;
    const failureDays = records.filter((r) => r.status === 'failure').length;
    
    // Calculate trend
    const midpoint = Math.floor(records.length / 2);
    const firstHalf = records.slice(0, midpoint);
    const secondHalf = records.slice(midpoint);
    
    const firstAvg = firstHalf.reduce((sum, r) => sum + r.completionPercentage, 0) / (firstHalf.length || 1);
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.completionPercentage, 0) / (secondHalf.length || 1);
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondAvg - firstAvg > 5) trend = 'improving';
    if (firstAvg - secondAvg > 5) trend = 'declining';
    
    // Category breakdown
    const categoryBreakdown: Record<TaskCategory, { completed: number; total: number; rate: number }> = {
      deen: { completed: 0, total: 0, rate: 0 },
      health: { completed: 0, total: 0, rate: 0 },
      sleep: { completed: 0, total: 0, rate: 0 },
      nutrition: { completed: 0, total: 0, rate: 0 },
      productivity: { completed: 0, total: 0, rate: 0 },
      mental: { completed: 0, total: 0, rate: 0 },
      digital: { completed: 0, total: 0, rate: 0 },
      deen_upgrade: { completed: 0, total: 0, rate: 0 },
    };
    
    records.forEach((record) => {
      Object.entries(record.tasks).forEach(([taskId, completion]) => {
        // Determine category from task ID
        let category: TaskCategory = 'productivity';
        if (taskId.includes('fajr') || taskId.includes('zuhr') || taskId.includes('asr') || 
            taskId.includes('maghrib') || taskId.includes('isha')) {
          category = 'deen';
        } else if (taskId.includes('workout') || taskId.includes('steps') || taskId.includes('mobility')) {
          category = 'health';
        } else if (taskId.includes('sleep') || taskId.includes('phone_before_bed')) {
          category = 'sleep';
        } else if (taskId.includes('calor') || taskId.includes('junk') || taskId.includes('water')) {
          category = 'nutrition';
        } else if (taskId.includes('mood') || taskId.includes('gratitude') || taskId.includes('journal')) {
          category = 'mental';
        } else if (taskId.includes('screen') || taskId.includes('social')) {
          category = 'digital';
        } else if (taskId.includes('quran') || taskId.includes('dhikr') || taskId.includes('charity')) {
          category = 'deen_upgrade';
        }
        
        categoryBreakdown[category].total++;
        if (completion.completed) {
          categoryBreakdown[category].completed++;
        }
      });
    });
    
    // Calculate rates
    Object.keys(categoryBreakdown).forEach((cat) => {
      const category = cat as TaskCategory;
      if (categoryBreakdown[category].total > 0) {
        categoryBreakdown[category].rate = Math.round(
          (categoryBreakdown[category].completed / categoryBreakdown[category].total) * 100
        );
      }
    });
    
    // Find weakest and strongest
    const categories = Object.entries(categoryBreakdown)
      .filter(([cat]) => cat !== 'deen_upgrade' && categoryBreakdown[cat as TaskCategory].total > 0)
      .sort((a, b) => a[1].rate - b[1].rate);
    
    const weakestCategory = categories[0]?.[0] as TaskCategory | null;
    const strongestCategory = categories[categories.length - 1]?.[0] as TaskCategory | null;
    
    return {
      averageScore,
      safeDays,
      warningDays,
      failureDays,
      totalDays: records.length,
      trend,
      categoryBreakdown,
      weakestCategory,
      strongestCategory,
    };
  }, [records]);
  
  // Heatmap data
  const heatmapData = useMemo(() => {
    return generateHeatmapData(records, timeRange === '90days' ? 90 : timeRange === 'month' ? 30 : 7);
  }, [records, timeRange]);
  
  return (
    <div className="min-h-screen bg-discipline-darker">
      <Navigation />
      
      <main className="md:ml-64 pt-16 md:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-accent-primary" />
              Analytics
            </h1>
            <p className="text-discipline-muted mt-1">
              Blunt, factual insights into your discipline patterns
            </p>
          </motion.div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 mb-6">
            {(['week', 'month', '90days'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : '90 Days'}
              </Button>
            ))}
          </div>
          
          {loading ? (
            <div className="text-center py-20 text-discipline-muted">
              Loading analytics...
            </div>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card animate={false}>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{analytics.averageScore}%</p>
                    <p className="text-sm text-discipline-muted mt-1">Average Score</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {analytics.trend === 'improving' && (
                        <Badge variant="safe" size="sm">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Improving
                        </Badge>
                      )}
                      {analytics.trend === 'declining' && (
                        <Badge variant="failure" size="sm">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Declining
                        </Badge>
                      )}
                      {analytics.trend === 'stable' && (
                        <Badge variant="muted" size="sm">Stable</Badge>
                      )}
                    </div>
                  </div>
                </Card>
                
                <Card animate={false} variant="safe">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-safe">{analytics.safeDays}</p>
                    <p className="text-sm text-discipline-muted mt-1">Safe Days</p>
                  </div>
                </Card>
                
                <Card animate={false} variant="warning">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-warning">{analytics.warningDays}</p>
                    <p className="text-sm text-discipline-muted mt-1">Warning Days</p>
                  </div>
                </Card>
                
                <Card animate={false} variant="failure">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-failure">{analytics.failureDays}</p>
                    <p className="text-sm text-discipline-muted mt-1">Failed Days</p>
                  </div>
                </Card>
              </div>
              
              {/* Heatmap */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Activity Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {heatmapData.map((day) => (
                      <div
                        key={day.date}
                        className="w-4 h-4 rounded-sm cursor-pointer"
                        style={{ backgroundColor: getHeatmapColor(day.score, day.status) }}
                        title={`${day.date}: ${day.score}%`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-discipline-muted">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm bg-[#991b1b]" />
                      Low
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm bg-[#f59e0b]" />
                      Warning
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm bg-[#22c55e]" />
                      Safe
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Category Performance */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Category Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.categoryBreakdown)
                      .filter(([cat]) => cat !== 'deen_upgrade')
                      .map(([category, data]) => {
                        const info = CATEGORY_INFO[category as TaskCategory];
                        const isWeakest = category === analytics.weakestCategory;
                        const isStrongest = category === analytics.strongestCategory;
                        
                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span>{info.icon}</span>
                                <span className="text-white font-medium">{info.name}</span>
                                {isWeakest && (
                                  <Badge variant="failure" size="sm">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Focus Area
                                  </Badge>
                                )}
                                {isStrongest && (
                                  <Badge variant="safe" size="sm">
                                    <Award className="w-3 h-3 mr-1" />
                                    Strongest
                                  </Badge>
                                )}
                              </div>
                              <span className="text-discipline-muted text-sm">
                                {data.completed}/{data.total} ({data.rate}%)
                              </span>
                            </div>
                            <Progress
                              value={data.rate}
                              variant={
                                data.rate >= 80 ? 'safe' :
                                data.rate >= 60 ? 'warning' : 'failure'
                              }
                            />
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
              
              {/* Insight */}
              {analytics.weakestCategory && (
                <Card variant="warning">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white">Enforced Improvement Area</h3>
                      <p className="text-discipline-muted mt-1">
                        Your weakest category is <strong className="text-white">
                          {CATEGORY_INFO[analytics.weakestCategory].name}
                        </strong> at {analytics.categoryBreakdown[analytics.weakestCategory].rate}% completion.
                        This is your priority focus for the next {timeRange === 'week' ? 'week' : 'month'}.
                      </p>
                      <p className="text-sm text-warning mt-3">
                        💡 Suggestion: Set specific reminders and remove obstacles for this category.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
